const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, errors);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  logger.error('Error 💥', {
    error: err,
    stack: err.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    // Mongoose duplicate key
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    // Mongoose validation error
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    // JWT errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // Syntax error in request body
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      error = new AppError('Invalid JSON payload', 400);
    }

    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        errors: error.errors,
        requestId: req.requestId,
      });
    }

    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      requestId: req.requestId,
    });
  }

  // Development mode: send detailed error
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });
};

module.exports = { errorHandler, AppError };
