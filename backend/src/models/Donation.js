const { Model, DataTypes } = require('sequelize');

class Donation extends Model {
  static init(sequelize) {
    super.init(
      {
        donation_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        pet_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        donation_date: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'Donation',
        tableName: 'donations',
        schema: 'patinhas',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    this.belongsTo(models.Pet, { foreignKey: 'pet_id', onDelete: 'CASCADE' });
  }
}

module.exports = Donation;
