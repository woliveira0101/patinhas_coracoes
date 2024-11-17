const request = require('supertest');
const app = require('../src/app');
const { User, Pet, Donation } = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const { sequelize } = require('../src/config/db');

let userToken;
let adminToken;
let testUser;
let adminUser;
let testPet;
let testDonation;

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
    is_active: true,
    is_admin: true,
  });
  adminToken = generateToken(adminUser);

  // Create a test pet
  testPet = await Pet.create({
    pet_name: 'Test Pet',
    description: 'A test pet description',
    species: 'cachorro',
    gender: 'macho',
    breed: 'Mixed',
    age: 2,
    size: 'medio',
    colour: 'Brown',
    state: 'SP',
    city: 'São Paulo',
    vaccinated: true,
    castrated: true,
    vermifuged: true,
    is_adopted: false,
  });

  // Create a test donation
  testDonation = await Donation.create({
    user_id: testUser.user_id,
    pet_id: testPet.pet_id,
    donation_date: new Date(),
  });
});

afterEach(async () => {
  await Donation.destroy({ where: {}, force: true });
  await Pet.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Donation API', () => {
  describe('POST /api/donations', () => {
    it('should create a new donation', async () => {
      const newPet = await Pet.create({
        pet_name: 'New Pet',
        description: 'A new test pet',
        species: 'gato',
        gender: 'femea',
        breed: 'Siamese',
        age: 1,
        size: 'pequeno',
        colour: 'White',
        state: 'RJ',
        city: 'Rio de Janeiro',
      });

      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          pet_id: newPet.pet_id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user_id).toBe(testUser.user_id);
      expect(res.body.data.pet_id).toBe(newPet.pet_id);
      expect(res.body.data.Pet).toBeDefined();
      expect(res.body.data.User).toBeDefined();
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('pet_id');
    });

    it('should validate pet_id is a number', async () => {
      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          pet_id: 'invalid-id',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('pet_id');
    });

    it('should not create donation without authentication', async () => {
      const res = await request(app).post('/api/donations').send({
        pet_id: testPet.pet_id,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/donations', () => {
    it('should get all donations (admin only)', async () => {
      const res = await request(app)
        .get('/api/donations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should reject non-admin users', async () => {
      const res = await request(app)
        .get('/api/donations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should validate pagination parameters', async () => {
      const res = await request(app)
        .get('/api/donations?page=invalid&limit=invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/donations/user', () => {
    it('should get current user donations', async () => {
      const user = await createTestUser();
      const pet = await createTestPet();
      const token = generateToken(user);
      
      await createTestDonation({ 
        user_id: user.user_id,
        pet_id: pet.pet_id 
      });

      const response = await request(app)
        .get('/api/donations/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/donations/:donation_id', () => {
    it('should get donation by ID', async () => {
      const user = await createTestUser();
      const pet = await createTestPet();
      const token = generateToken(user);
      
      const donation = await createTestDonation({
        user_id: user.user_id,
        pet_id: pet.pet_id
      });

      const response = await request(app)
        .get(`/api/donations/${donation.donation_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.donation_id).toBe(donation.donation_id);
    });
  });

  describe('DELETE /api/donations/:donation_id', () => {
    it('should delete donation (admin only)', async () => {
      const adminUser = await createTestUser({ is_admin: true });
      const adminToken = generateToken(adminUser);
      
      // Criar um pet primeiro
      const pet = await createTestPet();
      
      // Criar uma doação com o pet
      const donation = await createTestDonation({
        user_id: adminUser.user_id,
        pet_id: pet.pet_id
      });

      const response = await request(app)
        .delete(`/api/donations/${donation.donation_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      // Verificar se a doação foi realmente deletada
      const deletedDonation = await Donation.findByPk(donation.donation_id);
      expect(deletedDonation).toBeNull();
    });
  });

  describe('GET /api/users/:user_id/donations', () => {
    it('should get user donations (admin)', async () => {
      const res = await request(app)
        .get(`/api/users/${testUser.user_id}/donations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should validate user_id parameter', async () => {
      const res = await request(app)
        .get('/api/users/invalid-id/donations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });

    it('should allow users to get their own donations', async () => {
      const res = await request(app)
        .get(`/api/users/${testUser.user_id}/donations`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should not allow users to get other users donations', async () => {
      // Criar dois usuários e seus pets
      const user1 = await createTestUser();
      const pet1 = await createTestPet();
      const user2 = await createTestUser();
      const pet2 = await createTestPet();
      
      // Criar doações para ambos os usuários
      await createTestDonation({ user_id: user1.user_id, pet_id: pet1.pet_id });
      await createTestDonation({ user_id: user2.user_id, pet_id: pet2.pet_id });
      
      const token1 = generateToken(user1);

      // Tentar acessar as doações do outro usuário
      const res = await request(app)
        .get(`/api/users/${user2.user_id}/donations`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Não autorizado');
    });
  });

  describe('POST /api/users/:user_id/donations', () => {
    it('should create donation for user (admin)', async () => {
      const newPet = await Pet.create({
        pet_name: 'Another Pet',
        description: 'Another test pet',
        species: 'cachorro',
        gender: 'macho',
        breed: 'Labrador',
        age: 3,
        size: 'grande',
        colour: 'Black',
        state: 'SP',
        city: 'São Paulo',
      });

      const res = await request(app)
        .post(`/api/users/${testUser.user_id}/donations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pet_id: newPet.pet_id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user_id).toBe(testUser.user_id);
      expect(res.body.data.pet_id).toBe(newPet.pet_id);
    });

    it('should validate user_id parameter', async () => {
      const res = await request(app)
        .post('/api/users/invalid-id/donations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pet_id: testPet.pet_id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/pets/:pet_id/donations', () => {
    it('should get pet donations', async () => {
      const res = await request(app)
        .get(`/api/pets/${testPet.pet_id}/donations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should validate pet_id parameter', async () => {
      const res = await request(app)
        .get('/api/pets/invalid-id/donations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/pets/:pet_id/donations/:donation_id', () => {
    it('should get specific pet donation', async () => {
      const res = await request(app)
        .get(`/api/pets/${testPet.pet_id}/donations/${testDonation.donation_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.donation_id).toBe(testDonation.donation_id);
      expect(res.body.data.pet_id).toBe(testPet.pet_id);
    });

    it('should validate pet_id and donation_id parameters', async () => {
      const res = await request(app)
        .get('/api/pets/invalid-pet-id/donations/invalid-donation-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 404 for non-matching pet and donation', async () => {
      const otherPet = await Pet.create({
        pet_name: 'Other Pet',
        description: 'Other test pet',
        species: 'gato',
        gender: 'femea',
        breed: 'Persian',
        age: 4,
        size: 'pequeno',
        colour: 'White',
        state: 'RJ',
        city: 'Rio de Janeiro',
      });

      const res = await request(app)
        .get(`/api/pets/${otherPet.pet_id}/donations/${testDonation.donation_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
