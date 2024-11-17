const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { userStatusSchema } = require('../utils/validationSchemas');
const rateLimiter = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

// Apply rate limiting to sensitive operations
const userStatusLimiter = rateLimiter(10, 60 * 60 * 1000); // 10 requests per hour

// List all users (for admins)
router.get('/users', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const users = await adminController.getAllUsers(req, res);
    res.json(users);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
});

// Update user status (activate/deactivate)
router.put(
  '/users/:id',
  authenticate,
  authorizeAdmin,
  userStatusLimiter,
  validate(userStatusSchema),
  async (req, res, next) => {
    try {
      const updatedUser = await adminController.updateUserStatus(req, res);
      logger.info(
        `User ${req.params.id} status updated by admin: ${req.user.id}`,
        { requestId: req.requestId }
      );
      res.json(updatedUser);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
);

// Get platform statistics
router.get(
  '/statistics',
  authenticate,
  authorizeAdmin,
  async (req, res, next) => {
    try {
      const statistics = await adminController.getPlatformStatistics(req, res);
      res.json(statistics);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
);

module.exports = router;
