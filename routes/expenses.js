const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const upload = multer({ dest: 'uploads/' });

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add expense
router.post('/', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, category, description, date, paymentMethod, isRecurring, tags } = req.body;

    let receiptUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      receiptUrl = result.secure_url;
    }

    const expense = new Expense({
      user: req.user.id,
      amount,
      category,
      description,
      date: date || Date.now(),
      paymentMethod,
      receipt: receiptUrl,
      isRecurring: isRecurring === 'true',
      tags: tags ? JSON.parse(tags) : []
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expense stats
router.get('/stats/:month/:year', auth, async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({ total, byCategory, count: expenses.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
