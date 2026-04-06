import { body, param, validationResult } from 'express-validator';

// Return 422 with all errors if validation failed
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

export const validateItem = [
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 100 }).withMessage('Item name must be under 100 characters')
    .escape(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters')
    .escape(),
  body('dateLostOrFound')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['lost', 'found', 'claimed']).withMessage('Status must be lost, found, or claimed'),
  body('contactInfo')
    .trim()
    .notEmpty().withMessage('Contact info is required')
    .isLength({ max: 200 }).withMessage('Contact info must be under 200 characters')
    .escape(),
  handleValidation,
];

export const validateStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['lost', 'found', 'claimed']).withMessage('Status must be lost, found, or claimed'),
  handleValidation,
];

export const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];
