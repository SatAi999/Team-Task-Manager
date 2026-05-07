const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `${err.meta?.target?.join(', ')} already exists`;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    status: 'error',
    message: err.isOperational ? message : 'Something went wrong',
  });
};

module.exports = errorHandler;
