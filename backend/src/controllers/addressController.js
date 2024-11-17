const { Address } = require('../models');
const logger = require('../utils/logger');

// Basic operations
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, state } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (city) {
      where.city_name = city;
    }
    if (state) {
      where.state_name = state;
    }

    const addresses = await Address.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      status: 'success',
      data: addresses.rows,
      pagination: {
        total: addresses.count,
        page: parseInt(page),
        pages: Math.ceil(addresses.count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching addresses:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.create = async (req, res) => {
  try {
    // Pega o user_id do usuário autenticado
    const user_id = req.user.user_id;

    const address = await Address.create({
      ...req.body,
      user_id,
    });

    logger.info('Address created successfully', { addressId: address.address_id });

    return res.status(201).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    logger.error('Error creating address:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { address_id } = req.params;

    const address = await Address.findByPk(address_id);

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // Check if user has permission to access this address
    if (!req.user.is_admin && address.user_id !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this address',
      });
    }

    return res.json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    logger.error('Error fetching address:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { address_id } = req.params;

    // First check if address exists and user has permission
    const address = await Address.findByPk(address_id);

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // Check if user has permission to update this address
    if (!req.user.is_admin && address.user_id !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to update this address',
      });
    }

    const [updated] = await Address.update(req.body, {
      where: { address_id },
      returning: true,
    });

    const updatedAddress = await Address.findByPk(address_id);

    logger.info('Address updated successfully', { addressId: address_id });

    return res.json({
      status: 'success',
      data: updatedAddress,
    });
  } catch (error) {
    logger.error('Error updating address:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { address_id } = req.params;

    // First check if address exists and user has permission
    const address = await Address.findByPk(address_id);

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // Check if user has permission to delete this address
    if (!req.user.is_admin && address.user_id !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to delete this address',
      });
    }

    await Address.destroy({
      where: { address_id },
    });

    logger.info('Address deleted successfully', { addressId: address_id });

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting address:', error);
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

    // Check if user has permission to access these addresses
    if (!req.user.is_admin && parseInt(user_id) !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to access these addresses',
      });
    }

    const addresses = await Address.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
    });

    return res.json({
      status: 'success',
      data: addresses,
    });
  } catch (error) {
    logger.error('Error fetching user addresses:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getAddressByUserIdAndAddressId = async (req, res) => {
  try {
    const { user_id, address_id } = req.params;

    // Check if user has permission to access this address
    if (!req.user.is_admin && parseInt(user_id) !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to access this address',
      });
    }

    const address = await Address.findOne({
      where: {
        address_id,
        user_id,
      },
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found for this user',
      });
    }

    return res.json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    logger.error('Error fetching user address:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.createForUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user has permission to create address for this user
    if (!req.user.is_admin && parseInt(user_id) !== req.user.user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to create address for this user',
      });
    }

    const address = await Address.create({
      ...req.body,
      user_id,
    });

    logger.info('Address created successfully', { addressId: address.address_id });

    return res.status(201).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    logger.error('Error creating address:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
