const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
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
  splitWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    settled: {
      type: Boolean,
      default: false
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Split', splitSchema);
