const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  budgetAlertSettings: {
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
    },
    notificationSound: {
      type: Boolean,
      default: true
    }
  },
  telegramSettings: {
    chatId: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: false
    },
    dailyReport: {
      type: Boolean,
      default: true
    },
    weeklyReport: {
      type: Boolean,
      default: true
    },
    monthlyReport: {
      type: Boolean,
      default: true
    },
    budgetAlerts: {
      type: Boolean,
      default: true
    },
    friendReminders: {
      type: Boolean,
      default: true
    },
    reportTime: {
      type: String,
      default: '21:00' // 9 PM
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
