const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate, authorizeAdmin } = require('../utils/auth');

// Create a new donation (requires authentication)
router.post('/', authenticate, validate(schemas.createDonation), donationController.create);

// Get all donations with pagination (admin only)
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(schemas.pagination, 'query'),
  donationController.getAll
);

// Get donations by current user
router.get(
  '/user',
  authenticate,
  validate(schemas.pagination, 'query'),
  donationController.getByUser
);

// Get donation by ID
router.get(
  '/:donation_id',
  authenticate,
  validate(schemas.idDonationParam, 'params'),
  donationController.getById
);

// Delete donation (admin only)
router.delete(
  '/:donation_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idDonationParam, 'params'),
  donationController.delete
);

// Get donations by user ID (admin only)
router.get(
  '/users/:user_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  donationController.getByUserId
);

// Create donation for specific user (admin only)
router.post(
  '/users/:user_id',
  authenticate,
  authorizeAdmin,
  validate(schemas.idUserParam, 'params'),
  validate(schemas.createDonation),
  donationController.createForUser
);

// Get donations by pet ID
router.get(
  '/pets/:pet_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  donationController.getByPetId
);

// Get specific donation for a pet
router.get(
  '/pets/:pet_id/:donation_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.idDonationParam, 'params'),
  donationController.getByPetIdAndDonationId
);

module.exports = router;
