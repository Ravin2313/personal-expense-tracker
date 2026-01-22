const mongoose = require('mongoose');

const splitExpenseSchema = new mongoose.Schema({
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friend',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  yourShare: {
    type: Number,
    required: true
  },
  friendShare: {
    type: Number,
    required: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'custom', 'full'],
    default: 'equal'
  },
  settled: {
    type: Boolean,
    default: false
  },
  settledAt: {
    type: Date
  },
  settledBy: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SplitExpense', splitExpenseSchema);
