const request = require('supertest');
const app = require('../src/app');
const {
  User,
  Pet,
  Adoption,
  Question,
  Answer,
  AdoptionQuestion,
  QuestionType,
} = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const { sequelize } = require('../src/config/db');

let userToken;
let adminToken;
let testUser;
let adminUser;
let testPet;
let testAdoption;
let testQuestion;
let testAnswer;
let testQuestionType;

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
    is_adopted: false,
  });

  // Create a test question type
  testQuestionType = await QuestionType.create({
    type_name: 'Experience',
    type_description: 'Questions about pet care experience',
  });

  // Create a test question
  testQuestion = await Question.create({
    type_id: testQuestionType.type_id,
    question_content: 'Do you have experience with pets?',
    question_number: 1,
    is_optional: false,
    is_active: true,
  });

  // Create a test adoption
  testAdoption = await Adoption.create({
    user_id: testUser.user_id,
    pet_id: testPet.pet_id,
    status: 'pendente',
    request_date: new Date(),
  });

  // Link question to adoption
  await AdoptionQuestion.create({
    adoption_id: testAdoption.adoption_id,
    question_id: testQuestion.question_id,
  });

  // Create a test answer
  testAnswer = await Answer.create({
    adoption_id: testAdoption.adoption_id,
    question_id: testQuestion.question_id,
    answer_content: 'Yes, I have had pets before.',
  });
});

afterEach(async () => {
  await Answer.destroy({ where: {}, force: true });
  await AdoptionQuestion.destroy({ where: {}, force: true });
  await Question.destroy({ where: {}, force: true });
  await QuestionType.destroy({ where: {}, force: true });
  await Adoption.destroy({ where: {}, force: true });
  await Pet.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Adoption API', () => {
  describe('Basic Adoption Operations', () => {
    describe('POST /api/adoptions', () => {
      it('should create a new adoption request with answers', async () => {
        const newPet = await Pet.create({
          pet_name: 'New Pet',
          description: 'A new test pet',
          species: 'gato',
          gender: 'femea',
          age: 1,
          is_adopted: false,
        });

        const res = await request(app)
          .post('/api/adoptions')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            pet_id: newPet.pet_id,
            answers: [
              {
                question_id: testQuestion.question_id,
                answer_content: 'Yes, I have experience.',
              },
            ],
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.pet_id).toBe(newPet.pet_id);
        expect(res.body.data.Questions).toBeDefined();
      });
    });

    describe('GET /api/adoptions', () => {
      it('should get all adoptions with pagination (admin only)', async () => {
        const res = await request(app)
          .get('/api/adoptions')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
      });

      it('should filter adoptions by status', async () => {
        const res = await request(app)
          .get('/api/adoptions?status=pendente')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.every(adoption => adoption.status === 'pendente')).toBe(true);
      });
    });

    describe('GET /api/adoptions/:id', () => {
      it('should get adoption by ID with related data', async () => {
        const res = await request(app)
          .get(`/api/adoptions/${testAdoption.adoption_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.adoption_id).toBe(testAdoption.adoption_id);
        expect(res.body.data.Pet).toBeDefined();
        expect(res.body.data.User).toBeDefined();
        expect(res.body.data.Questions).toBeDefined();
      });
    });

    describe('PUT /api/adoptions/:user_id/:adoption_id', () => {
      it('should update adoption request', async () => {
        const res = await request(app)
          .put(`/api/adoptions/${testUser.user_id}/${testAdoption.adoption_id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            status: 'cancelado',
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.status).toBe('cancelado');
      });
    });

    describe('PUT /api/adoptions/:id/status', () => {
      it('should update adoption status (admin only)', async () => {
        const res = await request(app)
          .put(`/api/adoptions/${testAdoption.adoption_id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'aprovado' });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.status).toBe('aprovado');
      });

      it('should reject invalid status values', async () => {
        const res = await request(app)
          .put(`/api/adoptions/${testAdoption.adoption_id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'status_invalido' });

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toContain('status');
      });

      it('should reject non-admin users', async () => {
        const res = await request(app)
          .put(`/api/adoptions/${testAdoption.adoption_id}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'aprovado' });

        expect(res.statusCode).toBe(403);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toBe('Não autorizado');
      });
    });

    describe('DELETE /api/adoptions/:user_id/:adoption_id', () => {
      it('should delete adoption request', async () => {
        const res = await request(app)
          .delete(`/api/adoptions/${testUser.user_id}/${testAdoption.adoption_id}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(204);

        const deletedAdoption = await Adoption.findByPk(testAdoption.adoption_id);
        expect(deletedAdoption).toBeNull();
      });
    });
  });

  describe('User-specific Operations', () => {
    describe('GET /api/users/:user_id/adoptions', () => {
      it('should get user adoptions', async () => {
        const res = await request(app)
          .get(`/api/users/${testUser.user_id}/adoptions`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('POST /api/users/:user_id/adoptions', () => {
      it('should create adoption for user', async () => {
        const newPet = await Pet.create({
          pet_name: 'Another Pet',
          description: 'Another test pet',
          species: 'cachorro',
          gender: 'macho',
          age: 3,
          is_adopted: false,
        });

        const res = await request(app)
          .post(`/api/users/${testUser.user_id}/adoptions`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            pet_id: newPet.pet_id,
            answers: [
              {
                question_id: testQuestion.question_id,
                answer_content: 'Yes, experienced.',
              },
            ],
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.user_id).toBe(testUser.user_id);
      });
    });
  });

  describe('Pet-specific Operations', () => {
    describe('GET /api/pets/:pet_id/adoptions', () => {
      it('should get pet adoptions', async () => {
        const res = await request(app)
          .get(`/api/pets/${testPet.pet_id}/adoptions`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('GET /api/pets/:pet_id/adoptions/:adoption_id', () => {
      it('should get specific pet adoption', async () => {
        const res = await request(app)
          .get(`/api/pets/${testPet.pet_id}/adoptions/${testAdoption.adoption_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.pet_id).toBe(testPet.pet_id);
        expect(res.body.data.adoption_id).toBe(testAdoption.adoption_id);
      });
    });
  });

  describe('Questions Operations', () => {
    describe('GET /api/adoptions/:adoption_id/questions', () => {
      it('should get adoption questions', async () => {
        const res = await request(app)
          .get(`/api/adoptions/${testAdoption.adoption_id}/questions`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('POST /api/adoptions/:adoption_id/questions', () => {
      it('should add question to adoption (admin only)', async () => {
        const newQuestion = {
          type_id: testQuestionType.type_id,
          question_content: 'New test question?',
          question_number: 2,
          is_optional: true,
          is_active: true,
        };

        const res = await request(app)
          .post(`/api/adoptions/${testAdoption.adoption_id}/questions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newQuestion);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.question_content).toBe('New test question?');
      });
    });
  });

  describe('Answers Operations', () => {
    describe('GET /api/adoptions/:adoption_id/answers', () => {
      it('should get adoption answers', async () => {
        const res = await request(app)
          .get(`/api/adoptions/${testAdoption.adoption_id}/answers`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('POST /api/adoptions/:adoption_id/answers', () => {
      it('should submit answers for adoption', async () => {
        const newAnswers = [
          {
            question_id: testQuestion.question_id,
            answer_content: 'Updated answer content',
          },
        ];

        const res = await request(app)
          .post(`/api/adoptions/${testAdoption.adoption_id}/answers`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ answers: newAnswers });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('PUT /api/adoptions/:adoption_id/answers/:answer_id', () => {
      it('should update answer', async () => {
        const res = await request(app)
          .put(`/api/adoptions/${testAdoption.adoption_id}/answers/${testAnswer.answer_id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            answer_content: 'Updated answer content',
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.answer_content).toBe('Updated answer content');
      });
    });

    describe('DELETE /api/adoptions/:adoption_id/answers/:answer_id', () => {
      it('should delete answer', async () => {
        const res = await request(app)
          .delete(`/api/adoptions/${testAdoption.adoption_id}/answers/${testAnswer.answer_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);

        const deletedAnswer = await Answer.findByPk(testAnswer.answer_id);
        expect(deletedAnswer).toBeNull();
      });
    });
  });
});
