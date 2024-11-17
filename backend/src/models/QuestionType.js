const { Model, DataTypes } = require('sequelize');

class QuestionType extends Model {
  static init(sequelize) {
    super.init(
      {
        type_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        type_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        type_description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'QuestionType',
        tableName: 'questions_types',
        schema: 'patinhas',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Question, { foreignKey: 'type_id' });
  }
}

module.exports = QuestionType;
