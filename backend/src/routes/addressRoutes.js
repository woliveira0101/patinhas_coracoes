const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate } = require('../utils/auth');

// Operações Básicas de Endereços

// Retorna uma lista de todos os endereços cadastrados
router.get('/', authenticate, validate(schemas.pagination, 'query'), addressController.getAll);

// Adiciona um novo endereço ao sistema
router.post('/', authenticate, validate(schemas.createAddress), addressController.create);

// Retorna detalhes do endereço com o ID especificado
router.get(
  '/:address_id',
  authenticate,
  validate(schemas.idAddressParam, 'params'),
  addressController.getById
);

// Atualiza as informações do endereço com o ID especificado
router.put(
  '/:address_id',
  authenticate,
  validate(schemas.idAddressParam, 'params'),
  validate(schemas.updateAddress),
  addressController.update
);

// Remove o endereço com o ID especificado
router.delete(
  '/:address_id',
  authenticate,
  validate(schemas.idAddressParam, 'params'),
  addressController.delete
);

module.exports = router;
