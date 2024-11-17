const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User } = require('../src/models');
const { sequelize } = require('../src/config/db');
const emailService = require('../src/services/emailService');
const logger = require('../src/utils/logger');

// Increase timeout for token validation tests
jest.setTimeout(60000);

// Mock both email service and logger
jest.mock('../src/services/emailService');
jest.mock('../src/utils/logger');

let testUser;
let adminUser;

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(async () => {
  // Primeiro, limpar o banco
  await User.destroy({ where: {}, truncate: true, cascade: true });

  // Reset all mocks
  jest.resetAllMocks();

  // Gerar timestamp único para cada execução
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  // Create a regular user with unique email
  testUser = await User.create({
    name: 'Test User',
    email: `test${timestamp}${random}@example.com`,
    phone_number: '1234567890',
    login: `testuser${timestamp}${random}`,
    password: await bcrypt.hash('password123', 10),
    type: 'doador',
    is_active: true,
    is_admin: false,
  });

  // Create an admin user with unique email
  adminUser = await User.create({
    name: 'Admin User',
    email: `admin${timestamp}${random}@example.com`,
    phone_number: '0987654321',
    login: `adminuser${timestamp}${random}`,
    password: await bcrypt.hash('admin123', 10),
    type: 'doador',
    is_active: true,
    is_admin: true,
  });

  // Set up email service mock with proper error handling
  emailService.sendPasswordResetEmail.mockImplementation(() => {
    if (process.env.MOCK_EMAIL_FAILURE === 'true') {
      throw new Error('Failed to send password reset email');
    }
    return Promise.resolve();
  });
});

afterEach(async () => {
  await User.destroy({ where: {}, force: true });
  jest.clearAllMocks();
  process.env.MOCK_EMAIL_FAILURE = 'false';
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials using login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        login: testUser.login,
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
    });

    it('should login with valid credentials using email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        login: testUser.email,
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        login: 'testuser',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        login: 'nonexistent',
        password: 'password123',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('should not register a user with existing email', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);

      // Criar um usuário com email único
      const existingUser = await User.create({
        name: 'Existing User',
        email: `existing${timestamp}${random}@example.com`,
        phone_number: '1234567890',
        login: `existinguser${timestamp}${random}`,
        password: await bcrypt.hash('password123', 10),
        type: 'doador',
        is_active: true,
        is_admin: false,
      });

      // Tentar criar outro usuário com o mesmo email
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: existingUser.email, // Using the same email as existingUser
          phone_number: '0987654321',
          login: `different${timestamp}${random}`,
          password: 'password123',
          type: 'doador',
          is_active: true,
          is_admin: false,
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Email já cadastrado');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid token', async () => {
      // First login to get a token
      const loginRes = await request(app).post('/api/auth/login').send({
        login: testUser.login,
        password: 'password123',
      });

      const token = loginRes.body.data.token;

      // Then try to refresh it
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('POST /api/auth/password/reset', () => {
    it('should request password reset with valid email', async () => {
      const res = await request(app).post('/api/auth/password/reset').send({
        email: testUser.email,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        testUser.email,
        expect.any(String)
      );
    });

    it('should handle email service errors', async () => {
      // Configure mock to fail
      process.env.MOCK_EMAIL_FAILURE = 'true';

      const res = await request(app).post('/api/auth/password/reset').send({
        email: testUser.email,
      });

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Erro ao enviar email de redefinição de senha');
    });
  });

  describe('POST /api/auth/password/reset/:token', () => {
    it('should reset password with valid token', async () => {
      const resetToken = jwt.sign({ id: testUser.user_id }, process.env.JWT_RESET_SECRET, {
        expiresIn: '1h',
      });

      const res = await request(app).post(`/api/auth/password/reset/${resetToken}`).send({
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify new password works
      const loginRes = await request(app).post('/api/auth/login').send({
        login: testUser.login,
        password: 'newpassword123',
      });

      expect(loginRes.statusCode).toBe(200);
    });

    it('should reject invalid reset token', async () => {
      const res = await request(app).post('/api/auth/password/reset/invalid-token').send({
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Token inválido ou expirado');
    }, 60000); // Add timeout specifically for this test

    it('should reject expired reset token', async () => {
      const expiredToken = jwt.sign({ id: testUser.user_id }, process.env.JWT_RESET_SECRET, {
        expiresIn: '0s',
      });

      const res = await request(app).post(`/api/auth/password/reset/${expiredToken}`).send({
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Token inválido ou expirado');
    }, 60000); // Add timeout specifically for this test

    it('should handle non-existent user', async () => {
      const token = jwt.sign({ id: 99999 }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });

      const res = await request(app).post(`/api/auth/password/reset/${token}`).send({
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
});
