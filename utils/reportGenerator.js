// Report Generation Utilities

const categoryIcons = {
  'Food': '🍕',
  'Transport': '🚗',
  'Entertainment': '🎮',
  'Shopping': '🛍️',
  'Bills': '📱',
  'Health': '🏥',
  'Education': '📚',
  'Other': '📦'
};

function getCategoryIcon(category) {
  return categoryIcons[category] || '📦';
}

function generateDailyReport(expenses, income, budget) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter today's transactions
  const todayExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    expDate.setHours(0, 0, 0, 0);
    return expDate.getTime() === today.getTime();
  });
  
  const todayIncome = income.filter(inc => {
    const incDate = new Date(inc.date);
    incDate.setHours(0, 0, 0, 0);
    return incDate.getTime() === today.getTime();
  });
  
  const todayExpensesTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const todayIncomeTotal = todayIncome.reduce((sum, inc) => sum + inc.amount, 0);
  
  // Calculate budget used (monthly)
  const monthExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetUsed = budget > 0 ? (monthExpenses / budget) * 100 : 0;
  
  // Top spending categories today
  const categoryTotals = {};
  todayExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const topSpending = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      icon: getCategoryIcon(category)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  // Generate alerts
  const alerts = [];
  if (budgetUsed >= 80 && budgetUsed < 100) {
    alerts.push(`Budget ${budgetUsed.toFixed(0)}% used!`);
  } else if (budgetUsed >= 100) {
    alerts.push(`Budget exceeded by ₹${(monthExpenses - budget).toFixed(0)}!`);
  }
  
  return {
    todayExpenses: todayExpensesTotal,
    todayIncome: todayIncomeTotal,
    budgetUsed,
    topSpending,
    alerts
  };
}

function generateWeeklyReport(expenses, income) {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter this week's transactions
  const weekExpenses = expenses.filter(exp => new Date(exp.date) >= weekAgo);
  const weekIncome = income.filter(inc => new Date(inc.date) >= weekAgo);
  
  const weekExpensesTotal = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const weekIncomeTotal = weekIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const netAmount = weekIncomeTotal - weekExpensesTotal;
  
  // Category breakdown
  const categoryTotals = {};
  weekExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / weekExpensesTotal) * 100).toFixed(0),
      icon: getCategoryIcon(category)
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // Calculate trend (compare with previous week)
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const prevWeekExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= twoWeeksAgo && expDate < weekAgo;
  });
  const prevWeekTotal = prevWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  let trend = '';
  if (prevWeekTotal > 0) {
    const change = ((weekExpensesTotal - prevWeekTotal) / prevWeekTotal) * 100;
    if (change > 10) {
      trend = `⬆️ ${change.toFixed(0)}% more than last week`;
    } else if (change < -10) {
      trend = `⬇️ ${Math.abs(change).toFixed(0)}% less than last week`;
    } else {
      trend = `➡️ Similar to last week`;
    }
  }
  
  return {
    weekExpenses: weekExpensesTotal,
    weekIncome: weekIncomeTotal,
    netAmount,
    categoryBreakdown,
    trend
  };
}

function generateMonthlyReport(expenses, income, budget) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Filter this month's transactions
  const monthExpenses = expenses.filter(exp => new Date(exp.date) >= monthStart);
  const monthIncome = income.filter(inc => new Date(inc.date) >= monthStart);
  
  const monthExpensesTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthIncomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const netSavings = monthIncomeTotal - monthExpensesTotal;
  
  const budgetRemaining = budget - monthExpensesTotal;
  
  // Top categories
  const categoryTotals = {};
  monthExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      icon: getCategoryIcon(category)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Savings goal message
  let savingsGoal = '';
  if (netSavings > 0) {
    const savingsPercentage = ((netSavings / monthIncomeTotal) * 100).toFixed(0);
    savingsGoal = `Great! You saved ${savingsPercentage}% of your income!`;
  } else {
    savingsGoal = `Goal: Save at least 20% next month!`;
  }
  
  return {
    monthExpenses: monthExpensesTotal,
    monthIncome: monthIncomeTotal,
    netSavings,
    budgetTarget: budget,
    budgetUsed: monthExpensesTotal,
    budgetRemaining,
    topCategories,
    savingsGoal
  };
}

function getFriendsOwingMoney(friends) {
  return friends
    .filter(friend => friend.balance > 0)
    .map(friend => ({
      name: friend.friendName,
      amount: friend.balance
    }))
    .sort((a, b) => b.amount - a.amount);
}

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  getFriendsOwingMoney,
  getCategoryIcon
};
