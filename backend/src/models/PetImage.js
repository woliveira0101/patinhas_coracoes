const { Model, DataTypes } = require('sequelize');

class PetImage extends Model {
  static init(sequelize) {
    super.init(
      {
        image_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        pet_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'PetImage',
        tableName: 'pet_images',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pet, { foreignKey: 'pet_id', onDelete: 'CASCADE' });
  }
}

module.exports = PetImage;
