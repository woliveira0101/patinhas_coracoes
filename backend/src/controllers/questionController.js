const { Question, QuestionType } = require('../models');
const logger = require('../utils/logger');

class QuestionController {
  // Operações Básicas de Perguntas
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const questions = await Question.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: QuestionType,
            attributes: ['type_name', 'type_description'],
          },
        ],
        order: [['question_number', 'ASC']],
      });

      return res.json({
        status: 'success',
        data: questions.rows,
        pagination: {
          total: questions.count,
          page: parseInt(page),
          pages: Math.ceil(questions.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching questions:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async create(req, res) {
    try {
      const questionData = req.body;
      const question = await Question.create(questionData);

      logger.info('Question created successfully', { questionId: question.question_id });

      return res.status(201).json({
        status: 'success',
        data: question,
      });
    } catch (error) {
      logger.error('Error creating question:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req, res) {
    try {
      const { question_id } = req.params;

      const question = await Question.findByPk(question_id, {
        include: [
          {
            model: QuestionType,
            attributes: ['type_name', 'type_description'],
          },
        ],
      });

      if (!question) {
        return res.status(404).json({
          status: 'error',
          message: 'Question not found',
        });
      }

      return res.json({
        status: 'success',
        data: question,
      });
    } catch (error) {
      logger.error('Error fetching question:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req, res) {
    try {
      const { question_id } = req.params;
      const updateData = req.body;

      const [updated] = await Question.update(updateData, {
        where: { question_id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'Question not found',
        });
      }

      const updatedQuestion = await Question.findByPk(question_id, {
        include: [
          {
            model: QuestionType,
            attributes: ['type_name', 'type_description'],
          },
        ],
      });

      logger.info('Question updated successfully', { questionId: question_id });

      return res.json({
        status: 'success',
        data: updatedQuestion,
      });
    } catch (error) {
      logger.error('Error updating question:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async delete(req, res) {
    try {
      const { question_id } = req.params;

      const deleted = await Question.destroy({
        where: { question_id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Question not found',
        });
      }

      logger.info('Question deleted successfully', { questionId: question_id });

      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting question:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  // Operações de Tipos de Perguntas
  async getAllTypes(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const types = await QuestionType.findAndCountAll({
        limit,
        offset,
        order: [['type_name', 'ASC']],
      });

      return res.json({
        status: 'success',
        data: types.rows,
        pagination: {
          total: types.count,
          page: parseInt(page),
          pages: Math.ceil(types.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching question types:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async createType(req, res) {
    try {
      const typeData = req.body;
      const type = await QuestionType.create(typeData);

      logger.info('Question type created successfully', { typeId: type.type_id });

      return res.status(201).json({
        status: 'success',
        data: type,
      });
    } catch (error) {
      logger.error('Error creating question type:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getTypeById(req, res) {
    try {
      const { type_id } = req.params;

      const type = await QuestionType.findByPk(type_id);

      if (!type) {
        return res.status(404).json({
          status: 'error',
          message: 'Question type not found',
        });
      }

      return res.json({
        status: 'success',
        data: type,
      });
    } catch (error) {
      logger.error('Error fetching question type:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async updateType(req, res) {
    try {
      const { type_id } = req.params;
      const updateData = req.body;

      const [updated] = await QuestionType.update(updateData, {
        where: { type_id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'Question type not found',
        });
      }

      const updatedType = await QuestionType.findByPk(type_id);

      logger.info('Question type updated successfully', { typeId: type_id });

      return res.json({
        status: 'success',
        data: updatedType,
      });
    } catch (error) {
      logger.error('Error updating question type:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async deleteType(req, res) {
    try {
      const { type_id } = req.params;

      const deleted = await QuestionType.destroy({
        where: { type_id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Question type not found',
        });
      }

      logger.info('Question type deleted successfully', { typeId: type_id });

      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting question type:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new QuestionController();
