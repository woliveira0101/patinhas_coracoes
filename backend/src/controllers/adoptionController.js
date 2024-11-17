const { Adoption, Pet, User, Question, Answer, AdoptionQuestion } = require('../models');
const logger = require('../utils/logger');
const { sequelize } = require('../config/db');

// Basic operations
exports.create = async (req, res) => {
  try {
    const { pet_id, answers } = req.body;
    const user_id = req.user.user_id;

    const adoption = await sequelize.transaction(async t => {
      // Create adoption request
      const newAdoption = await Adoption.create(
        {
          user_id,
          pet_id,
          status: 'pendente',
          request_date: new Date(),
        },
        { transaction: t }
      );

      // Create answers for the adoption questions
      if (answers && answers.length > 0) {
        const answersToCreate = answers.map(answer => ({
          adoption_id: newAdoption.adoption_id,
          question_id: answer.question_id,
          answer_content: answer.answer_content,
        }));

        await Answer.bulkCreate(answersToCreate, { transaction: t });
      }

      return newAdoption;
    });

    const createdAdoption = await Adoption.findByPk(adoption.adoption_id, {
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    logger.info('Adoption request created successfully', {
      adoptionId: adoption.adoption_id,
    });

    return res.status(201).json({
      status: 'success',
      data: createdAdoption,
    });
  } catch (error) {
    logger.error('Error creating adoption request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    const adoptions = await Adoption.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
      order: [['request_date', 'DESC']],
    });

    return res.json({
      status: 'success',
      data: adoptions.rows,
      pagination: {
        total: adoptions.count,
        page: parseInt(page),
        pages: Math.ceil(adoptions.count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching adoptions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { adoption_id } = req.params;

    const adoption = await Adoption.findByPk(adoption_id, {
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    if (!adoption) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found',
      });
    }

    return res.json({
      status: 'success',
      data: adoption,
    });
  } catch (error) {
    logger.error('Error fetching adoption request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { user_id, adoption_id } = req.params;
    const updateData = req.body;

    const [updated] = await Adoption.update(updateData, {
      where: {
        adoption_id,
        user_id,
      },
      returning: true,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found',
      });
    }

    const updatedAdoption = await Adoption.findOne({
      where: {
        adoption_id,
        user_id,
      },
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    logger.info('Adoption request updated successfully', { adoptionId: adoption_id });

    return res.json({
      status: 'success',
      data: updatedAdoption,
    });
  } catch (error) {
    logger.error('Error updating adoption request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { adoption_id } = req.params;
    const { status } = req.body;

    // Validate adoption_id
    if (!Number.isInteger(Number(adoption_id))) {
      return res.status(400).json({
        status: 'error',
        message: '"adoption_id" must be a number',
      });
    }

    // Validate status
    const validStatus = ['pendente', 'aprovado', 'reprovado', 'cancelado'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status inválido. O status deve ser: pendente, aprovado, reprovado ou cancelado',
      });
    }

    // Check if user is admin (this is handled by middleware, but adding an extra check)
    if (!req.user.is_admin) {
      return res.status(403).json({
        status: 'error',
        message: 'Não autorizado',
      });
    }

    const [updated] = await Adoption.update(
      { status },
      {
        where: { adoption_id },
        returning: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found',
      });
    }

    const updatedAdoption = await Adoption.findByPk(adoption_id, {
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    logger.info('Adoption status updated successfully', {
      adoptionId: adoption_id,
      newStatus: status,
    });

    return res.json({
      status: 'success',
      data: updatedAdoption,
    });
  } catch (error) {
    logger.error('Error updating adoption status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { user_id, adoption_id } = req.params;

    const deleted = await Adoption.destroy({
      where: {
        adoption_id,
        user_id,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found',
      });
    }

    logger.info('Adoption request deleted successfully', { adoptionId: adoption_id });

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting adoption request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// User routes methods
exports.getByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { user_id };

    if (status) {
      where.status = status;
    }

    const adoptions = await Adoption.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
      order: [['request_date', 'DESC']],
    });

    return res.json({
      status: 'success',
      data: adoptions.rows,
      pagination: {
        total: adoptions.count,
        page: parseInt(page),
        pages: Math.ceil(adoptions.count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching user adoptions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createForUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { pet_id, answers } = req.body;

    const adoption = await sequelize.transaction(async t => {
      // Create adoption request
      const newAdoption = await Adoption.create(
        {
          user_id,
          pet_id,
          status: 'pendente',
          request_date: new Date(),
        },
        { transaction: t }
      );

      // Create answers for the adoption questions
      if (answers && answers.length > 0) {
        const answersToCreate = answers.map(answer => ({
          adoption_id: newAdoption.adoption_id,
          question_id: answer.question_id,
          answer_content: answer.answer_content,
        }));

        await Answer.bulkCreate(answersToCreate, { transaction: t });
      }

      return newAdoption;
    });

    const createdAdoption = await Adoption.findByPk(adoption.adoption_id, {
      include: [
        {
          model: Pet,
          attributes: ['pet_name', 'species', 'breed'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    logger.info('Adoption request created successfully', {
      adoptionId: adoption.adoption_id,
    });

    return res.status(201).json({
      status: 'success',
      data: createdAdoption,
    });
  } catch (error) {
    logger.error('Error creating adoption request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Pet routes methods
exports.getByPetId = async (req, res) => {
  try {
    const { pet_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { pet_id };

    if (status) {
      where.status = status;
    }

    const adoptions = await Adoption.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
      order: [['request_date', 'DESC']],
    });

    return res.json({
      status: 'success',
      data: adoptions.rows,
      pagination: {
        total: adoptions.count,
        page: parseInt(page),
        pages: Math.ceil(adoptions.count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching pet adoptions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getByPetIdAndAdoptionId = async (req, res) => {
  try {
    const { pet_id, adoption_id } = req.params;

    const adoption = await Adoption.findOne({
      where: {
        adoption_id,
        pet_id,
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone_number'],
        },
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
        {
          model: Answer,
          as: 'answers',
          include: [
            {
              model: Question,
              attributes: ['question_content'],
            },
          ],
        },
      ],
    });

    if (!adoption) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found',
      });
    }

    return res.json({
      status: 'success',
      data: adoption,
    });
  } catch (error) {
    logger.error('Error fetching pet adoption:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Questions methods
exports.getQuestions = async (req, res) => {
  try {
    const { adoption_id } = req.params;

    const adoption = await Adoption.findByPk(adoption_id, {
      include: [
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
        },
      ],
    });

    if (!adoption) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption not found',
      });
    }

    return res.json({
      status: 'success',
      data: adoption.Questions,
    });
  } catch (error) {
    logger.error('Error fetching adoption questions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { adoption_id, question_id } = req.params;

    const adoption = await Adoption.findByPk(adoption_id, {
      include: [
        {
          model: Question,
          as: 'Questions',
          through: { attributes: [] },
          where: { question_id },
        },
      ],
    });

    if (!adoption || !adoption.Questions.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found for this adoption',
      });
    }

    return res.json({
      status: 'success',
      data: adoption.Questions[0],
    });
  } catch (error) {
    logger.error('Error fetching adoption question:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { adoption_id } = req.params;
    const questionData = req.body;

    const adoption = await Adoption.findByPk(adoption_id);
    if (!adoption) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption not found',
      });
    }

    const question = await Question.create(questionData);
    await AdoptionQuestion.create({
      adoption_id,
      question_id: question.question_id,
    });

    logger.info('Question added to adoption successfully', {
      adoptionId: adoption_id,
      questionId: question.question_id,
    });

    return res.status(201).json({
      status: 'success',
      data: question,
    });
  } catch (error) {
    logger.error('Error adding question to adoption:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Answers methods
exports.getAnswers = async (req, res) => {
  try {
    const { adoption_id } = req.params;

    const answers = await Answer.findAll({
      where: { adoption_id },
      include: [
        {
          model: Question,
          attributes: ['question_content'],
        },
      ],
    });

    return res.json({
      status: 'success',
      data: answers,
    });
  } catch (error) {
    logger.error('Error fetching adoption answers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.submitAnswers = async (req, res) => {
  try {
    const { adoption_id } = req.params;
    const { answers } = req.body;

    const adoption = await Adoption.findByPk(adoption_id);
    if (!adoption) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption not found',
      });
    }

    const createdAnswers = await Answer.bulkCreate(
      answers.map(answer => ({
        adoption_id,
        question_id: answer.question_id,
        answer_content: answer.answer_content,
      }))
    );

    logger.info('Answers submitted successfully', {
      adoptionId: adoption_id,
      answerCount: createdAnswers.length,
    });

    return res.status(201).json({
      status: 'success',
      data: createdAnswers,
    });
  } catch (error) {
    logger.error('Error submitting answers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getAnswerById = async (req, res) => {
  try {
    const { adoption_id, answer_id } = req.params;

    const answer = await Answer.findOne({
      where: { adoption_id, answer_id },
      include: [
        {
          model: Question,
          attributes: ['question_content'],
        },
      ],
    });

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found',
      });
    }

    return res.json({
      status: 'success',
      data: answer,
    });
  } catch (error) {
    logger.error('Error fetching answer by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    const { adoption_id, answer_id } = req.params;
    const { answer_content } = req.body;

    const [updated] = await Answer.update(
      { answer_content },
      {
        where: { adoption_id, answer_id },
        returning: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found',
      });
    }

    const updatedAnswer = await Answer.findOne({
      where: { adoption_id, answer_id },
      include: [
        {
          model: Question,
          attributes: ['question_content'],
        },
      ],
    });

    logger.info('Answer updated successfully', {
      adoptionId: adoption_id,
      answerId: answer_id,
    });

    return res.json({
      status: 'success',
      data: updatedAnswer,
    });
  } catch (error) {
    logger.error('Error updating answer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const { adoption_id, answer_id } = req.params;

    const deleted = await Answer.destroy({
      where: { adoption_id, answer_id },
    });

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Answer not found',
      });
    }

    logger.info('Answer deleted successfully', {
      adoptionId: adoption_id,
      answerId: answer_id,
    });

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting answer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
