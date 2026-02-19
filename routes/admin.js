const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Friend = require('../models/Friend');

// Get dashboard stats
router.get('/stats', admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExpenses = await Expense.countDocuments();
    const totalIncome = await Income.countDocuments();
    
    // Get today's active users (users who added expense/income today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeUsersExpense = await Expense.distinct('user', {
      date: { $gte: today }
    });
    const activeUsersIncome = await Income.distinct('user', {
      date: { $gte: today }
    });
    const activeUsers = [...new Set([...activeUsersExpense, ...activeUsersIncome])].length;

    // Get total amounts
    const expenseSum = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const incomeSum = await Income.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Category-wise breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Recent users (last 10)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalExpenses,
      totalIncome,
      activeUsers,
      totalExpenseAmount: expenseSum[0]?.total || 0,
      totalIncomeAmount: incomeSum[0]?.total || 0,
      categoryBreakdown,
      recentUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination and search
router.get('/users', admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details with stats
router.get('/users/:id', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's expenses
    const expenses = await Expense.find({ user: req.params.id })
      .sort({ date: -1 })
      .limit(20);
    
    const expenseCount = await Expense.countDocuments({ user: req.params.id });
    const expenseSum = await Expense.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get user's income
    const income = await Income.find({ user: req.params.id })
      .sort({ date: -1 })
      .limit(20);
    
    const incomeCount = await Income.countDocuments({ user: req.params.id });
    const incomeSum = await Income.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get user's budgets
    const budgets = await Budget.find({ user: req.params.id })
      .sort({ year: -1, month: -1 })
      .limit(6);

    // Get user's friends
    const friendsCount = await Friend.countDocuments({ user: req.params.id });

    res.json({
      user,
      stats: {
        expenseCount,
        totalExpenses: expenseSum[0]?.total || 0,
        incomeCount,
        totalIncome: incomeSum[0]?.total || 0,
        friendsCount,
        netSavings: (incomeSum[0]?.total || 0) - (expenseSum[0]?.total || 0)
      },
      recentExpenses: expenses,
      recentIncome: income,
      budgets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete all user data
    await Expense.deleteMany({ user: req.params.id });
    await Income.deleteMany({ user: req.params.id });
    await Budget.deleteMany({ user: req.params.id });
    await Friend.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password (admin)
router.put('/users/:id/reset-password', admin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user role (make admin/user)
router.put('/users/:id/toggle-role', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing your own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({ message: `User role changed to ${user.role}`, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system activity logs (recent activities)
router.get('/activity', admin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent expenses with user info
    const recentExpenses = await Expense.find()
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1);

    // Get recent income with user info
    const recentIncome = await Income.find()
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1);

    // Combine and sort by date
    const activities = [
      ...recentExpenses.map(e => ({
        type: 'expense',
        user: e.user,
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date
      })),
      ...recentIncome.map(i => ({
        type: 'income',
        user: i.user,
        amount: i.amount,
        source: i.source,
        description: i.description,
        date: i.date
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup first admin (one-time use, no auth required)
router.post('/setup-admin', async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    // Secret key check (add this to your .env: ADMIN_SETUP_KEY=your_secret_key)
    if (secretKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists. Use admin panel to create more admins.' });
    }

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user with email exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Make existing user admin
      user.role = 'admin';
      await user.save();
      return res.json({ message: 'Existing user promoted to admin', email: user.email });
    }

    // Create new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Default security question for admin
    const defaultQuestion = "What is your favorite food?";
    const hashedAnswer = await bcrypt.hash("pizza", salt);

    user = new User({
      name: 'Admin',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      securityQuestion: defaultQuestion,
      securityAnswer: hashedAnswer
    });

    await user.save();

    res.json({ 
      message: 'Admin user created successfully!',
      email: user.email,
      note: 'You can now login and access admin panel at /admin.html'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Migrate existing users (admin only)
router.post('/migrate-users', admin, async (req, res) => {
  try {
    // Find users without security question
    const usersWithoutSecurity = await User.find({
      $or: [
        { securityQuestion: { $exists: false } },
        { securityAnswer: { $exists: false } }
      ]
    });

    if (usersWithoutSecurity.length === 0) {
      return res.json({ 
        message: 'All users already have security questions!',
        migratedCount: 0
      });
    }

    // Default security question and answer
    const defaultQuestion = "What is your favorite food?";
    const defaultAnswer = "pizza";

    // Hash the default answer
    const salt = await bcrypt.genSalt(10);
    const hashedAnswer = await bcrypt.hash(defaultAnswer.toLowerCase().trim(), salt);

    let migratedCount = 0;

    for (const user of usersWithoutSecurity) {
      user.securityQuestion = defaultQuestion;
      user.securityAnswer = hashedAnswer;
      await user.save();
      migratedCount++;
    }

    res.json({ 
      message: `Successfully migrated ${migratedCount} users!`,
      migratedCount,
      defaultQuestion,
      defaultAnswer,
      note: 'Users can now reset password using the default security question'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
