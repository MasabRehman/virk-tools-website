const { validationResult } = require('express-validator');

/**
 * Validation Result Handler Middleware
 * Checks for validation errors from express-validator chains.
 * If errors exist, responds with 400 and structured error details.
 * Otherwise, passes control to the next middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = { validate };
