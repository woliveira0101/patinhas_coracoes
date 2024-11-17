const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

// Get aggregated data for user dashboard
router.get('/', authenticate, async (req, res, next) => {
  try {
    const dashboardData = await dashboardController.getDashboardData(req, res);
    logger.info(`Dashboard data retrieved for user: ${req.user.id}`, {
      requestId: req.requestId,
    });
    res.json(dashboardData);
  } catch (error) {
    next(new AppError(error.message, 400));
  }
});

module.exports = router;
