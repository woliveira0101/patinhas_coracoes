const { Pet, PetImage, Donation, User, Adoption } = require('../models');
const logger = require('../utils/logger');
const storageService = require('../utils/storage');
const { Op } = require('sequelize');
const path = require('path');

class PetController {
  async getAllImages(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const images = await PetImage.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Add full URLs for images
      const imagesWithUrls = images.rows.map(image => ({
        ...image.toJSON(),
        image: storageService.getFileUrl(image.image),
      }));

      return res.json({
        status: 'success',
        data: imagesWithUrls,
        pagination: {
          total: images.count,
          page: parseInt(page),
          pages: Math.ceil(images.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching pet images:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getImages(req, res) {
    try {
      const { pet_id } = req.params;

      const images = await PetImage.findAll({
        where: { pet_id },
        order: [['created_at', 'DESC']],
      });

      // Add full URLs for images
      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        image: storageService.getFileUrl(image.image),
      }));

      return res.json({
        status: 'success',
        data: imagesWithUrls,
      });
    } catch (error) {
      logger.error('Error fetching pet images:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async addImage(req, res) {
    try {
      // Get pet_id from params or body
      const pet_id = req.params.pet_id || req.body.pet_id;

      logger.info('Adding image for pet:', { pet_id, hasFile: !!req.file });

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No image file provided',
        });
      }

      // Verify the pet exists
      const pet = await Pet.findByPk(pet_id);
      if (!pet) {
        logger.warn('Pet not found when adding image:', { pet_id });
        return res.status(404).json({
          status: 'error',
          message: 'Pet not found',
        });
      }

      try {
        // Save the file using storage service
        const savedFilePath = await storageService.saveFile(req.file);

        // Create the image record with the file path
        const petImage = await PetImage.create({
          pet_id: parseInt(pet_id, 10),
          image: savedFilePath,
        });

        logger.info('Pet image added successfully', {
          petId: pet_id,
          imageId: petImage.image_id,
          filePath: savedFilePath,
        });

        // Return the image with full URL
        const imageWithUrl = {
          ...petImage.toJSON(),
          image: storageService.getFileUrl(petImage.image),
        };

        return res.status(201).json({
          status: 'success',
          data: imageWithUrl,
        });
      } catch (error) {
        logger.error('Error saving image:', error);
        if (error.message.includes('path too long')) {
          return res.status(400).json({
            status: 'error',
            message: 'File name is too long',
          });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error adding pet image:', error);

      // Check if it's a multer error
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File size too large. Maximum size is 5MB',
        });
      }

      if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
          status: 'error',
          message: error.message,
        });
      }

      // Check if it's a database constraint error
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data provided',
          errors: error.errors?.map(err => ({
            field: err.path,
            message: err.message,
          })) || [{ message: error.message }],
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getImageById(req, res) {
    try {
      const { image_id, pet_id } = req.params;
      const whereClause = { image_id };

      if (pet_id) {
        whereClause.pet_id = pet_id;
      }

      const image = await PetImage.findOne({
        where: whereClause,
        include: [
          {
            model: Pet,
            attributes: ['pet_name', 'species', 'breed'],
          },
        ],
      });

      if (!image) {
        return res.status(404).json({
          status: 'error',
          message: pet_id ? 'Image not found for this pet' : 'Image not found',
        });
      }

      // Add full URL for image
      const imageWithUrl = {
        ...image.toJSON(),
        image: storageService.getFileUrl(image.image),
      };

      return res.json({
        status: 'success',
        data: imageWithUrl,
      });
    } catch (error) {
      logger.error('Error fetching pet image:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async deleteImage(req, res) {
    try {
      const { image_id, pet_id } = req.params;
      const whereClause = { image_id };

      if (pet_id) {
        whereClause.pet_id = pet_id;
      }

      // Find the image first to get the file path
      const image = await PetImage.findOne({ where: whereClause });
      if (!image) {
        return res.status(404).json({
          status: 'error',
          message: pet_id ? 'Image not found for this pet' : 'Image not found',
        });
      }

      try {
        // Delete the file from storage
        await storageService.deleteFile(image.image);
      } catch (error) {
        logger.error('Error deleting file from storage:', error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete the database record
      await image.destroy();

      logger.info('Pet image deleted successfully', { imageId: image_id, petId: pet_id });

      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting pet image:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  // Métodos básicos de pets
  async create(req, res) {
    try {
      const petData = req.body;
      const pet = await Pet.create(petData);
      logger.info('Pet created successfully', { petId: pet.pet_id });

      return res.status(201).json({
        status: 'success',
        data: pet,
      });
    } catch (error) {
      logger.error('Error creating pet:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, species, city, state, status } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      // Normalize species to match the model's setter
      if (species) {
        const normalizedSpecies = species.toLowerCase();
        const speciesMap = {
          dog: 'cachorro',
          dogs: 'cachorro',
          cachorro: 'cachorro',
          cat: 'gato',
          cats: 'gato',
          gato: 'gato',
          other: 'outro',
          outro: 'outro',
        };
        where.species = speciesMap[normalizedSpecies] || normalizedSpecies;
      }

      // Case-insensitive city filter
      if (city) {
        where.city = { [Op.iLike]: city };
      }

      // Case-insensitive state filter
      if (state) {
        where.state = { [Op.iLike]: state };
      }

      // Filter by adoption status with case-insensitive comparison
      if (status) {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'disponivel') {
          where.is_adopted = false;
        } else if (normalizedStatus === 'adotado') {
          where.is_adopted = true;
        }
      }

      const pets = await Pet.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          {
            model: PetImage,
            as: 'PetImages',
            attributes: ['image'],
          },
          {
            model: Donation,
            as: 'donations',
            include: [
              {
                model: User,
                attributes: ['name', 'phone_number'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      // Transform image URLs
      const petsWithUrls = pets.rows.map(pet => {
        const petJson = pet.toJSON();
        if (petJson.PetImages) {
          petJson.PetImages = petJson.PetImages.map(image => ({
            ...image,
            image: storageService.getFileUrl(image.image),
          }));
        }
        return petJson;
      });

      return res.json({
        status: 'success',
        data: petsWithUrls,
        pagination: {
          total: pets.count,
          page: parseInt(page),
          pages: Math.ceil(pets.count / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching pets:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req, res) {
    try {
      const { pet_id } = req.params;

      const pet = await Pet.findByPk(pet_id, {
        include: [
          {
            model: PetImage,
            as: 'PetImages',
            attributes: ['image'],
          },
          {
            model: Donation,
            as: 'donations',
            include: [
              {
                model: User,
                attributes: ['name', 'phone_number'],
              },
            ],
          },
        ],
      });

      if (!pet) {
        return res.status(404).json({
          status: 'error',
          message: 'Pet not found',
        });
      }

      // Transform image URLs
      const petJson = pet.toJSON();
      if (petJson.PetImages) {
        petJson.PetImages = petJson.PetImages.map(image => ({
          ...image,
          image: storageService.getFileUrl(image.image),
        }));
      }

      return res.json({
        status: 'success',
        data: petJson,
      });
    } catch (error) {
      logger.error('Error fetching pet:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req, res) {
    try {
      const { pet_id } = req.params;
      const updateData = req.body;

      const pet = await Pet.findByPk(pet_id);
      if (!pet) {
        return res.status(404).json({
          status: 'error',
          message: 'Pet not found',
        });
      }

      await pet.update(updateData);

      const updatedPet = await Pet.findByPk(pet_id, {
        include: [
          {
            model: PetImage,
            as: 'PetImages',
            attributes: ['image'],
          },
        ],
      });

      // Transform image URLs
      const petJson = updatedPet.toJSON();
      if (petJson.PetImages) {
        petJson.PetImages = petJson.PetImages.map(image => ({
          ...image,
          image: storageService.getFileUrl(image.image),
        }));
      }

      logger.info('Pet updated successfully', { petId: pet_id });

      return res.json({
        status: 'success',
        data: petJson,
      });
    } catch (error) {
      logger.error('Error updating pet:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message,
          })),
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async delete(req, res) {
    try {
      const { pet_id } = req.params;

      const deleted = await Pet.destroy({
        where: { pet_id },
      });

      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Pet not found',
        });
      }

      logger.info('Pet deleted successfully', { petId: pet_id });

      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting pet:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

module.exports = new PetController();
