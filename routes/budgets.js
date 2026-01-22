const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

// Get budgets
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const budgets = await Budget.find({
      user: req.user.id,
      month: parseInt(month),
      year: parseInt(year)
    });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set budget
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    let budget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year
    });

    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = new Budget({
        user: req.user.id,
        category,
        amount,
        month,
        year
      });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
