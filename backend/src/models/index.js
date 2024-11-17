const { sequelize } = require('../config/db');
const User = require('./User');
const Pet = require('./Pet');
const Address = require('./Address');
const Adoption = require('./Adoption');
const Donation = require('./Donation');
const QuestionType = require('./QuestionType');
const Question = require('./Question');
const AdoptionQuestion = require('./AdoptionQuestion');
const Answer = require('./Answer');
const PetImage = require('./PetImage');

// Create models object
const models = {
  User,
  Pet,
  Address,
  Adoption,
  Donation,
  QuestionType,
  Question,
  AdoptionQuestion,
  Answer,
  PetImage,
};

const initializeModels = () => {
  // First initialize all models
  Object.values(models).forEach(model => {
    if (model.init) {
      model.init(sequelize);
    }
  });

  // Then set up all associations
  User.associate(models);
  Pet.associate(models);
  Address.associate(models);
  Adoption.associate(models);
  Donation.associate(models);
  QuestionType.associate(models);
  Question.associate(models);
  AdoptionQuestion.associate(models);
  Answer.associate(models);
  PetImage.associate(models);
};

module.exports = {
  ...models,
  sequelize,
  initializeModels,
};
