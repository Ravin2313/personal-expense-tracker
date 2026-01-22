const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// Get all income
router.get('/', auth, async (req, res) => {
  try {
    const income = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add income
router.post('/', auth, async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;
    
    const income = new Income({
      user: req.user.id,
      amount,
      source,
      description,
      date: date || Date.now()
    });

    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update income
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;
    
    let income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    income = await Income.findByIdAndUpdate(
      req.params.id,
      { amount, source, description, date },
      { new: true }
    );

    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete income
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly income stats
router.get('/stats/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const income = await Income.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const total = income.reduce((sum, inc) => sum + inc.amount, 0);
    res.json({ total, count: income.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
