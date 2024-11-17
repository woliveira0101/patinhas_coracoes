const request = require('supertest');
const app = require('../src/app');
const { User, Address } = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const { sequelize } = require('../src/config/db');

let userToken;
let adminToken;
let testUser;
let adminUser;
let testAddress;

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
    password: 'password123',
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
    password: 'admin123',
    type: 'ambos',
    is_active: true,
    is_admin: true,
  });
  adminToken = generateToken(adminUser);

  // Create a test address
  testAddress = await Address.create({
    user_id: testUser.user_id,
    zip_code: '12345-678',
    street_name: 'Test Street',
    address_number: '123',
    neighborhood: 'Test Neighborhood',
    city_name: 'Test City',
    state_name: 'SP',
  });
});

afterEach(async () => {
  await Address.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Address API', () => {
  describe('GET /api/users/:user_id/addresses', () => {
    it('should get user addresses', async () => {
      const res = await request(app)
        .get(`/api/users/${testUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow access to other user addresses', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        phone_number: '1112223333',
        login: 'otheruser',
        password: 'password123',
        type: 'adotante',
        is_active: true,
      });

      const res = await request(app)
        .get(`/api/users/${otherUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should validate user_id parameter', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id/addresses')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/users/:user_id/addresses', () => {
    it('should create address for user', async () => {
      const newAddress = {
        zip_code: '98765-432',
        street_name: 'User New Street',
        address_number: '789',
        neighborhood: 'User Neighborhood',
        city_name: 'User City',
        state_name: 'MG',
      };

      const res = await request(app)
        .post(`/api/users/${testUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAddress);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user_id).toBe(testUser.user_id);
      expect(res.body.data.zip_code).toBe('98765-432');
    });

    it('should validate zip_code format', async () => {
      const invalidAddress = {
        zip_code: '123456', // invalid format
        street_name: 'User New Street',
        address_number: '789',
        neighborhood: 'User Neighborhood',
        city_name: 'User City',
        state_name: 'MG',
      };

      const res = await request(app)
        .post(`/api/users/${testUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAddress);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('zip_code');
    });

    it('should validate state_name', async () => {
      const invalidAddress = {
        zip_code: '12345-678',
        street_name: 'User New Street',
        address_number: '789',
        neighborhood: 'User Neighborhood',
        city_name: 'User City',
        state_name: 'XX', // invalid state
      };

      const res = await request(app)
        .post(`/api/users/${testUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAddress);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('state_name');
    });

    it('should validate required fields', async () => {
      const invalidAddress = {
        zip_code: '12345-678',
        // missing required fields
      };

      const res = await request(app)
        .post(`/api/users/${testUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidAddress);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should not allow creating address for other users', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        phone_number: '1112223333',
        login: 'otheruser',
        password: 'password123',
        type: 'adotante',
        is_active: true,
      });

      const newAddress = {
        zip_code: '98765-432',
        street_name: 'User New Street',
        address_number: '789',
        neighborhood: 'User Neighborhood',
        city_name: 'User City',
        state_name: 'MG',
      };

      const res = await request(app)
        .post(`/api/users/${otherUser.user_id}/addresses`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAddress);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/addresses/:address_id', () => {
    it('should get address by ID', async () => {
      const res = await request(app)
        .get(`/api/addresses/${testAddress.address_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.address_id).toBe(testAddress.address_id);
    });

    it('should validate address_id parameter', async () => {
      const res = await request(app)
        .get('/api/addresses/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should return 404 for non-existent address', async () => {
      const res = await request(app)
        .get('/api/addresses/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/addresses/:address_id', () => {
    it('should update address', async () => {
      const updateData = {
        street_name: 'Updated Street',
        city_name: 'Updated City',
        state_name: 'MG',
      };

      const res = await request(app)
        .put(`/api/addresses/${testAddress.address_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.street_name).toBe('Updated Street');
      expect(res.body.data.city_name).toBe('Updated City');
      expect(res.body.data.state_name).toBe('MG');
    });

    it('should validate address_id parameter', async () => {
      const res = await request(app)
        .put('/api/addresses/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ street_name: 'Updated Street' });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should validate update data', async () => {
      const invalidData = {
        state_name: 'XX', // invalid state
      };

      const res = await request(app)
        .put(`/api/addresses/${testAddress.address_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('state_name');
    });

    it('should return 404 for non-existent address', async () => {
      const res = await request(app)
        .put('/api/addresses/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ street_name: 'Updated Street' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/addresses/:address_id', () => {
    it('should delete address', async () => {
      const res = await request(app)
        .delete(`/api/addresses/${testAddress.address_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const deletedAddress = await Address.findByPk(testAddress.address_id);
      expect(deletedAddress).toBeNull();
    });

    it('should validate address_id parameter', async () => {
      const res = await request(app)
        .delete('/api/addresses/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should return 404 for non-existent address', async () => {
      const res = await request(app)
        .delete('/api/addresses/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
