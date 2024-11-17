const express = require('express');
const router = express.Router();
const multer = require('multer');
const petController = require('../controllers/petController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware to validate pet_id in body
const validatePetId = (req, res, next) => {
  const { pet_id } = req.body;

  if (!pet_id) {
    return res.status(400).json({
      status: 'error',
      message: 'pet_id is required in request body',
    });
  }

  if (!Number.isInteger(Number(pet_id))) {
    return res.status(400).json({
      status: 'error',
      message: 'pet_id must be a valid integer',
    });
  }

  next();
};

// Operações Básicas de Imagens dos Pets

// Retorna uma lista de todas as imagens dos pets
router.get('/', validate(schemas.pagination, 'query'), petController.getAllImages);

// Adiciona uma nova imagem de pet ao sistema
router.post('/', upload.single('image'), validatePetId, petController.addImage);

// Retorna detalhes da imagem com o ID especificado
router.get('/:image_id', validate(schemas.idImageParam, 'params'), petController.getImageById);

// Remove a imagem com o ID especificado
router.delete('/:image_id', validate(schemas.idImageParam, 'params'), petController.deleteImage);

module.exports = router;
