const express = require('express');
const router = express.Router();
const multer = require('multer');
const petController = require('../controllers/petController');
const adoptionController = require('../controllers/adoptionController');
const donationController = require('../controllers/donationController');
const validate = require('../middleware/validate');
const schemas = require('../utils/validationSchemas');
const { authenticate } = require('../utils/auth');

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

// Operações Básicas

// Criar um novo pet
router.post('/', authenticate, validate(schemas.createPet), petController.create);

// Obter todos os pets com filtros e paginação
router.get('/', authenticate, validate(schemas.pagination, 'query'), petController.getAll);

// Obter pet por ID
router.get('/:pet_id', authenticate, validate(schemas.idPetParam, 'params'), petController.getById);

// Atualizar pet
router.put(
  '/:pet_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.updatePet),
  petController.update
);

// Deletar pet
router.delete(
  '/:pet_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  petController.delete
);

// Imagens do Pet

// Obter todas as imagens do pet
router.get(
  '/:pet_id/images',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  petController.getImages
);

// Adicionar uma nova imagem ao pet
router.post(
  '/:pet_id/images',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  upload.single('image'),
  petController.addImage
);

// Obter uma imagem específica do pet
router.get(
  '/:pet_id/images/:image_id',
  authenticate,
  validate(schemas.petImageParams, 'params'),
  petController.getImageById
);

// Remover uma imagem específica do pet
router.delete(
  '/:pet_id/images/:image_id',
  authenticate,
  validate(schemas.petImageParams, 'params'),
  petController.deleteImage
);

// Adoções do Pet

// Obter todas as solicitações de adoção relacionadas ao pet
router.get(
  '/:pet_id/adoptions',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.pagination, 'query'),
  adoptionController.getByPetId
);

// Obter detalhes de uma adoção específica do pet
router.get(
  '/:pet_id/adoptions/:adoption_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.idAdoptionParam, 'params'),
  adoptionController.getByPetIdAndAdoptionId
);

// Doações do Pet

// Obter o histórico de doações relacionadas ao pet
router.get(
  '/:pet_id/donations',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.pagination, 'query'),
  donationController.getByPetId
);

// Obter detalhes de uma doação específica relacionada ao pet
router.get(
  '/:pet_id/donations/:donation_id',
  authenticate,
  validate(schemas.idPetParam, 'params'),
  validate(schemas.idDonationParam, 'params'),
  donationController.getByPetIdAndDonationId
);

module.exports = router;
