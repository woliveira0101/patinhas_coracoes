const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate } = require('../utils/auth');

// Login
router.post('/login', validate(schemas.login), authController.login);

// Refresh token
router.post('/refresh', authenticate, authController.refresh);

// Logout
router.post('/logout', authController.logout);

// Password reset request
router.post(
  '/password/reset',
  validate(schemas.passwordResetRequest),
  authController.requestPasswordReset
);

// Password reset
router.post(
  '/password/reset/:token',
  validate(schemas.passwordReset),
  authController.resetPassword
);

module.exports = router;
