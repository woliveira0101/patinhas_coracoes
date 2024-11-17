const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate, authorizeAdmin } = require('../utils/auth');

// Basic Adoption Operations

// Create a new adoption request (requires authentication)
router.post('/', authenticate, validate(schemas.createAdoption), adoptionController.create);

// Get all adoption requests with pagination (admin only)
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(schemas.pagination, 'query'),
  adoptionController.getAll
);

// User-specific routes
router.get(
  '/users/:user_id/adoptions',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  adoptionController.getByUserId
);

router.post(
  '/users/:user_id/adoptions',
  authenticate,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.createAdoption),
  adoptionController.createForUser
);

// Pet-specific routes
router.get(
  '/pets/:pet_id/adoptions',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  adoptionController.getByPetId
);

router.get(
  '/pets/:pet_id/adoptions/:adoption_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getByPetIdAndAdoptionId
);

// Update adoption status (admin only)
router.put(
  '/:adoption_id/status',
  authenticate,
  authorizeAdmin,
  validate(schemas.updateAdoptionStatus),
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.updateStatus
);

// Get adoption request by ID (requires authentication)
router.get(
  '/:adoption_id',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getById
);

// Update adoption request (requires authentication)
router.put(
  '/:user_id/:adoption_id',
  authenticate,
  validate(schemas.userAdoptionParams, 'params'),
  validate(schemas.updateAdoption),
  adoptionController.update
);

// Delete adoption request (requires authentication)
router.delete(
  '/:user_id/:adoption_id',
  authenticate,
  validate(schemas.userAdoptionParams, 'params'),
  adoptionController.delete
);

// Adoption Questions

// List all questions for an adoption (requires authentication)
router.get(
  '/:adoption_id/questions',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getQuestions
);

// Add new question to adoption (admin only)
router.post(
  '/:adoption_id/questions',
  authenticate,
  authorizeAdmin,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.createQuestion),
  adoptionController.addQuestion
);

// Get details of a specific question (requires authentication)
router.get(
  '/:adoption_id/questions/:question_id',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.idQuestionParam, 'params'),
  adoptionController.getQuestionById
);

// Adoption Answers

// List all answers for an adoption (requires authentication)
router.get(
  '/:adoption_id/answers',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getAnswers
);

// Submit answers for adoption (requires authentication)
router.post(
  '/:adoption_id/answers',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.createAnswer),
  adoptionController.submitAnswers
);

// Get details of a specific answer (requires authentication)
router.get(
  '/:adoption_id/answers/:answer_id',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.idAnswerParam, 'params'),
  adoptionController.getAnswerById
);

// Update a specific answer (requires authentication)
router.put(
  '/:adoption_id/answers/:answer_id',
  authenticate,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.idAnswerParam, 'params'),
  validate(schemas.updateAnswer),
  adoptionController.updateAnswer
);

// Remove a specific answer (admin only)
router.delete(
  '/:adoption_id/answers/:answer_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idAdoptionParam, 'params'),
  validate(schemas.idAnswerParam, 'params'),
  adoptionController.deleteAnswer
);

module.exports = router;
