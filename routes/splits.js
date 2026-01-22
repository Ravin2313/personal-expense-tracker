const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Split = require('../models/Split');

// Get all splits
router.get('/', auth, async (req, res) => {
  try {
    const splits = await Split.find({
      $or: [
        { paidBy: req.user.id },
        { 'splitWith.user': req.user.id }
      ]
    }).populate('paidBy expense splitWith.user');
    res.json(splits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create split
router.post('/', auth, async (req, res) => {
  try {
    const { expense, splitWith, totalAmount, description } = req.body;

    const split = new Split({
      expense,
      paidBy: req.user.id,
      splitWith,
      totalAmount,
      description
    });

    await split.save();
    res.json(split);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Settle split
router.put('/:id/settle/:userId', auth, async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    
    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }

    const splitUser = split.splitWith.find(s => s.user.toString() === req.params.userId);
    if (splitUser) {
      splitUser.settled = true;
      await split.save();
    }

    res.json(split);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
