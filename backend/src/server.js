require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { initializeModels } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection:', err);

  // Check if server is defined before calling close
  if (global.server) {
    global.server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connection established');

    // Initialize models
    initializeModels();
    logger.info('Models initialized successfully');

    // Start server
    global.server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      logger.info('Received kill signal, shutting down gracefully');
      global.server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
      });

      // If connections not closed within 10s, forcefully shutdown
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
