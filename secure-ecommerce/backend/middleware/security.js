// backend/middleware/security.js
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const hpp = require('hpp');

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = createRateLimit(15 * 60 * 1000, 100, 'Too many requests');
const authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts');

// Input validation
const validateOrder = [
  body('purchaseDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const purchaseDate = new Date(value);
      purchaseDate.setHours(0, 0, 0, 0);
      const dayOfWeek = purchaseDate.getDay();
      
      if (purchaseDate < today) {
        throw new Error('Purchase date cannot be in the past');
      }
      if (dayOfWeek === 0) { // Sunday
        throw new Error('Delivery not available on Sundays');
      }
      return true;
    }),
  body('deliveryTime')
    .isIn(['10 AM', '11 AM', '12 PM'])
    .withMessage('Invalid delivery time'),
  body('deliveryLocation')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape(),
  body('productName')
    .isLength({ min: 2, max: 100 })
    .trim()
    .escape(),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .toInt(),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// XSS Protection
const xssProtection = (req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  validateOrder,
  handleValidationErrors,
  xssProtection,
  hpp: hpp()
};