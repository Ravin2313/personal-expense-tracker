const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const telegramBot = require('../services/telegramBot');

// Update Telegram settings
router.post('/settings', auth, async (req, res) => {
  try {
    const { chatId, enabled, dailyReport, weeklyReport, monthlyReport, budgetAlerts, friendReminders } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update settings
    user.telegramSettings = {
      chatId: chatId || user.telegramSettings.chatId,
      enabled: enabled !== undefined ? enabled : user.telegramSettings.enabled,
      dailyReport: dailyReport !== undefined ? dailyReport : user.telegramSettings.dailyReport,
      weeklyReport: weeklyReport !== undefined ? weeklyReport : user.telegramSettings.weeklyReport,
      monthlyReport: monthlyReport !== undefined ? monthlyReport : user.telegramSettings.monthlyReport,
      budgetAlerts: budgetAlerts !== undefined ? budgetAlerts : user.telegramSettings.budgetAlerts,
      friendReminders: friendReminders !== undefined ? friendReminders : user.telegramSettings.friendReminders,
      reportTime: '21:00'
    };
    
    await user.save();
    
    // Send confirmation message
    if (chatId && enabled && telegramBot.isReady()) {
      await telegramBot.sendMessage(chatId, `✅ Telegram notifications enabled!\n\nYou'll receive:\n• Daily reports at 9:00 PM\n• Weekly reports on Sunday\n• Monthly reports on 1st\n• Budget alerts\n• Friend reminders`);
    }
    
    res.json({ 
      message: 'Telegram settings updated successfully',
      settings: user.telegramSettings 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Telegram settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ settings: user.telegramSettings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test notification
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.telegramSettings.chatId) {
      return res.status(400).json({ message: 'Telegram Chat ID not configured' });
    }
    
    if (!telegramBot.isReady()) {
      return res.status(503).json({ message: 'Telegram bot not initialized' });
    }
    
    const testMessage = `🧪 Test Notification\n\nYour Telegram bot is working perfectly! ✅\n\nYou'll receive automated reports at:\n• Daily: 9:00 PM\n• Weekly: Sunday 9:00 PM\n• Monthly: 1st at 9:00 PM`;
    
    const sent = await telegramBot.sendMessage(user.telegramSettings.chatId, testMessage);
    
    if (sent) {
      res.json({ message: 'Test notification sent successfully!' });
    } else {
      res.status(500).json({ message: 'Failed to send test notification' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
