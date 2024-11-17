const request = require('supertest');
const app = require('../src/app');
const { User, Pet, PetImage } = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const { sequelize } = require('../src/config/db');
const storageService = require('../src/utils/storage');

// Mock storage service
jest.mock('../src/utils/storage', () => ({
  saveFile: jest.fn().mockResolvedValue('test-image-path.jpg'),
  deleteFile: jest.fn().mockResolvedValue(),
  getFileUrl: jest.fn(path => `http://example.com/${path}`),
}));

let userToken;
let adminToken;
let testUser;
let adminUser;
let testPet;
let testImage;

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

  // Create a test pet image
  testImage = await PetImage.create({
    pet_id: testPet.pet_id,
    image: 'test-image-path.jpg',
  });
});

afterEach(async () => {
  await PetImage.destroy({ where: {}, force: true });
  await Pet.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
  jest.clearAllMocks();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Pet API', () => {
  describe('POST /api/pets', () => {
    it('should create a new pet (admin only)', async () => {
      const newPet = {
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
      };

      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPet);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.pet_name).toBe('New Pet');
    });

    it('should reject creation without required fields', async () => {
      const invalidPet = {
        pet_name: 'Invalid Pet',
        // missing required fields
      };

      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPet);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/pets', () => {
    it('should get all pets with pagination', async () => {
      const res = await request(app).get('/api/pets').set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter pets by species case-insensitively', async () => {
      // Create pets with different species casings
      await Pet.create({
        pet_name: 'Dog 1',
        description: 'Test dog',
        species: 'CACHORRO',
        gender: 'macho',
        age: 2,
      });

      await Pet.create({
        pet_name: 'Dog 2',
        description: 'Test dog',
        species: 'Cachorro',
        gender: 'macho',
        age: 2,
      });

      const res = await request(app)
        .get('/api/pets?species=cachorro')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(pet => pet.species.toLowerCase() === 'cachorro')).toBe(true);
    });

    it('should filter pets by location case-insensitively', async () => {
      // Create pets with different location casings
      await Pet.create({
        pet_name: 'Pet SP 1',
        description: 'Test pet',
        species: 'cachorro',
        gender: 'macho',
        age: 2,
        state: 'SP',
        city: 'SAO PAULO',
      });

      await Pet.create({
        pet_name: 'Pet SP 2',
        description: 'Test pet',
        species: 'cachorro',
        gender: 'macho',
        age: 2,
        state: 'sp',
        city: 'Sao Paulo',
      });

      const res = await request(app)
        .get('/api/pets?state=SP&city=São Paulo')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(
        res.body.data.every(
          pet =>
            pet.state.toLowerCase() === 'sp' && pet.city.toLowerCase() === 'são paulo'.toLowerCase()
        )
      ).toBe(true);
    });

    it('should filter pets by adoption status', async () => {
      // Create pets with different adoption statuses
      await Pet.create({
        pet_name: 'Available Pet 1',
        description: 'Test pet',
        species: 'cachorro',
        gender: 'macho',
        age: 2,
        is_adopted: false,
      });

      await Pet.create({
        pet_name: 'Adopted Pet',
        description: 'Test pet',
        species: 'cachorro',
        gender: 'macho',
        age: 2,
        is_adopted: true,
      });

      await Pet.create({
        pet_name: 'Available Pet 2',
        description: 'Test pet',
        species: 'cachorro',
        gender: 'macho',
        age: 2,
        is_adopted: false,
      });

      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ status: 'disponivel' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(pet => !pet.is_adopted)).toBe(true);
    });
  });

  describe('GET /api/pets/:pet_id', () => {
    it('should get pet by ID with images', async () => {
      const res = await request(app)
        .get(`/api/pets/${testPet.pet_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.pet_id).toBe(testPet.pet_id);
      expect(res.body.data.PetImages).toBeDefined();
    });

    it('should return 404 for non-existent pet', async () => {
      const res = await request(app)
        .get('/api/pets/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/pets/:pet_id', () => {
    it('should update pet (admin only)', async () => {
      const updateData = {
        pet_name: 'Updated Pet Name',
        description: 'Updated description',
        species: 'gato',
        gender: 'femea',
        age: 3,
      };

      const res = await request(app)
        .put(`/api/pets/${testPet.pet_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.pet_name).toBe('Updated Pet Name');
      expect(res.body.data.species).toBe('gato');
      expect(res.body.data.gender).toBe('femea');
    });
  });

  describe('DELETE /api/pets/:pet_id', () => {
    it('should delete pet and associated images (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/pets/${testPet.pet_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      const deletedPet = await Pet.findByPk(testPet.pet_id);
      expect(deletedPet).toBeNull();

      const deletedImage = await PetImage.findByPk(testImage.image_id);
      expect(deletedImage).toBeNull();
    });
  });

  describe('GET /api/pets/:pet_id/images', () => {
    it('should get images for specific pet', async () => {
      const res = await request(app)
        .get(`/api/pets/${testPet.pet_id}/images`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/pets/:pet_id/images', () => {
    it('should add image to pet', async () => {
      const res = await request(app)
        .post(`/api/pets/${testPet.pet_id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg');

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.pet_id).toBe(testPet.pet_id);
      expect(storageService.saveFile).toHaveBeenCalled();
    });

    it('should reject without image file', async () => {
      const res = await request(app)
        .post(`/api/pets/${testPet.pet_id}/images`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/pets/:pet_id/images/:image_id', () => {
    it('should delete image (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/pets/${testPet.pet_id}/images/${testImage.image_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);
      expect(storageService.deleteFile).toHaveBeenCalled();

      const deletedImage = await PetImage.findByPk(testImage.image_id);
      expect(deletedImage).toBeNull();
    });
  });
});
