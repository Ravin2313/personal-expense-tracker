// Budget Alert Utility Functions

function checkBudgetAlerts(monthlyBudget, spent, dailySpent = 0, dailyLimit = 0) {
  const alerts = [];
  const percentage = (spent / monthlyBudget) * 100;
  
  // 80% Warning
  if (percentage >= 80 && percentage < 100) {
    alerts.push({
      type: 'warning_80',
      level: 'warning',
      title: '⚠️ Budget Alert!',
      message: `You've used ${percentage.toFixed(0)}% of your monthly budget!`,
      details: `Spent: ₹${spent.toFixed(0)} / ₹${monthlyBudget}`,
      remaining: monthlyBudget - spent,
      icon: 'bi-exclamation-triangle',
      color: '#f59e0b'
    });
  }
  
  // 100% Danger
  if (percentage >= 100) {
    const overspent = spent - monthlyBudget;
    alerts.push({
      type: 'danger_100',
      level: 'danger',
      title: '🚨 Budget Exceeded!',
      message: `You've exceeded your monthly budget by ₹${overspent.toFixed(0)}!`,
      details: `Spent: ₹${spent.toFixed(0)} / ₹${monthlyBudget}`,
      remaining: 0,
      overspent: overspent,
      icon: 'bi-x-circle',
      color: '#ef4444'
    });
  }
  
  // Daily Limit Check
  if (dailyLimit > 0 && dailySpent > dailyLimit) {
    const dailyOverspent = dailySpent - dailyLimit;
    alerts.push({
      type: 'daily_limit',
      level: 'warning',
      title: '📅 Daily Limit Exceeded!',
      message: `Today's spending: ₹${dailySpent.toFixed(0)} (Limit: ₹${dailyLimit})`,
      details: `Overspent by ₹${dailyOverspent.toFixed(0)} today`,
      icon: 'bi-calendar-x',
      color: '#f59e0b'
    });
  }
  
  // 50% Info (optional)
  if (percentage >= 50 && percentage < 80) {
    alerts.push({
      type: 'info_50',
      level: 'info',
      title: '💡 Budget Update',
      message: `You've used ${percentage.toFixed(0)}% of your budget`,
      details: `Remaining: ₹${(monthlyBudget - spent).toFixed(0)}`,
      remaining: monthlyBudget - spent,
      icon: 'bi-info-circle',
      color: '#06b6d4'
    });
  }
  
  return alerts;
}

function getCategoryAlert(categoryBudget, categorySpent, categoryName) {
  const percentage = (categorySpent / categoryBudget) * 100;
  
  if (percentage >= 100) {
    return {
      type: 'category_exceeded',
      level: 'danger',
      title: `🚨 ${categoryName} Budget Exceeded!`,
      message: `You've spent ₹${categorySpent.toFixed(0)} on ${categoryName}`,
      details: `Budget: ₹${categoryBudget} (${percentage.toFixed(0)}% used)`,
      category: categoryName,
      icon: 'bi-exclamation-octagon',
      color: '#ef4444'
    };
  } else if (percentage >= 80) {
    return {
      type: 'category_warning',
      level: 'warning',
      title: `⚠️ ${categoryName} Budget Alert`,
      message: `${percentage.toFixed(0)}% of ${categoryName} budget used`,
      details: `Spent: ₹${categorySpent.toFixed(0)} / ₹${categoryBudget}`,
      category: categoryName,
      icon: 'bi-exclamation-triangle',
      color: '#f59e0b'
    };
  }
  
  return null;
}

function getBudgetRecommendations(spent, monthlyBudget, daysInMonth, currentDay) {
  const daysRemaining = daysInMonth - currentDay;
  const budgetRemaining = monthlyBudget - spent;
  const dailyBudget = budgetRemaining / daysRemaining;
  
  const recommendations = [];
  
  if (budgetRemaining > 0) {
    recommendations.push({
      type: 'daily_budget',
      message: `You can spend ₹${dailyBudget.toFixed(0)} per day for the rest of the month`,
      icon: 'bi-calendar-check',
      color: '#10b981'
    });
  }
  
  const percentage = (spent / monthlyBudget) * 100;
  const expectedPercentage = (currentDay / daysInMonth) * 100;
  
  if (percentage > expectedPercentage + 10) {
    recommendations.push({
      type: 'slow_down',
      message: 'You\'re spending faster than expected. Try to slow down!',
      icon: 'bi-speedometer',
      color: '#f59e0b'
    });
  } else if (percentage < expectedPercentage - 10) {
    recommendations.push({
      type: 'good_pace',
      message: 'Great job! You\'re spending at a good pace 👍',
      icon: 'bi-emoji-smile',
      color: '#10b981'
    });
  }
  
  return recommendations;
}

module.exports = {
  checkBudgetAlerts,
  getCategoryAlert,
  getBudgetRecommendations
};
