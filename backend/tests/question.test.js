const request = require('supertest');
const app = require('../src/app');
const { User, Question, QuestionType } = require('../src/models');
const { generateToken } = require('../src/utils/auth');
const { sequelize } = require('../src/config/db');

let userToken;
let adminToken;
let testUser;
let adminUser;
let testQuestionType;
let testQuestion;

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

  // Create a test question type
  testQuestionType = await QuestionType.create({
    type_name: 'Test Type',
    type_description: 'A test question type',
  });

  // Create a test question
  testQuestion = await Question.create({
    type_id: testQuestionType.type_id,
    question_content: 'Test question content?',
    question_number: 1,
    is_optional: false,
    is_active: true,
  });
});

afterEach(async () => {
  await Question.destroy({ where: {}, force: true });
  await QuestionType.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Question API', () => {
  describe('Question Operations', () => {
    describe('GET /api/questions', () => {
      it('should get all questions', async () => {
        const res = await request(app)
          .get('/api/questions')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
      });
    });

    describe('POST /api/questions', () => {
      it('should create a new question (admin only)', async () => {
        const newQuestion = {
          type_id: testQuestionType.type_id,
          question_content: 'New test question?',
          question_number: 2,
          is_optional: true,
          is_active: true,
        };

        const res = await request(app)
          .post('/api/questions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newQuestion);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.question_content).toBe('New test question?');
      });

      it('should not create question without required fields', async () => {
        const invalidQuestion = {
          type_id: testQuestionType.type_id,
          is_optional: true,
        };

        const res = await request(app)
          .post('/api/questions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidQuestion);

        expect(res.statusCode).toBe(400);
      });
    });

    describe('GET /api/questions/:question_id', () => {
      it('should get question by ID', async () => {
        const res = await request(app)
          .get(`/api/questions/${testQuestion.question_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.question_id).toBe(testQuestion.question_id);
        expect(res.body.data.QuestionType).toBeDefined();
      });

      it('should return 404 for non-existent question', async () => {
        const res = await request(app)
          .get('/api/questions/99999')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
      });
    });

    describe('PUT /api/questions/:question_id', () => {
      it('should update question (admin only)', async () => {
        const updateData = {
          type_id: testQuestionType.type_id,
          question_content: 'Updated question content?',
          question_number: 1,
          is_optional: true,
        };

        const res = await request(app)
          .put(`/api/questions/${testQuestion.question_id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.question_content).toBe('Updated question content?');
        expect(res.body.data.is_optional).toBe(true);
      });
    });

    describe('DELETE /api/questions/:question_id', () => {
      it('should delete question (admin only)', async () => {
        const res = await request(app)
          .delete(`/api/questions/${testQuestion.question_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);

        const deletedQuestion = await Question.findByPk(testQuestion.question_id);
        expect(deletedQuestion).toBeNull();
      });
    });
  });

  describe('Question Type Operations', () => {
    describe('GET /api/questions/types', () => {
      it('should get all question types', async () => {
        const res = await request(app)
          .get('/api/questions/types')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
      });
    });

    describe('POST /api/questions/types', () => {
      it('should create a new question type (admin only)', async () => {
        const newType = {
          type_name: 'New Type',
          type_description: 'A new question type',
        };

        const res = await request(app)
          .post('/api/questions/types')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newType);

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.type_name).toBe('New Type');
      });
    });

    describe('GET /api/questions/types/:type_id', () => {
      it('should get question type by ID', async () => {
        const res = await request(app)
          .get(`/api/questions/types/${testQuestionType.type_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.type_id).toBe(testQuestionType.type_id);
      });

      it('should return 404 for non-existent question type', async () => {
        const res = await request(app)
          .get('/api/questions/types/99999')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
      });
    });

    describe('PUT /api/questions/types/:type_id', () => {
      it('should update question type (admin only)', async () => {
        const updateData = {
          type_name: 'Updated Type',
          type_description: 'Updated description',
        };

        const res = await request(app)
          .put(`/api/questions/types/${testQuestionType.type_id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.type_name).toBe('Updated Type');
        expect(res.body.data.type_description).toBe('Updated description');
      });
    });

    describe('DELETE /api/questions/types/:type_id', () => {
      it('should delete question type and associated questions (admin only)', async () => {
        const res = await request(app)
          .delete(`/api/questions/types/${testQuestionType.type_id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);

        const deletedType = await QuestionType.findByPk(testQuestionType.type_id);
        expect(deletedType).toBeNull();

        // Check if associated questions were also deleted (cascade)
        const associatedQuestion = await Question.findByPk(testQuestion.question_id);
        expect(associatedQuestion).toBeNull();
      });
    });
  });
});
