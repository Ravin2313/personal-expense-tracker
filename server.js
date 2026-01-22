const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const telegramBot = require('./services/telegramBot');
const scheduledJobs = require('./services/scheduledJobs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    
    // Initialize Telegram Bot
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      const initialized = telegramBot.initialize(botToken);
      if (initialized) {
        // Start scheduled jobs
        scheduledJobs.startJobs();
      }
    } else {
      console.log('⚠️ TELEGRAM_BOT_TOKEN not found in .env file');
      console.log('💡 Add TELEGRAM_BOT_TOKEN=your_token to .env to enable Telegram features');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income', require('./routes/income'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/splits', require('./routes/splits'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/splitExpenses', require('./routes/splitExpenses'));
app.use('/api/telegram', require('./routes/telegram'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
