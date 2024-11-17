const { ValidationError } = require('joi');
const logger = require('../utils/logger');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Check if schema is defined
      if (!schema) {
        logger.error('Validation schema is undefined');
        return res.status(500).json({
          status: 'error',
          message: 'Validation schema not found',
        });
      }

      // Store validated values to merge with subsequent validations
      if (!req._validatedValues) {
        req._validatedValues = {};
      }

      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: false, // Changed to false to preserve other fields
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Validation error:', { errors });

        // Retorna a primeira mensagem de erro como mensagem principal
        return res.status(400).json({
          status: 'error',
          message: errors[0].message,
          errors,
        });
      }

      // Merge with previously validated values for this property
      if (property === 'params') {
        req._validatedValues[property] = {
          ...req._validatedValues[property],
          ...value,
        };
        req[property] = req._validatedValues[property];
      } else {
        // For non-params properties, just use the validated value
        req[property] = value;
      }

      next();
    } catch (err) {
      logger.error('Validation middleware error:', err);

      // If the error is related to schema validation, return 400
      if (err instanceof ValidationError) {
        const errors = err.details?.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })) || [{ message: err.message }];

        return res.status(400).json({
          status: 'error',
          message: errors[0].message,
          errors,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation',
      });
    }
  };
};

module.exports = validate;
