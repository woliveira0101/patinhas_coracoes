const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');

// Tipos de Perguntas (These routes must come before the /:question_id routes)

// Retorna uma lista de todos os tipos de perguntas
router.get('/types', validate(schemas.pagination, 'query'), questionController.getAllTypes);

// Adiciona um novo tipo de pergunta
router.post('/types', validate(schemas.createQuestionType), questionController.createType);

// Retorna detalhes do tipo de pergunta com o ID especificado
router.get(
  '/types/:type_id',
  validate(schemas.idQuestionTypeParam, 'params'),
  questionController.getTypeById
);

// Atualiza as informações do tipo de pergunta com o ID especificado
router.put(
  '/types/:type_id',
  validate(schemas.idQuestionTypeParam, 'params'),
  validate(schemas.createQuestionType),
  questionController.updateType
);

// Remove o tipo de pergunta com o ID especificado
router.delete(
  '/types/:type_id',
  validate(schemas.idQuestionTypeParam, 'params'),
  questionController.deleteType
);

// Operações Básicas de Perguntas

// Retorna uma lista de todas as perguntas disponíveis
router.get('/', validate(schemas.pagination, 'query'), questionController.getAll);

// Adiciona uma nova pergunta ao sistema
router.post('/', validate(schemas.createQuestion), questionController.create);

// Retorna detalhes da pergunta com o ID especificado
router.get(
  '/:question_id',
  validate(schemas.idQuestionParam, 'params'),
  questionController.getById
);

// Atualiza as informações da pergunta com o ID especificado
router.put(
  '/:question_id',
  validate(schemas.idQuestionParam, 'params'),
  validate(schemas.createQuestion),
  questionController.update
);

// Remove a pergunta com o ID especificado
router.delete(
  '/:question_id',
  validate(schemas.idQuestionParam, 'params'),
  questionController.delete
);

module.exports = router;
