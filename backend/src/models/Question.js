const { Model, DataTypes } = require('sequelize');

class Question extends Model {
  static init(sequelize) {
    super.init(
      {
        question_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        type_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        question_content: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        question_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        is_optional: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Question',
        tableName: 'questions',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.QuestionType, {
      foreignKey: 'type_id',
      onDelete: 'CASCADE',
    });

    this.belongsToMany(models.Adoption, {
      through: {
        model: models.AdoptionQuestion,
        unique: false,
      },
      foreignKey: 'question_id',
      otherKey: 'adoption_id',
      as: 'Adoptions',
    });

    this.hasMany(models.Answer, {
      foreignKey: 'question_id',
      as: 'answers',
    });
  }
}

module.exports = Question;
