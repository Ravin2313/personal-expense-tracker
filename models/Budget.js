const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  },
  alertSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold80: {
      type: Boolean,
      default: true
    },
    threshold100: {
      type: Boolean,
      default: true
    },
    dailyLimit: {
      type: Number,
      default: 0
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['warning_80', 'danger_100', 'daily_limit', 'category_exceeded']
    },
    message: String,
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
