const { Model, DataTypes } = require('sequelize');

class Pet extends Model {
  static init(sequelize) {
    super.init(
      {
        pet_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        pet_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING(2),
        },
        city: {
          type: DataTypes.STRING(100),
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        species: {
          type: DataTypes.STRING,
          allowNull: false,
          set(value) {
            // Normalize species to lowercase
            const normalizedSpecies = value.toLowerCase();
            const speciesMap = {
              dog: 'cachorro',
              dogs: 'cachorro',
              cachorro: 'cachorro',
              cat: 'gato',
              cats: 'gato',
              gato: 'gato',
              other: 'outro',
              outro: 'outro',
            };
            this.setDataValue('species', speciesMap[normalizedSpecies] || normalizedSpecies);
          },
        },
        gender: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        breed: {
          type: DataTypes.STRING(20),
        },
        age: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        size: {
          type: DataTypes.STRING,
        },
        colour: {
          type: DataTypes.STRING(20),
        },
        personality: {
          type: DataTypes.STRING(50),
        },
        special_care: {
          type: DataTypes.STRING(100),
        },
        vaccinated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        castrated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        vermifuged: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_adopted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Pet',
        tableName: 'pets',
        schema: 'patinhas',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.PetImage, {
      foreignKey: 'pet_id',
      as: 'PetImages',
    });
    this.hasMany(models.Adoption, {
      foreignKey: 'pet_id',
      as: 'adoptions',
    });
    this.hasMany(models.Donation, {
      foreignKey: 'pet_id',
      as: 'donations',
    });
  }
}

module.exports = Pet;
