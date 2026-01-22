const cron = require('node-cron');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Friend = require('../models/Friend');
const telegramBot = require('./telegramBot');
const { 
  generateDailyReport, 
  generateWeeklyReport, 
  generateMonthlyReport,
  getFriendsOwingMoney 
} = require('../utils/reportGenerator');

class ScheduledJobs {
  constructor() {
    this.jobs = [];
  }

  async sendDailyReports() {
    try {
      console.log('📅 Sending daily reports...');
      
      const users = await User.find({ 
        'telegramSettings.enabled': true,
        'telegramSettings.dailyReport': true,
        'telegramSettings.chatId': { $ne: '' }
      });

      for (const user of users) {
        try {
          // Get user data
          const expenses = await Expense.find({ user: user._id });
          const income = await Income.find({ user: user._id });
          const budget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

          // Generate report
          const reportData = generateDailyReport(expenses, income, budget);

          // Send via Telegram
          await telegramBot.sendDailyReport(user.telegramSettings.chatId, reportData);
          
          console.log(`✅ Daily report sent to user: ${user.name}`);
        } catch (error) {
          console.error(`Failed to send daily report to ${user.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in sendDailyReports:', error);
    }
  }

  async sendWeeklyReports() {
    try {
      console.log('📊 Sending weekly reports...');
      
      const users = await User.find({ 
        'telegramSettings.enabled': true,
        'telegramSettings.weeklyReport': true,
        'telegramSettings.chatId': { $ne: '' }
      });

      for (const user of users) {
        try {
          const expenses = await Expense.find({ user: user._id });
          const income = await Income.find({ user: user._id });

          const reportData = generateWeeklyReport(expenses, income);

          await telegramBot.sendWeeklyReport(user.telegramSettings.chatId, reportData);
          
          console.log(`✅ Weekly report sent to user: ${user.name}`);
        } catch (error) {
          console.error(`Failed to send weekly report to ${user.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in sendWeeklyReports:', error);
    }
  }

  async sendMonthlyReports() {
    try {
      console.log('📈 Sending monthly reports...');
      
      const users = await User.find({ 
        'telegramSettings.enabled': true,
        'telegramSettings.monthlyReport': true,
        'telegramSettings.chatId': { $ne: '' }
      });

      for (const user of users) {
        try {
          const expenses = await Expense.find({ user: user._id });
          const income = await Income.find({ user: user._id });
          const budget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

          const reportData = generateMonthlyReport(expenses, income, budget);

          await telegramBot.sendMonthlyReport(user.telegramSettings.chatId, reportData);
          
          console.log(`✅ Monthly report sent to user: ${user.name}`);
        } catch (error) {
          console.error(`Failed to send monthly report to ${user.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in sendMonthlyReports:', error);
    }
  }

  async sendFriendReminders() {
    try {
      console.log('👥 Sending friend payment reminders...');
      
      const users = await User.find({ 
        'telegramSettings.enabled': true,
        'telegramSettings.friendReminders': true,
        'telegramSettings.chatId': { $ne: '' }
      });

      for (const user of users) {
        try {
          const friends = await Friend.find({ user: user._id });
          const friendsOwing = getFriendsOwingMoney(friends);

          if (friendsOwing.length > 0) {
            await telegramBot.sendFriendReminder(user.telegramSettings.chatId, friendsOwing);
            console.log(`✅ Friend reminder sent to user: ${user.name}`);
          }
        } catch (error) {
          console.error(`Failed to send friend reminder to ${user.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in sendFriendReminders:', error);
    }
  }

  startJobs() {
    console.log('🚀 Starting scheduled jobs...');

    // Daily report at 9 PM (21:00)
    const dailyJob = cron.schedule('0 21 * * *', () => {
      this.sendDailyReports();
    });
    this.jobs.push(dailyJob);
    console.log('✅ Daily report job scheduled: 9:00 PM');

    // Weekly report on Sunday at 9 PM
    const weeklyJob = cron.schedule('0 21 * * 0', () => {
      this.sendWeeklyReports();
    });
    this.jobs.push(weeklyJob);
    console.log('✅ Weekly report job scheduled: Sunday 9:00 PM');

    // Monthly report on 1st at 9 PM
    const monthlyJob = cron.schedule('0 21 1 * *', () => {
      this.sendMonthlyReports();
    });
    this.jobs.push(monthlyJob);
    console.log('✅ Monthly report job scheduled: 1st at 9:00 PM');

    // Friend reminders every Sunday at 8 PM
    const friendJob = cron.schedule('0 20 * * 0', () => {
      this.sendFriendReminders();
    });
    this.jobs.push(friendJob);
    console.log('✅ Friend reminder job scheduled: Sunday 8:00 PM');

    console.log('🎉 All scheduled jobs started successfully!');
  }

  stopJobs() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('⏹️ All scheduled jobs stopped');
  }
}

const scheduledJobs = new ScheduledJobs();

module.exports = scheduledJobs;
