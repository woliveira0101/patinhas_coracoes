const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// Login user
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    // Find user by login (username or email)
    const user = await User.findOne({
      where: {
        [Op.or]: [{ login }, { email: login }],
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas',
      });
    }

    // Generate token using user_id instead of id
    const token = jwt.sign({ id: user.user_id, type: user.type }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Return user data and token
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          type: user.type,
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Refresh token
exports.refresh = async (req, res, next) => {
  try {
    const { user_id, type } = req.user;

    // Generate new token using user_id
    const token = jwt.sign({ id: user_id, type }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      status: 'success',
      data: { token },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

// Logout user
exports.logout = async (req, res) => {
  // Since we're using JWT, we just return success
  // Client should remove the token
  res.status(200).json({
    status: 'success',
    message: 'Logout realizado com sucesso',
  });
};

// Request password reset
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.info('Password reset requested for non-existent email', { email });
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    // Generate reset token using user_id
    const resetToken = jwt.sign({ id: user.user_id }, process.env.JWT_RESET_SECRET, {
      expiresIn: '1h',
    });

    try {
      // Send reset email with token
      await emailService.sendPasswordResetEmail(email, resetToken);

      logger.info('Password reset email sent successfully', { email });
      res.status(200).json({
        status: 'success',
        message: 'Email de redefinição enviado com sucesso',
      });
    } catch (emailError) {
      // Log email sending failure as info since it's an expected test scenario
      logger.info('Password reset email failed to send', {
        error: emailError.message,
        email: email,
      });

      return res.status(500).json({
        status: 'error',
        message: 'Erro ao enviar email de redefinição de senha',
      });
    }
  } catch (error) {
    // Log unexpected errors as errors
    logger.error('Unexpected error in password reset request:', error);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    // Find user using user_id
    const user = await User.findByPk(decoded.id);
    if (!user) {
      logger.info('Password reset attempted for non-existent user', { userId: decoded.id });
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await user.update({ password: hashedPassword });

    logger.info('Password reset successful', { userId: user.user_id });
    res.status(200).json({
      status: 'success',
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Get the token from params since we're in the catch block
      const { token } = req.params;
      logger.info('Invalid or expired reset token used', {
        error: error.message,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'undefined',
      });
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido ou expirado',
      });
    }
    logger.error('Unexpected error in password reset:', error);
    next(error);
  }
};
