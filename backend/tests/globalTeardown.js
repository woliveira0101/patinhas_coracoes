const { sequelize } = require('../src/config/db');

module.exports = async () => {
  try {
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};
