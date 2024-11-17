const { Donation, Pet, User } = require('../models');
const logger = require('../utils/logger');
const { sequelize } = require('../config/db');

class DonationController {
  async create(req, res) {
    try {
      const donationData = {
        ...req.body,
        user_id: req.user.user_id,
        donation_date: new Date(),
      };

      const donation = await Donation.create(donationData);

      const createdDonation = await Donation.findByPk(donation.donation_id, {
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
          {
            model: User,
            attributes: ['name', 'email', 'phone_number'],
          },
        ],
      });

      logger.info('Donation created successfully', {
        donationId: donation.donation_id,
      });

      return res.status(201).json({
        status: 'success',
        data: createdDonation,
      });
    } catch (error) {
      logger.error('Error creating donation:', error);
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

      const donations = await Donation.findAndCountAll({
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
        ],
        order: [['donation_date', 'DESC']],
      });

      return res.json({
        status: 'success',
        data: donations.rows,
        pagination: {
          total: donations.count,
          page: parseInt(page),
          pages: Math.ceil(donations.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching donations:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getByUser(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const donations = await Donation.findAndCountAll({
        where: { user_id: req.user.user_id },
        limit,
        offset,
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
        ],
        order: [['donation_date', 'DESC']],
      });

      return res.json({
        status: 'success',
        data: donations.rows,
        pagination: {
          total: donations.count,
          page: parseInt(page),
          pages: Math.ceil(donations.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching user donations:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getByUserId(req, res) {
    try {
      const { user_id } = req.params;

      // Check if user is trying to access their own donations or is admin
      if (!req.user.is_admin && req.user.user_id !== parseInt(user_id)) {
        return res.status(403).json({
          status: 'error',
          message: 'Não autorizado',
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const donations = await Donation.findAndCountAll({
        where: { user_id },
        limit,
        offset,
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
        ],
        order: [['donation_date', 'DESC']],
      });

      return res.json({
        status: 'success',
        data: donations.rows,
        pagination: {
          total: donations.count,
          page: parseInt(page),
          pages: Math.ceil(donations.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching user donations:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async createForUser(req, res) {
    try {
      const { user_id } = req.params;
      const donationData = {
        ...req.body,
        user_id,
        donation_date: new Date(),
      };

      const donation = await Donation.create(donationData);

      const createdDonation = await Donation.findByPk(donation.donation_id, {
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
        ],
      });

      logger.info('Donation created successfully', {
        donationId: donation.donation_id,
      });

      return res.status(201).json({
        status: 'success',
        data: createdDonation,
      });
    } catch (error) {
      logger.error('Error creating donation:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req, res) {
    try {
      const { donation_id } = req.params;

      const donation = await Donation.findOne({
        where: { donation_id },
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
          {
            model: User,
            attributes: ['name', 'email', 'phone_number'],
          },
        ],
      });

      if (!donation) {
        return res.status(404).json({
          status: 'error',
          message: 'Donation not found',
        });
      }

      return res.json({
        status: 'success',
        data: donation,
      });
    } catch (error) {
      logger.error('Error fetching donation:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async delete(req, res) {
    try {
      const { donation_id } = req.params;

      const deleted = await Donation.destroy({
        where: { donation_id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Donation not found',
        });
      }

      logger.info('Donation deleted successfully', { donationId: donation_id });

      return res.status(200).json({
        status: 'success',
        message: 'Donation deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting donation:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getByPetId(req, res) {
    try {
      const { pet_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const donations = await Donation.findAndCountAll({
        where: { pet_id },
        limit,
        offset,
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'phone_number'],
          },
        ],
        order: [['donation_date', 'DESC']],
      });

      return res.json({
        status: 'success',
        data: donations.rows,
        pagination: {
          total: donations.count,
          page: parseInt(page),
          pages: Math.ceil(donations.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching pet donations:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getByPetIdAndDonationId(req, res) {
    try {
      const { pet_id, donation_id } = req.params;

      const donation = await Donation.findOne({
        where: {
          donation_id,
          pet_id,
        },
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'phone_number'],
          },
        ],
      });

      if (!donation) {
        return res.status(404).json({
          status: 'error',
          message: 'Donation not found',
        });
      }

      return res.json({
        status: 'success',
        data: donation,
      });
    } catch (error) {
      logger.error('Error fetching pet donation:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new DonationController();
