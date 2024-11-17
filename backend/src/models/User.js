const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        phone_number: {
          type: DataTypes.STRING(32),
          allowNull: false,
        },
        login: {
          type: DataTypes.STRING(32),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(64),
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        is_admin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Address, { foreignKey: 'user_id' });
    this.hasMany(models.Adoption, { foreignKey: 'user_id' });
    this.hasMany(models.Donation, { foreignKey: 'user_id' });
  }
}

module.exports = User;
