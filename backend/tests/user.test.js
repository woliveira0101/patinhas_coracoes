const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/db');

let userToken;
let adminToken;
let testUser;
let adminUser;

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(async () => {
  // Create a regular user
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    phone_number: '1234567890',
    login: 'testuser',
    password: await bcrypt.hash('password123', 10),
    type: 'doador',
    is_active: true,
    is_admin: false,
  });
  userToken = generateToken(testUser);

  // Create an admin user
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    phone_number: '0987654321',
    login: 'adminuser',
    password: await bcrypt.hash('admin123', 10),
    type: 'ambos',
    is_active: true,
    is_admin: true,
  });
  adminToken = generateToken(adminUser);
});

afterEach(async () => {
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User API', () => {
  describe('POST /api/users', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'New User',
        email: 'new@example.com',
        phone_number: '5555555555',
        login: 'newuser',
        password: 'password123',
        type: 'doador',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('user_id');
      expect(res.body.data.email).toBe('new@example.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should not register a user with existing email', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'Test User',
        email: 'test@example.com',
        phone_number: '1234567890',
        login: 'differentlogin',
        password: 'password123',
        type: 'doador',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update current user profile', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
          phone_number: '9999999999',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.phone_number).toBe('9999999999');
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('should update current user password', async () => {
      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: 'password123',
          new_password: 'newpassword123',
          new_password_confirmation: 'newpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should reject with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword123',
          new_password_confirmation: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users (admin only)', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should reject non-admin users', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/users/:user_id', () => {
    it('should get user by ID (admin only)', async () => {
      const res = await request(app)
        .get(`/api/users/${testUser.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user_id).toBe(testUser.user_id);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/:user_id', () => {
    it('should update user (admin only)', async () => {
      const res = await request(app)
        .put(`/api/users/${testUser.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated Name',
          type: 'ambos',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Admin Updated Name');
      expect(res.body.data.type).toBe('ambos');
    });
  });

  describe('PATCH /api/users/:user_id/admin', () => {
    it('should promote user to admin (admin only)', async () => {
      const res = await request(app)
        .patch(`/api/users/${testUser.user_id}/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          is_admin: true,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.is_admin).toBe(true);
    });
  });

  describe('DELETE /api/users/:user_id', () => {
    it('should delete user (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/users/${testUser.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const deletedUser = await User.findByPk(testUser.user_id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
