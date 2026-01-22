const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Friend = require('../models/Friend');
const SplitExpense = require('../models/SplitExpense');

// Get all friends
router.get('/', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ user: req.user.id }).sort({ friendName: 1 });
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add friend
router.post('/', auth, async (req, res) => {
  try {
    const { friendName, friendEmail, friendPhone } = req.body;

    const friend = new Friend({
      user: req.user.id,
      friendName,
      friendEmail,
      friendPhone,
      balance: 0
    });

    await friend.save();
    res.json(friend);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update friend
router.put('/:id', auth, async (req, res) => {
  try {
    let friend = await Friend.findById(req.params.id);
    
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (friend.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    friend = await Friend.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(friend);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete friend
router.delete('/:id', auth, async (req, res) => {
  try {
    const friend = await Friend.findById(req.params.id);
    
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (friend.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Friend.findByIdAndDelete(req.params.id);
    res.json({ message: 'Friend deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend balance summary
router.get('/balance-summary', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ user: req.user.id });
    
    let totalOwed = 0;
    let totalOwing = 0;
    
    friends.forEach(friend => {
      if (friend.balance > 0) {
        totalOwed += friend.balance; // Friends owe you
      } else {
        totalOwing += Math.abs(friend.balance); // You owe friends
      }
    });

    res.json({
      totalOwed,
      totalOwing,
      netBalance: totalOwed - totalOwing,
      friendsCount: friends.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save payment reminder
router.post('/:id/reminder', auth, async (req, res) => {
  try {
    const { method, amount, message } = req.body;
    
    const friend = await Friend.findById(req.params.id);
    
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (friend.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add reminder to history
    friend.reminders.push({
      method,
      amount,
      message,
      sentAt: new Date()
    });
    
    friend.lastReminderSent = new Date();
    
    await friend.save();
    res.json({ message: 'Reminder saved', friend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
