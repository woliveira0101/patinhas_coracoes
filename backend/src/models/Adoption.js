const { Model, DataTypes } = require('sequelize');

class Adoption extends Model {
  static init(sequelize) {
    super.init(
      {
        adoption_id: {
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
        request_date: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        acceptance_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'pendente',
          validate: {
            isIn: [['pendente', 'aprovado', 'reprovado', 'cancelado']],
          },
        },
      },
      {
        sequelize,
        modelName: 'Adoption',
        tableName: 'adoptions',
        schema: 'patinhas',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    this.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      onDelete: 'CASCADE',
    });

    this.belongsToMany(models.Question, {
      through: {
        model: models.AdoptionQuestion,
        unique: false,
      },
      foreignKey: 'adoption_id',
      otherKey: 'question_id',
      as: 'Questions',
    });

    this.hasMany(models.Answer, {
      foreignKey: 'adoption_id',
      as: 'answers',
    });
  }
}

module.exports = Adoption;
