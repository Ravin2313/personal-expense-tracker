# 💰 Personal Expense Tracker

A comprehensive, feature-rich expense tracking application with income management, smart budget alerts, friend split expenses, payment reminders, and automated Telegram reports. Built with modern UI/UX and real-time notifications.

---

## 🌟 Key Features Overview

### 💸 **Expense Management**
- ✅ Add, edit, delete expenses with modern form UI
- ✅ Category-wise expense tracking
- ✅ Multiple payment methods (Cash, Card, UPI, Net Banking)
- ✅ Receipt upload with Cloudinary integration
- ✅ Advanced search and filtering:
  - By category
  - By payment method
  - By date range
  - By amount range
  - By description (real-time search)
- ✅ Collapsible filter panel
- ✅ Results count display
- ✅ Recent expenses list with entry count badges

### 💰 **Income Tracking**
- ✅ Track income from multiple sources
- ✅ Flexible source naming (e.g., "Ghar se", "Pocket Money", "Freelance")
- ✅ Optional descriptions for each income entry
- ✅ Date-wise income tracking
- ✅ Edit and delete income entries
- ✅ **Income vs Expense comparison** on dashboard
- ✅ **Net Savings calculation** (Income - Expenses)
- ✅ Color-coded display (Green for income, Red for expenses)
- ✅ Separate income list with count badges

### 📊 **Budget Management**
- ✅ Set monthly budget with quick suggestions (₹5k, ₹10k, ₹20k, ₹50k)
- ✅ Real-time budget tracking with visual progress bar
- ✅ Budget percentage display with color indicators
- ✅ Remaining amount calculation
- ✅ Budget exceeded warnings
- ✅ Daily spending limit (optional)
- ✅ Current month expenses display in budget modal
- ✅ Gear icon for quick budget settings access

### 🚨 **Smart Budget Alert System**
- ✅ **80% Warning Alert** (Orange) - Early warning when budget reaches 80%
- ✅ **100% Danger Alert** (Red with shake animation) - Critical alert when budget exceeded
- ✅ **Daily Limit Alert** - Notification when daily spending limit crossed
- ✅ **Smart Recommendations** - Daily budget suggestions based on remaining days
- ✅ Browser notifications with custom sound effects
- ✅ Auto-dismiss after 10 seconds
- ✅ Anti-spam protection (1 alert per hour for same type)
- ✅ Customizable alert settings:
  - Enable/disable 80% alert
  - Enable/disable 100% alert
  - Set custom daily spending limit
  - Toggle notification sound
- ✅ Real-time alerts after adding expenses
- ✅ Persistent settings in localStorage

### 👥 **Friend Split Expenses**
- ✅ Add friends with name, email, and phone number
- ✅ Split expenses with friends in three ways:
  - **Equal Split** (50-50)
  - **Custom Split** (manual amount distribution)
  - **Full Split** (you paid full, friend owes all)
- ✅ Real-time balance tracking (who owes you, who you owe)
- ✅ Settlement tracking with settlement history
- ✅ Friend details modal with:
  - Contact information
  - Transaction history
  - Statistics (total splits, settled, pending)
- ✅ Balance summary cards:
  - Total you'll get
  - Total you owe
  - Net balance
- ✅ Color-coded friend balances

### 🔔 **Payment Reminder System**
Send payment reminders to friends via multiple methods:
- ✅ **WhatsApp** - Direct WhatsApp message with pre-filled text
- ✅ **SMS** - Opens SMS app with reminder message
- ✅ **Email** - Opens email client with subject and body
- ✅ **Copy Link** - Copy reminder text to share anywhere
- ✅ Reminder history tracking (last 5 reminders)
- ✅ Reminder method tracking (WhatsApp, SMS, Email, Link)
- ✅ Last reminder sent timestamp
- ✅ Pre-filled friendly reminder messages
- ✅ Smart validations (phone required for WhatsApp/SMS, email for Email)
- ✅ Beautiful reminder modal with method cards
- ✅ Bell icon animation on remind button

### 🤖 **Telegram Bot Integration**
Automated reports and notifications via Telegram:

#### Scheduled Reports:
- ✅ **Daily Report** (9:00 PM every day)
  - Today's expenses and income
  - Budget usage percentage
  - Top spending categories
  - Budget alerts
  
- ✅ **Weekly Report** (Sunday 9:00 PM)
  - Week's total expenses and income
  - Net amount (income - expenses)
  - Category breakdown with percentages
  - Spending trend vs previous week
  
- ✅ **Monthly Report** (1st of month at 9:00 PM)
  - Month's financial summary
  - Budget status and analysis
  - Top 5 spending categories
  - Savings goal message
  
- ✅ **Friend Payment Reminders** (Sunday 8:00 PM)
  - List of friends who owe you
  - Total amount pending
  - Follow-up reminder

#### Real-time Alerts:
- ✅ Budget alerts (80%, 100%, daily limit)
- ✅ Instant notifications on Telegram
- ✅ Rich formatted messages with emojis

#### Bot Commands:
```
/start - Start bot and get your Chat ID
/help - Show all available commands
/today - Get today's expense summary
/week - Get this week's summary
/month - Get this month's summary
/budget - Check current budget status
/friends - View friend balances
```

#### Technical Features:
- ✅ Node-cron for scheduled jobs
- ✅ Telegram Bot API integration
- ✅ User-specific chat ID configuration
- ✅ Customizable notification preferences
- ✅ Report generation utilities
- ✅ Category icons in reports
- ✅ Markdown formatting support

### 📈 **Dashboard & Analytics**
- ✅ **Stats Cards:**
  - Total Income (Green)
  - Total Expenses (Red)
  - Net Savings (Dynamic color based on positive/negative)
  - Budget Left with progress bar
- ✅ Color-coded stat cards with hover effects
- ✅ Animated stat values
- ✅ Real-time updates after transactions
- ✅ Budget progress visualization
- ✅ Budget info messages (percentage remaining, exceeded, etc.)

### 🎨 **Modern UI/UX**
- ✅ **Galaxy-themed design** with animated particles
- ✅ **Glass morphism effects** on cards and modals
- ✅ **Smooth animations:**
  - Slide-in animations for cards
  - Shake animation for danger alerts
  - Pulse animation for critical elements
  - Hover effects on all interactive elements
- ✅ **Color-coded system:**
  - Green for income and success
  - Red for expenses and danger
  - Orange for warnings
  - Blue for info
- ✅ **Modern form inputs:**
  - Icon-based labels
  - Focus animations with glow effect
  - Gradient borders on focus
  - Placeholder animations
  - Custom file input styling
- ✅ **Gradient buttons** with:
  - Hover lift effect
  - Icon rotation on hover
  - Shine effect animation
  - Color-coded (green for income, red for expense)
- ✅ **Modern modals:**
  - Backdrop blur effect
  - Gradient headers
  - Smooth open/close animations
  - Close button with rotation effect
- ✅ **Responsive design:**
  - Mobile-optimized layout
  - Touch-friendly buttons
  - Adaptive navigation
  - Collapsible menus
  - Full-screen modals on mobile
- ✅ **Card badges** showing entry counts
- ✅ **Notification system** with slide-in/out animations

### 🔐 **Authentication & Security**
- ✅ User registration with validation
- ✅ Secure login system
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Session management
- ✅ User-specific data isolation
- ✅ **Simple Forgot Password**
  - Direct password reset with email
  - No email verification needed
  - Quick and easy recovery

### 🔍 **Advanced Search & Filter**
- ✅ Real-time search by description or amount
- ✅ Debounced search (300ms delay)
- ✅ Filter by:
  - Category (dropdown)
  - Payment method (dropdown)
  - Date range (from/to dates)
  - Amount range (min/max)
- ✅ Collapsible filter panel
- ✅ Clear all filters button
- ✅ Results count display
- ✅ Filter state persistence

### 📱 **Responsive Features**
- ✅ Mobile-first design approach
- ✅ Touch-optimized buttons and inputs
- ✅ Swipe-friendly interface
- ✅ Adaptive grid layouts
- ✅ Collapsible navigation on mobile
- ✅ Full-screen modals on small screens
- ✅ Optimized font sizes for readability
- ✅ Touch-friendly spacing

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **Node-cron** - Scheduled jobs
- **Node-Telegram-Bot-API** - Telegram integration

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **Bootstrap 5** - UI components
- **Bootstrap Icons** - Icon library
- **CSS3** - Modern styling with:
  - Flexbox & Grid
  - Animations & Transitions
  - Glass morphism effects
  - Gradient backgrounds
- **Responsive Design** - Mobile-first approach

### APIs & Services
- **Telegram Bot API** - Automated notifications
- **Cloudinary API** - Receipt image uploads
- **MongoDB Atlas** - Cloud database (for deployment)

---

## 📁 Project Structure

```
expense-tracker/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── auth.js                # JWT authentication middleware
├── models/
│   ├── User.js                # User model with Telegram settings
│   ├── Expense.js             # Expense model
│   ├── Income.js              # Income model
│   ├── Budget.js              # Budget model with alert settings
│   ├── Friend.js              # Friend model with reminders
│   ├── Split.js               # Split expense model
│   └── SplitExpense.js        # Split expense details
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── expenses.js            # Expense CRUD routes
│   ├── income.js              # Income CRUD routes
│   ├── budgets.js             # Budget management routes
│   ├── friends.js             # Friend management routes
│   ├── splits.js              # Split expense routes
│   ├── splitExpenses.js       # Split expense details routes
│   ├── categories.js          # Category routes
│   └── telegram.js            # Telegram settings routes
├── services/
│   ├── telegramBot.js         # Telegram bot service
│   └── scheduledJobs.js       # Cron job scheduler
├── utils/
│   ├── budgetAlerts.js        # Budget alert logic
│   └── reportGenerator.js    # Report generation utilities
├── public/
│   ├── css/
│   │   └── style.css          # Main stylesheet (2000+ lines)
│   ├── js/
│   │   ├── app.js             # Main app logic
│   │   ├── analytics.js       # Analytics page
│   │   └── friends.js         # Friends page
│   ├── index.html             # Dashboard
│   ├── analytics.html         # Analytics page
│   └── friends.html           # Friends & splits page
├── docs/                      # Documentation folder
│   ├── BUDGET_ALERTS_GUIDE.md
│   ├── PAYMENT_REMINDER_FEATURE.md
│   ├── TELEGRAM_BOT_SETUP.md
│   └── ... (other guides)
├── .env                       # Environment variables (not in repo)
├── .env.example              # Environment template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies
├── server.js                 # Main server file
├── README.md                 # This file
└── FEATURES.md               # Complete features list
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)
- **Telegram account** (for bot features)
- **Cloudinary account** (optional, for receipt uploads)

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd expense-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration

Create `.env` file in root directory:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# For production, use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# Authentication
JWT_SECRET=your_secure_jwt_secret_key_here

# Telegram Bot (Optional but recommended)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Cloudinary (Optional - for receipt uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Start MongoDB
```bash
# If using local MongoDB
mongod
```

### Step 5: Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Step 6: Open Application
```
http://localhost:5000
```

---

## 🤖 Telegram Bot Setup (Detailed)

### Why Telegram Bot?
- Get automated daily, weekly, and monthly reports
- Receive real-time budget alerts
- Get friend payment reminders
- Access reports via bot commands
- No need to open app for quick summaries

### Setup Steps:

#### 1. Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Enter bot name: `My Expense Tracker Bot`
4. Enter username: `your_expense_tracker_bot` (must be unique)
5. **Copy the bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 2. Get Your Chat ID
**Method 1 (Easy):**
1. Send any message to your bot
2. Open browser and visit:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Look for `"chat":{"id":123456789}`
4. Copy the number (your Chat ID)

**Method 2 (Using Bot):**
1. Search for `@userinfobot` on Telegram
2. Send `/start`
3. Bot will reply with your Chat ID

#### 3. Configure Environment
Add to your `.env` file:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

#### 4. Restart Server
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

You should see:
```
✅ Telegram bot initialized successfully!
✅ Bot commands setup complete
✅ Scheduled reports setup complete
⏰ Daily: 9:00 PM
⏰ Weekly: Sunday 9:00 PM
⏰ Monthly: 1st at 9:00 PM
🎉 All scheduled jobs started successfully!
```

#### 5. Test Bot
Send `/start` to your bot on Telegram. You should receive a welcome message!

### Bot Features:

#### Automated Reports:
- **Daily Report** - Every day at 9:00 PM
- **Weekly Report** - Every Sunday at 9:00 PM
- **Monthly Report** - 1st of every month at 9:00 PM
- **Friend Reminders** - Every Sunday at 8:00 PM

#### Bot Commands:
```
/start - Start bot and get your Chat ID
/help - Show all available commands
/today - Get today's expense summary
/week - Get this week's summary
/month - Get this month's summary
/budget - Check current budget status
/friends - View friend balances
```

#### Report Format Example:
```
🌅 Daily Report - Jan 21, 2026

💸 Today's Expenses: ₹850
💰 Today's Income: ₹0
📊 Budget Used: 85%

Top Spending:
🍕 Food: ₹400
🎮 Entertainment: ₹300
🚗 Transport: ₹150

⚠️ Alert: Budget 85% used!

💡 Keep tracking your expenses!
```

---

## 🚀 Deployment Guide

### Recommended Platforms:

#### 1. Railway.app (Best Free Option) ⭐
**Pros:**
- $5 free credit per month
- No sleep mode
- Perfect for cron jobs
- Easy deployment

**Steps:**
1. Sign up at https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy!

#### 2. Render (Good Alternative)
**Pros:**
- Free tier available
- Automatic deployments
- Easy setup

**Cons:**
- Free tier sleeps after 15 min inactivity
- Need keep-alive service for cron jobs

**Steps:**
1. Sign up at https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Pre-Deployment Checklist:

#### 1. Setup MongoDB Atlas (Required for deployment)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0)
5. Get connection string
6. Add to MONGODB_URI in environment variables
```

#### 2. Environment Variables
Add all these to your deployment platform:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
JWT_SECRET=your_secure_secret_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
```

#### 3. Build Command
```bash
npm install
```

#### 4. Start Command
```bash
npm start
```

### Post-Deployment:

1. **Test the application**
   - Open deployed URL
   - Register/Login
   - Add test expense
   - Check if data saves

2. **Test Telegram bot**
   - Send `/start` to bot
   - Check if bot responds
   - Wait for scheduled report (9 PM)

3. **Monitor logs**
   - Check for errors
   - Verify cron jobs running
   - Check database connections

### Keep-Alive for Free Tier (If using Render):

Add to `server.js`:
```javascript
const https = require('https');

// Ping self every 14 minutes to prevent sleep
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    https.get(process.env.APP_URL, (res) => {
      console.log('Keep-alive ping');
    });
  }, 14 * 60 * 1000);
}
```

Or use **UptimeRobot** (https://uptimerobot.com):
- Free service
- Ping your app every 5 minutes
- Prevents sleep mode

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📧 Support

For issues or questions, please create an issue in the repository.

## 🎉 Acknowledgments

- Bootstrap for UI components
- Bootstrap Icons
- Telegram Bot API
- MongoDB Atlas
- Node.js community

---

**Made with ❤️ for better financial management**
