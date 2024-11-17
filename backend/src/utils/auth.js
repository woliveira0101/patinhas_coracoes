const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

const generateToken = user => {
  return jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'No authorization header provided',
      });
    }

    // Check if it starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authorization header format. Use: Bearer {token}',
      });
    }

    // Extract the token (everything after 'Bearer ')
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Log successful authentication
    logger.info('Authentication successful', {
      userId: user.user_id,
      tokenPreview: token.substring(0, 10) + '...', // Log only first 10 chars of token for security
    });

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    // Handle expected authentication errors
    if (error instanceof jwt.JsonWebTokenError) {
      // Log expected authentication failures as info
      logger.info('Authentication failed', {
        reason: error.message,
        authHeaderPreview: req.header('Authorization')?.substring(0, 20) + '...',
      });

      return res.status(401).json({
        status: 'error',
        message: 'Please authenticate.',
      });
    }

    // Log unexpected errors as errors
    logger.error('Unexpected authentication error:', {
      error: error.message,
      stack: error.stack,
      authHeaderPreview: req.header('Authorization')?.substring(0, 20) + '...',
    });

    res.status(401).json({
      status: 'error',
      message: 'Please authenticate.',
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin === true) {
    next();
  } else {
    logger.info('Admin access denied', {
      userId: req.user?.user_id,
      isAdmin: req.user?.is_admin,
    });

    res.status(403).json({
      status: 'error',
      message: 'Não autorizado',
    });
  }
};

module.exports = {
  generateToken,
  authenticate,
  authorizeAdmin,
};
