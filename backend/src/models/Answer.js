const { Model, DataTypes } = require('sequelize');

class Answer extends Model {
  static init(sequelize) {
    super.init(
      {
        answer_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        adoption_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        question_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        answer_content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Answer',
        tableName: 'answers',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
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
  }
}

module.exports = Answer;
