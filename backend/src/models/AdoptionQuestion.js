const { Model, DataTypes } = require('sequelize');

class AdoptionQuestion extends Model {
  static init(sequelize) {
    super.init(
      {
        adoption_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'adoptions',
            key: 'adoption_id',
          },
        },
        question_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'questions',
            key: 'question_id',
          },
        },
      },
      {
        sequelize,
        modelName: 'AdoptionQuestion',
        tableName: 'adoptions_questions',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
          {
            unique: false,
            fields: ['adoption_id', 'question_id'],
          },
        ],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Adoption, {
      foreignKey: 'adoption_id',
      onDelete: 'CASCADE',
    });

    this.belongsTo(models.Question, {
      foreignKey: 'question_id',
      onDelete: 'CASCADE',
    });

    // Remove the direct Answer associations as they should be handled through Adoption and Question models
  }
}

module.exports = AdoptionQuestion;
