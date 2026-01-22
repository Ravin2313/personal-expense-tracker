const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.isInitialized = false;
  }

  initialize(token) {
    if (!token) {
      console.log('⚠️ Telegram bot token not provided. Bot features disabled.');
      return false;
    }

    try {
      // Set polling options with error handling
      this.bot = new TelegramBot(token, { 
        polling: {
          interval: 1000,
          autoStart: true,
          params: {
            timeout: 10
          }
        }
      });

      // Handle polling errors gracefully
      this.bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
          console.error('⚠️ Telegram Bot Conflict: Another instance is already running with this token.');
          console.error('💡 Solution: Stop other instances or use a different bot token.');
          // Stop polling to prevent spam
          this.bot.stopPolling();
          this.isInitialized = false;
          return;
        }
        console.error('Telegram polling error:', error.message);
      });

      // Handle webhook errors
      this.bot.on('webhook_error', (error) => {
        console.error('Telegram webhook error:', error.message);
      });

      this.isInitialized = true;
      this.setupCommands();
      this.setupScheduledReports();
      console.log('✅ Telegram bot initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  setupCommands() {
    if (!this.bot) return;

    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🎉 Welcome to Expense Tracker Bot!

Your Chat ID: ${chatId}

📊 Available Commands:
/today - Today's summary
/week - This week's summary
/month - This month's summary
/budget - Budget status
/help - Show all commands

💡 Add this Chat ID to your app settings to receive automatic reports!
      `;
      this.bot.sendMessage(chatId, welcomeMessage);
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
📚 Expense Tracker Bot Commands:

📊 Reports:
/today - Today's expense summary
/week - This week's summary
/month - This month's summary

💰 Budget:
/budget - Current budget status
/savings - Savings overview

👥 Friends:
/friends - Friend balances
/pending - Pending payments

⚙️ Settings:
/settings - Notification preferences
/help - Show this help message

🔔 You'll receive:
• Daily reports at 9:00 PM
• Weekly reports on Sunday at 9:00 PM
• Monthly reports on 1st of month
• Budget alerts (80%, 100%, daily limit)
• Friend payment reminders
      `;
      this.bot.sendMessage(chatId, helpMessage);
    });

    console.log('✅ Bot commands setup complete');
  }

  setupScheduledReports() {
    if (!this.bot) return;

    // Daily report at 9 PM (21:00)
    cron.schedule('0 21 * * *', () => {
      console.log('📅 Sending daily reports...');
      // Will be triggered by main app
    });

    // Weekly report on Sunday at 9 PM
    cron.schedule('0 21 * * 0', () => {
      console.log('📊 Sending weekly reports...');
      // Will be triggered by main app
    });

    // Monthly report on 1st at 9 PM
    cron.schedule('0 21 1 * *', () => {
      console.log('📈 Sending monthly reports...');
      // Will be triggered by main app
    });

    console.log('✅ Scheduled reports setup complete');
    console.log('⏰ Daily: 9:00 PM');
    console.log('⏰ Weekly: Sunday 9:00 PM');
    console.log('⏰ Monthly: 1st at 9:00 PM');
  }

  // Send daily report
  async sendDailyReport(chatId, data) {
    if (!this.bot || !chatId) return false;

    const { todayExpenses, todayIncome, budgetUsed, topSpending, alerts } = data;

    let message = `
🌅 *Daily Report* - ${new Date().toLocaleDateString('en-IN')}

💸 Today's Expenses: ₹${todayExpenses.toFixed(0)}
💰 Today's Income: ₹${todayIncome.toFixed(0)}
📊 Budget Used: ${budgetUsed.toFixed(1)}%

`;

    if (topSpending && topSpending.length > 0) {
      message += `*Top Spending:*\n`;
      topSpending.forEach(item => {
        message += `${item.icon} ${item.category}: ₹${item.amount}\n`;
      });
    }

    if (alerts && alerts.length > 0) {
      message += `\n⚠️ *Alerts:*\n`;
      alerts.forEach(alert => {
        message += `${alert}\n`;
      });
    }

    message += `\n💡 Keep tracking your expenses!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (error) {
      console.error('Failed to send daily report:', error.message);
      return false;
    }
  }

  // Send weekly report
  async sendWeeklyReport(chatId, data) {
    if (!this.bot || !chatId) return false;

    const { weekExpenses, weekIncome, netAmount, categoryBreakdown, trend } = data;

    let message = `
📊 *Weekly Report* - Week ${new Date().toLocaleDateString('en-IN')}

💸 Total Expenses: ₹${weekExpenses.toFixed(0)}
💰 Total Income: ₹${weekIncome.toFixed(0)}
💵 Net: ${netAmount >= 0 ? '+' : ''}₹${netAmount.toFixed(0)}

*Category Breakdown:*
`;

    if (categoryBreakdown && categoryBreakdown.length > 0) {
      categoryBreakdown.forEach(cat => {
        message += `${cat.icon} ${cat.category}: ₹${cat.amount} (${cat.percentage}%)\n`;
      });
    }

    if (trend) {
      message += `\n📈 Trend: ${trend}`;
    }

    message += `\n\n🎯 Keep up the good work!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (error) {
      console.error('Failed to send weekly report:', error.message);
      return false;
    }
  }

  // Send monthly report
  async sendMonthlyReport(chatId, data) {
    if (!this.bot || !chatId) return false;

    const { 
      monthExpenses, 
      monthIncome, 
      netSavings, 
      budgetTarget,
      budgetUsed,
      budgetRemaining,
      topCategories,
      savingsGoal
    } = data;

    let message = `
📊 *Monthly Report* - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}

💸 Total Expenses: ₹${monthExpenses.toFixed(0)}
💰 Total Income: ₹${monthIncome.toFixed(0)}
💵 Net Savings: ${netSavings >= 0 ? '+' : ''}₹${netSavings.toFixed(0)}

*Budget Status:*
Target: ₹${budgetTarget}
Used: ₹${budgetUsed} (${((budgetUsed/budgetTarget)*100).toFixed(1)}%)
Remaining: ₹${budgetRemaining}

*Top Categories:*
`;

    if (topCategories && topCategories.length > 0) {
      topCategories.forEach(cat => {
        message += `${cat.icon} ${cat.category}: ₹${cat.amount}\n`;
      });
    }

    if (savingsGoal) {
      message += `\n🎯 ${savingsGoal}`;
    }

    message += `\n\n🎉 Great job tracking your finances!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (error) {
      console.error('Failed to send monthly report:', error.message);
      return false;
    }
  }

  // Send budget alert
  async sendBudgetAlert(chatId, alert) {
    if (!this.bot || !chatId) return false;

    const { type, title, message, details } = alert;

    let emoji = '⚠️';
    if (type === 'danger_100') emoji = '🚨';
    if (type === 'daily_limit') emoji = '📅';

    const alertMessage = `
${emoji} *${title}*

${message}

${details}

💡 Tip: Review your spending and adjust accordingly.
    `;

    try {
      await this.bot.sendMessage(chatId, alertMessage, { parse_mode: 'Markdown' });
      return true;
    } catch (error) {
      console.error('Failed to send budget alert:', error.message);
      return false;
    }
  }

  // Send friend payment reminder
  async sendFriendReminder(chatId, friends) {
    if (!this.bot || !chatId || !friends || friends.length === 0) return false;

    let message = `
👥 *Payment Reminders*

Friends who owe you:

`;

    let total = 0;
    friends.forEach(friend => {
      message += `• ${friend.name}: ₹${friend.amount}\n`;
      total += friend.amount;
    });

    message += `\n💰 Total: ₹${total}\n\n🔔 Don't forget to follow up!`;

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (error) {
      console.error('Failed to send friend reminder:', error.message);
      return false;
    }
  }

  // Send custom message
  async sendMessage(chatId, message) {
    if (!this.bot || !chatId) return false;

    try {
      await this.bot.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error.message);
      return false;
    }
  }

  // Check if bot is initialized
  isReady() {
    return this.isInitialized && this.bot !== null;
  }

  // Cleanup and stop bot
  async stop() {
    if (this.bot) {
      try {
        await this.bot.stopPolling();
        this.bot = null;
        this.isInitialized = false;
        console.log('✅ Telegram bot stopped successfully');
      } catch (error) {
        console.error('Error stopping bot:', error.message);
      }
    }
  }
}

// Singleton instance
const telegramBotService = new TelegramBotService();

module.exports = telegramBotService;
