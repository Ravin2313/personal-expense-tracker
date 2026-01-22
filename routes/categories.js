const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Other'
];

router.get('/', auth, (req, res) => {
  res.json(defaultCategories);
});

module.exports = router;
