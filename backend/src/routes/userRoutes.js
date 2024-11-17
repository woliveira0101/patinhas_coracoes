const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
const adoptionController = require('../controllers/adoptionController');
const donationController = require('../controllers/donationController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate, authorizeAdmin } = require('../utils/auth');

// Get current user
router.get('/me', authenticate, userController.getCurrentUser);

// Update current user
router.put('/me', authenticate, validate(schemas.updateUser), userController.updateCurrentUser);

// Update current user password
router.put(
  '/me/password',
  authenticate,
  validate(schemas.updatePassword),
  userController.updateCurrentUserPassword
);

// Operações Básicas de Usuários

// Criar um novo usuário
router.post('/', validate(schemas.createUser), userController.create);

// Obter todos os usuários com paginação
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(schemas.pagination, 'query'),
  userController.getAll
);

// Obter usuário por ID
router.get(
  '/:user_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  userController.getById
);

// Atualizar usuário
router.put(
  '/:user_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.updateUser),
  userController.update
);

// Promover usuário a administrador
router.patch(
  '/:user_id/admin',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.promoteAdmin),
  userController.promoteToAdmin
);

// Deletar usuário
router.delete(
  '/:user_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  userController.delete
);

// Endereços do Usuário

// GET /users/:user_id/addresses - Retorna os endereços associados ao usuário
router.get(
  '/:user_id/addresses',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  addressController.getByUserId
);

// POST /users/:user_id/addresses - Adiciona um novo endereço ao usuário
router.post(
  '/:user_id/addresses',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.createAddress),
  addressController.createForUser
);

// GET /users/:user_id/addresses/:address_id - Retorna um endereço específico do usuário
router.get(
  '/:user_id/addresses/:address_id',
  authenticate,
  validate(schemas.userAddressParams, 'params'),
  addressController.getAddressByUserIdAndAddressId
);

// PUT /users/:user_id/addresses/:address_id - Atualiza um endereço específico do usuário
router.put(
  '/:user_id/addresses/:address_id',
  authenticate,
  validate(schemas.userAddressParams, 'params'),
  validate(schemas.updateAddress),
  addressController.update
);

// DELETE /users/:user_id/addresses/:address_id - Remove um endereço específico do usuário
router.delete(
  '/:user_id/addresses/:address_id',
  authenticate,
  validate(schemas.userAddressParams, 'params'),
  addressController.delete
);

// Adoções do Usuário

// GET /users/:user_id/adoptions - Retorna a lista de adoções do usuário
router.get(
  '/:user_id/adoptions',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  adoptionController.getByUserId
);

// POST /users/:user_id/adoptions - Cria uma nova solicitação de adoção pelo usuário
router.post(
  '/:user_id/adoptions',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.createAdoption),
  adoptionController.createForUser
);

// GET /users/:user_id/adoptions/:adoption_id - Retorna detalhes de uma adoção específica do usuário
router.get(
  '/:user_id/adoptions/:adoption_id',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getById
);

// PUT /users/:user_id/adoptions/:adoption_id - Atualiza informações da adoção específica do usuário
router.put(
  '/:user_id/adoptions/:adoption_id',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.updateAdoption),
  adoptionController.update
);

// DELETE /users/:user_id/adoptions/:adoption_id - Cancela a adoção específica do usuário
router.delete(
  '/:user_id/adoptions/:adoption_id',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.delete
);

// Doações do Usuário

// GET /users/:user_id/donations - Retorna a lista de doações do usuário
router.get(
  '/:user_id/donations',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  donationController.getByUserId
);

// POST /users/:user_id/donations - Registra uma nova doação feita pelo usuário
router.post(
  '/:user_id/donations',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.createDonation),
  donationController.createForUser
);

// GET /users/:user_id/donations/:donation_id - Retorna detalhes de uma doação específica do usuário
router.get(
  '/:user_id/donations/:donation_id',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.idDonationParam, 'params'),
  donationController.getById
);

// DELETE /users/:user_id/donations/:donation_id - Remove o registro da doação específica do usuário
router.delete(
  '/:user_id/donations/:donation_id',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.idDonationParam, 'params'),
  donationController.delete
);

module.exports = router;
