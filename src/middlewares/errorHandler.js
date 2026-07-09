/**
 * VIRK Tools & Equipment - Global Error Handler Middleware
 *
 * Provides centralized error handling for the entire application.
 * Catches all errors thrown in route handlers and middleware.
 */

/**
 * Custom application error class with HTTP status code support.
 * Use this in services/controllers: throw new AppError('message', 404)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 - Route not found.
 * This middleware is placed after all route definitions.
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Global error handler middleware.
 * Must have 4 parameters (err, req, res, next) to be recognized by Express as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error
  if (statusCode >= 500 || !isProduction) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}` +
      (!isProduction ? `\n${err.stack}` : ''));
  }

  // Build the error response
  const response = {
    success: false,
    message: isProduction && statusCode >= 500
      ? 'Internal server error'
      : err.message || 'Something went wrong',
    ...(err.errors && { errors: err.errors }),
  };

  // Include stack trace in development
  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  notFoundHandler,
  globalErrorHandler,
  errorHandler: globalErrorHandler, // alias for backward compatibility
};
