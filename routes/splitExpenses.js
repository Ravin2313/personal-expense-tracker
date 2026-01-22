const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SplitExpense = require('../models/SplitExpense');
const Friend = require('../models/Friend');
const Expense = require('../models/Expense');

// Get all split expenses
router.get('/', auth, async (req, res) => {
  try {
    const splits = await SplitExpense.find({ paidBy: req.user.id })
      .populate('expense')
      .populate('friend')
      .sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unsettled splits
router.get('/unsettled', auth, async (req, res) => {
  try {
    const splits = await SplitExpense.find({ 
      paidBy: req.user.id,
      settled: false 
    })
      .populate('expense')
      .populate('friend')
      .sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create split expense
router.post('/', auth, async (req, res) => {
  try {
    const { expenseId, friendId, totalAmount, yourShare, friendShare, splitType, notes } = req.body;

    const split = new SplitExpense({
      expense: expenseId,
      paidBy: req.user.id,
      friend: friendId,
      totalAmount,
      yourShare,
      friendShare,
      splitType,
      notes,
      settled: false
    });

    await split.save();

    // Update friend balance
    const friend = await Friend.findById(friendId);
    if (friend) {
      friend.balance += friendShare; // Friend owes you
      await friend.save();
    }

    res.json(split);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Settle split expense
router.put('/:id/settle', auth, async (req, res) => {
  try {
    const split = await SplitExpense.findById(req.params.id);
    
    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }

    if (split.paidBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    split.settled = true;
    split.settledAt = new Date();
    split.settledBy = req.body.settledBy || 'manual';
    await split.save();

    // Update friend balance
    const friend = await Friend.findById(split.friend);
    if (friend) {
      friend.balance -= split.friendShare; // Reduce balance
      await friend.save();
    }

    res.json(split);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get splits by friend
router.get('/friend/:friendId', auth, async (req, res) => {
  try {
    const splits = await SplitExpense.find({ 
      paidBy: req.user.id,
      friend: req.params.friendId
    })
      .populate('expense')
      .sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
