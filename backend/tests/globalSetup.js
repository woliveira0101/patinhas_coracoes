const { sequelize } = require('../src/models');

module.exports = async () => {
  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create schema if it doesn't exist
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS patinhas;');

    // Set search path
    await sequelize.query('SET search_path TO patinhas;');

    // Sync database with force:true to ensure clean state
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
