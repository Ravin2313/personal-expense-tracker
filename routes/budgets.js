const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

// Get monthly budget (Overall budget for the month)
router.get('/monthly/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const budget = await Budget.findOne({
      user: req.user.id,
      category: 'monthly',
      month: parseInt(month),
      year: parseInt(year)
    });
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Set monthly budget with alert settings
router.post('/monthly', auth, async (req, res) => {
  try {
    const { amount, month, year, alertSettings } = req.body;

    let budget = await Budget.findOne({
      user: req.user.id,
      category: 'monthly',
      month,
      year
    });

    if (budget) {
      budget.amount = amount;
      if (alertSettings) {
        budget.alertSettings = {
          ...budget.alertSettings,
          ...alertSettings
        };
      }
      await budget.save();
    } else {
      budget = new Budget({
        user: req.user.id,
        category: 'monthly',
        amount,
        month,
        year,
        alertSettings: alertSettings || {
          enabled: true,
          threshold80: true,
          threshold100: true,
          dailyLimit: 0
        }
      });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alert settings only
router.put('/alert-settings/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const { alertSettings } = req.body;

    let budget = await Budget.findOne({
      user: req.user.id,
      category: 'monthly',
      month: parseInt(month),
      year: parseInt(year)
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found. Please set a budget first.' });
    }

    budget.alertSettings = {
      ...budget.alertSettings,
      ...alertSettings
    };
    await budget.save();

    res.json(budget);
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
