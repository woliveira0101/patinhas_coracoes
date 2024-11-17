const bcrypt = require('bcryptjs');
const { User, Address } = require('../models');
const logger = require('../utils/logger');

class UserController {
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Address,
            attributes: ['city_name', 'state_name'],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      return res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error fetching current user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async updateCurrentUser(req, res) {
    try {
      const user_id = req.user.user_id;
      const updateData = req.body;

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const [updated] = await User.update(updateData, {
        where: { user_id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const updatedUser = await User.findByPk(user_id, {
        attributes: { exclude: ['password'] },
      });

      logger.info('Current user updated successfully', { userId: user_id });

      return res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Log as info since this is an expected validation case
        logger.info('Attempt to update user with existing email', {
          userId: req.user.user_id,
          email: error.fields.email,
        });
        return res.status(409).json({
          status: 'error',
          message: 'Email já cadastrado',
        });
      }

      logger.error('Error updating current user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async updateCurrentUserPassword(req, res) {
    try {
      const user_id = req.user.user_id;
      const { current_password, new_password } = req.body;

      // Get user with password
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(current_password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Senha atual incorreta',
        });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await User.update({ password: hashedPassword }, { where: { user_id } });

      logger.info('User password updated successfully', { userId: user_id });

      return res.json({
        status: 'success',
        message: 'Senha atualizada com sucesso',
      });
    } catch (error) {
      logger.error('Error updating user password:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async create(req, res) {
    try {
      const { password, ...userData } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with hashed password
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        is_active: true,
      });

      // Remove password from response
      const { password: _, ...userResponse } = user.toJSON();

      logger.info('User created successfully', { userId: user.user_id });

      return res.status(201).json({
        status: 'success',
        data: userResponse,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Log as info since this is an expected validation case
        logger.info('Attempt to create user with existing email', {
          email: error.fields.email,
        });
        return res.status(409).json({
          status: 'error',
          message: 'Email já cadastrado',
        });
      }

      logger.error('Error creating user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const users = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit,
        offset,
        include: [
          {
            model: Address,
            attributes: ['city_name', 'state_name'],
          },
        ],
      });

      return res.json({
        status: 'success',
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          pages: Math.ceil(users.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findByPk(user_id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Address,
            attributes: ['city_name', 'state_name'],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      return res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      logger.error('Error fetching user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req, res) {
    try {
      const { user_id } = req.params;
      const updateData = req.body;

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const [updated] = await User.update(updateData, {
        where: { user_id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const updatedUser = await User.findByPk(user_id, {
        attributes: { exclude: ['password'] },
      });

      logger.info('User updated successfully', { userId: user_id });

      return res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Log as info since this is an expected validation case
        logger.info('Attempt to update user with existing email', {
          userId: user_id,
          email: error.fields.email,
        });
        return res.status(409).json({
          status: 'error',
          message: 'Email já cadastrado',
        });
      }

      logger.error('Error updating user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async promoteToAdmin(req, res) {
    try {
      const { user_id } = req.params;
      const { is_admin } = req.body;

      // Verify if user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Update user's admin status
      await User.update({ is_admin }, { where: { user_id } });

      const updatedUser = await User.findByPk(user_id, {
        attributes: { exclude: ['password'] },
      });

      logger.info('User promoted to admin successfully', { userId: user_id });

      return res.json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      logger.error('Error promoting user to admin:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async delete(req, res) {
    try {
      const { user_id } = req.params;

      const deleted = await User.destroy({
        where: { user_id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      logger.info('User deleted successfully', { userId: user_id });

      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new UserController();
