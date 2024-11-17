const { Model, DataTypes } = require('sequelize');

class Address extends Model {
  static init(sequelize) {
    super.init(
      {
        address_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        zip_code: {
          type: DataTypes.STRING(9),
          allowNull: false,
          validate: {
            is: /^\d{5}-?\d{3}$/, // Format: 12345-678 or 12345678
          },
        },
        street_name: {
          type: DataTypes.STRING(70),
          allowNull: false,
        },
        address_number: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        address_complement: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        neighborhood: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        city_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        state_name: {
          type: DataTypes.STRING(2),
          allowNull: false,
          validate: {
            isIn: [
              [
                'AC',
                'AL',
                'AP',
                'AM',
                'BA',
                'CE',
                'DF',
                'ES',
                'GO',
                'MA',
                'MT',
                'MS',
                'MG',
                'PA',
                'PB',
                'PR',
                'PE',
                'PI',
                'RJ',
                'RN',
                'RS',
                'RO',
                'RR',
                'SC',
                'SP',
                'SE',
                'TO',
              ],
            ],
          },
        },
      },
      {
        sequelize,
        modelName: 'Address',
        tableName: 'address',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

module.exports = Address;
