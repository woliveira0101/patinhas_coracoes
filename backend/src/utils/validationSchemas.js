const Joi = require('joi');

const schemas = {
  // Authentication validation schemas
  login: Joi.object({
    login: Joi.string().required().messages({
      'string.empty': 'Login é obrigatório',
      'any.required': 'Login é obrigatório',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória',
    }),
  }).unknown(true),

  refreshToken: Joi.object({
    token: Joi.string().required().messages({
      'string.empty': 'Token é obrigatório',
      'any.required': 'Token é obrigatório',
    }),
  }).unknown(true),

  passwordResetRequest: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'string.empty': 'Email é obrigatório',
      'any.required': 'Email é obrigatório',
    }),
  }).unknown(true),

  passwordReset: Joi.object({
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'string.empty': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória',
    }),
    password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Confirmação de senha não confere',
      'string.empty': 'Confirmação de senha é obrigatória',
      'any.required': 'Confirmação de senha é obrigatória',
    }),
  }).unknown(true),

  updatePassword: Joi.object({
    current_password: Joi.string().required().messages({
      'string.empty': 'Senha atual é obrigatória',
      'any.required': 'Senha atual é obrigatória',
    }),
    new_password: Joi.string().min(6).required().messages({
      'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      'string.empty': 'Nova senha é obrigatória',
      'any.required': 'Nova senha é obrigatória',
    }),
    new_password_confirmation: Joi.string().valid(Joi.ref('new_password')).required().messages({
      'any.only': 'Confirmação de nova senha não confere',
      'string.empty': 'Confirmação de nova senha é obrigatória',
      'any.required': 'Confirmação de nova senha é obrigatória',
    }),
  }).unknown(true),

  // User validation schemas
  createUser: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    login: Joi.string().min(3).max(32).required(),
    password: Joi.string().min(6).max(64).required(),
    type: Joi.string().valid('doador', 'adotante', 'ambos'),
    image: Joi.string(),
  }).unknown(true),

  updateUser: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone_number: Joi.string(),
    login: Joi.string().min(3).max(32),
    password: Joi.string().min(6).max(64),
    type: Joi.string().valid('doador', 'adotante', 'ambos'),
    image: Joi.string(),
  }).unknown(true),

  promoteAdmin: Joi.object({
    is_admin: Joi.boolean().valid(true).required().messages({
      'any.only': 'O valor deve ser true para promover a administrador',
      'any.required': 'O campo is_admin é obrigatório',
    }),
  }).unknown(true),

  // Pet validation schemas
  createPet: Joi.object({
    pet_name: Joi.string().max(50).required(),
    state: Joi.string().length(2),
    city: Joi.string().max(100),
    description: Joi.string().max(255).required(),
    species: Joi.string().valid('cachorro', 'gato', 'outro').required().lowercase(),
    gender: Joi.string().valid('macho', 'femea', 'nao sei').required(),
    breed: Joi.string().max(20),
    age: Joi.number().integer().required(),
    size: Joi.string().valid('pequeno', 'medio', 'grande'),
    colour: Joi.string().max(20),
    personality: Joi.string().max(50),
    special_care: Joi.string().max(100),
    vaccinated: Joi.boolean(),
    castrated: Joi.boolean(),
    vermifuged: Joi.boolean(),
  }).unknown(true),

  updatePet: Joi.object({
    pet_name: Joi.string().max(50),
    state: Joi.string().length(2),
    city: Joi.string().max(100),
    description: Joi.string().max(255),
    species: Joi.string().valid('cachorro', 'gato', 'outro').lowercase(),
    gender: Joi.string().valid('macho', 'femea', 'nao sei'),
    breed: Joi.string().max(20),
    age: Joi.number().integer(),
    size: Joi.string().valid('pequeno', 'medio', 'grande'),
    colour: Joi.string().max(20),
    personality: Joi.string().max(50),
    special_care: Joi.string().max(100),
    vaccinated: Joi.boolean(),
    castrated: Joi.boolean(),
    vermifuged: Joi.boolean(),
    is_adopted: Joi.boolean(),
  }).unknown(true),

  // Address validation schemas
  createAddress: Joi.object({
    zip_code: Joi.string()
      .pattern(/^\d{5}-?\d{3}$/)
      .required()
      .messages({
        'string.pattern.base': 'CEP deve estar no formato 12345-678 ou 12345678',
      }),
    street_name: Joi.string().max(70).required(),
    address_number: Joi.string().max(10).required(),
    address_complement: Joi.string().max(255).allow('', null),
    neighborhood: Joi.string().max(100).required(),
    city_name: Joi.string().max(100).required(),
    state_name: Joi.string()
      .length(2)
      .valid(
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO'
      )
      .required()
      .messages({
        'any.only': 'Estado inválido',
      }),
  }).unknown(true),

  updateAddress: Joi.object({
    zip_code: Joi.string()
      .pattern(/^\d{5}-?\d{3}$/)
      .messages({
        'string.pattern.base': 'CEP deve estar no formato 12345-678 ou 12345678',
      }),
    street_name: Joi.string().max(70),
    address_number: Joi.string().max(10),
    address_complement: Joi.string().max(255).allow('', null),
    neighborhood: Joi.string().max(100),
    city_name: Joi.string().max(100),
    state_name: Joi.string()
      .length(2)
      .valid(
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO'
      )
      .messages({
        'any.only': 'Estado inválido',
      }),
  }).unknown(true),

  // Adoption validation schemas
  createAdoption: Joi.object({
    pet_id: Joi.number().integer().required(),
    answers: Joi.array().items(
      Joi.object({
        question_id: Joi.number().integer().required(),
        answer_content: Joi.string().required(),
      })
    ),
  }).unknown(true),

  updateAdoption: Joi.object({
    status: Joi.string().valid('pendente', 'aprovado', 'reprovado', 'cancelado'),
    answers: Joi.array().items(
      Joi.object({
        question_id: Joi.number().integer().required(),
        answer_content: Joi.string().required(),
      })
    ),
  }).unknown(true),

  updateAdoptionStatus: Joi.object({
    status: Joi.string()
      .valid('pendente', 'aprovado', 'reprovado', 'cancelado')
      .required()
      .messages({
        'any.only':
          'Status inválido. O status deve ser: pendente, aprovado, reprovado ou cancelado',
        'any.required': 'O status é obrigatório',
        'string.base': 'O status deve ser uma string',
      }),
  }).unknown(true),

  // Answer validation schemas
  createAnswer: Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          question_id: Joi.number().integer().required(),
          answer_content: Joi.string().required(),
        })
      )
      .required(),
  }).unknown(true),

  updateAnswer: Joi.object({
    answer_content: Joi.string().required(),
  }).unknown(true),

  // Donation validation schemas
  createDonation: Joi.object({
    pet_id: Joi.number().integer().required(),
  }).unknown(true),

  // Question validation schemas
  createQuestion: Joi.object({
    type_id: Joi.number().integer().required(),
    question_content: Joi.string().max(255).required(),
    question_number: Joi.number().integer().required(),
    is_optional: Joi.boolean(),
    is_active: Joi.boolean(),
  }).unknown(true),

  updateQuestion: Joi.object({
    type_id: Joi.number().integer(),
    question_content: Joi.string().max(255),
    question_number: Joi.number().integer(),
    is_optional: Joi.boolean(),
    is_active: Joi.boolean(),
  }).unknown(true),

  // QuestionType validation schemas
  createQuestionType: Joi.object({
    type_name: Joi.string().max(50).required(),
    type_description: Joi.string().max(255),
  }).unknown(true),

  updateQuestionType: Joi.object({
    type_name: Joi.string().max(50),
    type_description: Joi.string().max(255),
  }).unknown(true),

  // Common validation schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(
      'pendente',
      'aprovado',
      'reprovado',
      'cancelado',
      'disponivel',
      'adotado'
    ),
    species: Joi.string().valid('cachorro', 'gato', 'outro'),
    state: Joi.string().length(2),
    city: Joi.string().max(100),
  }).unknown(true),

  // Route parameters validation schemas
  idParam: Joi.object({
    id: Joi.number().integer().required(),
  }).unknown(true),

  idUserParam: Joi.object({
    user_id: Joi.number().integer().required(),
  }).unknown(true),

  idAddressParam: Joi.object({
    address_id: Joi.number().integer().required(),
  }).unknown(true),

  idAnswerParam: Joi.object({
    answer_id: Joi.number().integer().required(),
  }).unknown(true),

  // Combined user and address params validation schemas
  userAddressParams: Joi.object({
    user_id: Joi.number().integer().required(),
    address_id: Joi.number().integer().required(),
  }).unknown(true),

  // Combined user and adoption params validation schemas
  userAdoptionParams: Joi.object({
    user_id: Joi.number().integer().required(),
    adoption_id: Joi.number().integer().required(),
  }).unknown(true),

  idAdoptionParam: Joi.object({
    adoption_id: Joi.number().integer().required(),
  }).unknown(true),

  idDonationParam: Joi.object({
    donation_id: Joi.number().integer().required(),
  }).unknown(true),

  idPetParam: Joi.object({
    pet_id: Joi.number().integer().required(),
  }).unknown(true),

  idQuestionParam: Joi.object({
    question_id: Joi.number().integer().required(),
  }).unknown(true),

  idQuestionTypeParam: Joi.object({
    type_id: Joi.number().integer().required(),
  }).unknown(true),

  idImageParam: Joi.object({
    image_id: Joi.number().integer().required(),
  }).unknown(true),

  // Combined pet and image params validation schemas
  petImageParams: Joi.object({
    pet_id: Joi.number().integer().required(),
    image_id: Joi.number().integer().required(),
  }).unknown(true),
};

module.exports = schemas;
