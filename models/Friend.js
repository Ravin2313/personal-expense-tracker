const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friendUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  friendName: {
    type: String,
    required: true
  },
  friendEmail: {
    type: String
  },
  friendPhone: {
    type: String
  },
  balance: {
    type: Number,
    default: 0 // Positive = friend owes you, Negative = you owe friend
  },
  reminders: [{
    method: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'link']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    message: String
  }],
  lastReminderSent: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Friend', friendSchema);
