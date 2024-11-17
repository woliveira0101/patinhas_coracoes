// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_RESET_SECRET = 'test_reset_secret';
process.env.POSTGRES_URI = 'postgres://user:password@postgres_test:5432/petadoption_test';
process.env.REDIS_URL = 'redis://redis_test:6379';

const { sequelize, initializeModels } = require('../src/models');
const { User, Pet, Donation, Adoption } = require('../src/models');

// Initialize models before tests run
beforeAll(async () => {
  // Initialize models
  initializeModels();

  // Sync database
  await sequelize.sync({ force: true });
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
});

// Mock email service
jest.mock('../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockImplementation(() => {
    // Simular falha no envio do email em alguns casos
    if (process.env.MOCK_EMAIL_FAILURE === 'true') {
      return Promise.reject(new Error('Failed to send password reset email'));
    }
    return Promise.resolve();
  }),
}));

// Mock storage service
jest.mock('../src/utils/storage', () => ({
  saveFile: jest.fn().mockResolvedValue('test-file-path'),
  deleteFile: jest.fn().mockResolvedValue(),
  getFileUrl: jest.fn(path => `http://test.com/${path}`),
}));

// Mock Redis
jest.mock('redis', () => {
  const mockRedisClient = {
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue(),
  };

  return {
    createClient: jest.fn().mockReturnValue(mockRedisClient),
  };
});

// Jest timing config
jest.setTimeout(30000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Funções auxiliares corrigidas para PostgreSQL
global.createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Usuário Teste',
    email: `test${Date.now()}@example.com`,
    phone_number: '11999999999',
    login: `testuser${Date.now()}`,
    password: 'senha123',
    type: 'doador',
    is_active: true,
    is_admin: false,
    ...overrides
  };
  return await User.create(defaultUser);
};

global.createTestDonation = async (overrides = {}) => {
  // Criar usuário e pet se não fornecidos
  const user = overrides.user_id ? null : await createTestUser();
  const pet = overrides.pet_id ? null : await createTestPet();
  
  const defaultDonation = {
    amount: 100,
    description: 'Doação teste',
    user_id: user ? user.user_id : overrides.user_id,
    pet_id: pet ? pet.pet_id : overrides.pet_id,
    donation_date: new Date(),
    ...overrides
  };
  return await Donation.create(defaultDonation);
};

global.createTestAdoption = async (overrides = {}) => {
  // Criar usuário e pet se não fornecidos
  const user = overrides.user_id ? null : await createTestUser();
  const pet = overrides.pet_id ? null : await createTestPet();
  
  const defaultAdoption = {
    pet_id: pet ? pet.pet_id : overrides.pet_id,
    user_id: user ? user.user_id : overrides.user_id,
    status: 'em_analise',
    request_date: new Date(),
    ...overrides
  };
  return await Adoption.create(defaultAdoption);
};

global.createTestPet = async (overrides = {}) => {
  const defaultPet = {
    pet_name: 'Pet Teste',
    description: 'Descrição do pet teste',
    species: 'cachorro',
    gender: 'macho',
    breed: 'SRD',
    age: 2,
    size: 'medio',
    colour: 'caramelo',
    state: 'SP',
    city: 'São Paulo',
    vaccinated: true,
    castrated: true,
    vermifuged: true,
    adoption_status: 'disponivel',
    ...overrides
  };
  return await Pet.create(defaultPet);
};
