// Auto-detect API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;
let token = localStorage.getItem('token');
let currentUser = null;
let allExpenses = []; // Store all expenses for filtering
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth forms...');
    initAuthForms();
});

// Initialize Auth Forms
function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (!loginForm || !registerForm) {
        console.error('Auth forms not found!');
        return;
    }
    
    console.log('Auth forms found, attaching listeners...');

// Auth Functions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('Login attempt:', { email });

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response status:', res.status);
        const data = await res.json();
        console.log('Login response data:', data);

        if (res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            showMainApp();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed: ' + err.message);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    console.log('Registration attempt:', { name, email });

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        console.log('Register response status:', res.status);
        const data = await res.json();
        console.log('Register response data:', data);

        if (res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            showMainApp();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error('Registration error:', err);
        alert('Registration failed: ' + err.message);
    }
});

} // End of initAuthForms

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
}

async function showMainApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Initialize date fields
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    const incomeDateInput = document.getElementById('income-date');
    if (incomeDateInput) {
        incomeDateInput.valueAsDate = new Date();
    }
    
    // Load budget and alert settings from database
    await loadBudgetFromDatabase();
    
    await loadCategories();
    await loadFriends(); // Load friends for split dropdown
    await loadIncome(); // Load income
    await loadExpenses();
    await loadStats();
    
    // Initialize budget display on load
    const monthExpensesText = document.getElementById('total-expenses')?.textContent || '₹0';
    const monthExpenses = parseFloat(monthExpensesText.replace('₹', '').replace(',', '')) || 0;
    updateBudgetDisplay(monthExpenses);
    
    // Check budget alerts
    setTimeout(() => {
        checkAndShowAlerts();
    }, 1000);
    
    // Setup budget modal after DOM is ready
    setTimeout(() => {
        setupBudgetModal();
    }, 500);
}

// Load friends for split dropdown
async function loadFriends() {
    try {
        const res = await fetch(`${API_URL}/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const friends = await res.json();
        
        const select = document.getElementById('split-friend');
        if (select) {
            select.innerHTML = '<option value="">Select friend...</option>';
            friends.forEach(friend => {
                const option = document.createElement('option');
                option.value = friend._id;
                option.textContent = friend.friendName;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load friends');
    }
}

// Toggle split options
function toggleSplitOptions() {
    const checkbox = document.getElementById('split-expense');
    const options = document.getElementById('split-options');
    
    if (checkbox.checked) {
        options.classList.add('active');
    } else {
        options.classList.remove('active');
    }
}

// Update split amounts based on type
function updateSplitAmounts() {
    const splitType = document.getElementById('split-type').value;
    const customSplit = document.getElementById('custom-split');
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    
    if (splitType === 'custom') {
        customSplit.style.display = 'grid';
    } else {
        customSplit.style.display = 'none';
        
        if (splitType === 'equal') {
            document.getElementById('your-share').value = (amount / 2).toFixed(2);
            document.getElementById('friend-share').value = (amount / 2).toFixed(2);
        } else if (splitType === 'full') {
            document.getElementById('your-share').value = amount;
            document.getElementById('friend-share').value = amount;
        }
    }
}

// Update split amounts when amount changes
document.getElementById('amount')?.addEventListener('input', updateSplitAmounts);
document.getElementById('split-type')?.addEventListener('change', updateSplitAmounts);

// Categories
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categories = await res.json();
        
        // Load in add form
        const select = document.getElementById('category');
        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });

        // Load in edit form
        const editSelect = document.getElementById('edit-category');
        editSelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            editSelect.appendChild(option);
        });

        // Load in filter
        const filterSelect = document.getElementById('filter-category');
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load categories');
    }
}

// Expenses
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('amount', document.getElementById('amount').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('date', document.getElementById('date').value);
    formData.append('paymentMethod', document.getElementById('payment-method').value);
    
    const receiptFile = document.getElementById('receipt').files[0];
    if (receiptFile) {
        formData.append('receipt', receiptFile);
    }

    try {
        const res = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            const expense = await res.json();
            
            // Check if split expense
            const splitCheckbox = document.getElementById('split-expense');
            if (splitCheckbox && splitCheckbox.checked) {
                const friendId = document.getElementById('split-friend').value;
                const splitType = document.getElementById('split-type').value;
                const amount = parseFloat(document.getElementById('amount').value);
                
                if (!friendId) {
                    alert('Please select a friend to split with');
                    return;
                }
                
                let yourShare, friendShare;
                
                if (splitType === 'equal') {
                    yourShare = amount / 2;
                    friendShare = amount / 2;
                } else if (splitType === 'custom') {
                    yourShare = parseFloat(document.getElementById('your-share').value);
                    friendShare = parseFloat(document.getElementById('friend-share').value);
                } else if (splitType === 'full') {
                    yourShare = amount;
                    friendShare = amount;
                }
                
                // Create split expense
                await fetch(`${API_URL}/splitExpenses`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expenseId: expense._id,
                        friendId,
                        totalAmount: amount,
                        yourShare,
                        friendShare,
                        splitType
                    })
                });
                
                alert('✅ Expense added and split with friend!');
            }
            
            document.getElementById('expense-form').reset();
            document.getElementById('date').valueAsDate = new Date();
            document.getElementById('split-options').classList.remove('active');
            await loadExpenses();
            await loadStats();
            
            // Check budget alerts after adding expense
            setTimeout(() => {
                checkAndShowAlerts();
            }, 500);
        } else {
            alert('Failed to add expense');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to add expense');
    }
});

async function loadExpenses() {
    try {
        const res = await fetch(`${API_URL}/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expenses = await res.json();
        allExpenses = expenses; // Store for filtering
        
        displayExpenses(expenses);
    } catch (err) {
        console.error('Failed to load expenses');
    }
}

function displayExpenses(expenses) {
    const list = document.getElementById('expenses-list');
    list.innerHTML = '';
    
    // Update count badge
    const countBadge = document.getElementById('expense-count');
    if (countBadge) {
        countBadge.textContent = `${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'}`;
    }
    
    if (expenses.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No expenses found</p>';
        return;
    }
    
    expenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-info">
                <h4>${expense.category}</h4>
                <p>${expense.description || 'No description'} - ${new Date(expense.date).toLocaleDateString()}</p>
                <span class="expense-badge">${expense.paymentMethod}</span>
            </div>
            <div class="expense-amount">₹${expense.amount}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick='editExpense(${JSON.stringify(expense)})'>Edit</button>
                <button class="btn-delete" onclick="deleteExpense('${expense._id}')">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
    
    updateResultsCount(expenses.length);
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (count === allExpenses.length) {
        resultsCount.textContent = `Showing all ${count} expenses`;
    } else {
        resultsCount.textContent = `Showing ${count} of ${allExpenses.length} expenses`;
    }
}

// Search & Filter Functions
let searchTimeout;
document.getElementById('search-input')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
});

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const payment = document.getElementById('filter-payment').value;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const amountMin = document.getElementById('filter-amount-min').value;
    const amountMax = document.getElementById('filter-amount-max').value;
    
    let filtered = allExpenses.filter(expense => {
        // Search filter
        if (searchTerm) {
            const matchDescription = expense.description?.toLowerCase().includes(searchTerm);
            const matchAmount = expense.amount.toString().includes(searchTerm);
            const matchCategory = expense.category.toLowerCase().includes(searchTerm);
            if (!matchDescription && !matchAmount && !matchCategory) return false;
        }
        
        // Category filter
        if (category && expense.category !== category) return false;
        
        // Payment method filter
        if (payment && expense.paymentMethod !== payment) return false;
        
        // Date range filter
        const expenseDate = new Date(expense.date);
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (expenseDate < fromDate) return false;
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            if (expenseDate > toDate) return false;
        }
        
        // Amount range filter
        if (amountMin && expense.amount < parseFloat(amountMin)) return false;
        if (amountMax && expense.amount > parseFloat(amountMax)) return false;
        
        return true;
    });
    
    displayExpenses(filtered);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-payment').value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    document.getElementById('filter-amount-min').value = '';
    document.getElementById('filter-amount-max').value = '';
    
    displayExpenses(allExpenses);
    
    // Collapse filter section
    const filterCollapse = document.getElementById('filterCollapse');
    if (filterCollapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(filterCollapse)?.hide();
    }
}

// Edit Expense
function editExpense(expense) {
    document.getElementById('edit-expense-id').value = expense._id;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-description').value = expense.description || '';
    document.getElementById('edit-date').value = expense.date.split('T')[0];
    document.getElementById('edit-payment-method').value = expense.paymentMethod;
    
    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

document.getElementById('edit-expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-expense-id').value;
    const data = {
        amount: document.getElementById('edit-amount').value,
        category: document.getElementById('edit-category').value,
        description: document.getElementById('edit-description').value,
        date: document.getElementById('edit-date').value,
        paymentMethod: document.getElementById('edit-payment-method').value
    };

    try {
        const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeEditModal();
            await loadExpenses();
            await loadStats();
        } else {
            alert('Failed to update expense');
        }
    } catch (err) {
        alert('Failed to update expense');
    }
});

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    
    try {
        const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            await loadExpenses();
            await loadStats();
        }
    } catch (err) {
        alert('Failed to delete expense');
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target == modal) {
        closeEditModal();
    }
}

async function loadStats() {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        // Get expenses
        const expenseRes = await fetch(`${API_URL}/expenses/stats/${month}/${year}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expenseStats = await expenseRes.json();
        const monthExpenses = expenseStats.total || 0;
        
        // Get all expenses for total
        const allExpensesRes = await fetch(`${API_URL}/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allExpenses = await allExpensesRes.json();
        const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Get income
        const incomeRes = await fetch(`${API_URL}/income`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allIncome = await incomeRes.json();
        const totalIncome = allIncome.reduce((sum, inc) => sum + inc.amount, 0);
        
        // Calculate net savings
        const netSavings = totalIncome - totalExpenses;
        
        // Update UI
        document.getElementById('total-income').textContent = `₹${totalIncome}`;
        document.getElementById('total-expenses').textContent = `₹${totalExpenses}`;
        
        const savingsEl = document.getElementById('net-savings');
        savingsEl.textContent = `₹${netSavings}`;
        if (netSavings >= 0) {
            savingsEl.style.color = 'var(--success)';
        } else {
            savingsEl.style.color = 'var(--danger)';
        }
        
        // Update budget
        updateBudgetDisplay(monthExpenses);
        
    } catch (err) {
        console.error('Failed to load stats');
    }
}

// Budget Functions - Simple Custom Modal
function openBudgetModal() {
    console.log('Opening budget modal');
    const modal = document.getElementById('budget-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        
        // Update current expense
        const currentExpense = document.getElementById('month-expenses')?.textContent || '₹0';
        const infoEl = document.getElementById('current-month-expense-info');
        if (infoEl) {
            infoEl.textContent = currentExpense;
        }
        
        // Set current budget if exists
        if (monthlyBudget > 0) {
            const input = document.getElementById('budget-amount');
            if (input) {
                input.value = monthlyBudget;
            }
        }
    }
}

function closeBudgetModal() {
    console.log('Closing budget modal');
    const modal = document.getElementById('budget-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Event Listeners for Budget Modal
// Removed - now handled in setupBudgetModal() function

function updateBudgetDisplay(spent) {
    console.log('=== UPDATE BUDGET DISPLAY ===');
    console.log('Monthly Budget:', monthlyBudget);
    console.log('Spent:', spent);
    
    const budgetLeftEl = document.getElementById('budget-left');
    const budgetInfoEl = document.getElementById('budget-info');
    const progressBar = document.getElementById('budget-progress-bar');
    
    if (!budgetLeftEl) {
        console.error('budget-left element not found');
        return;
    }
    if (!budgetInfoEl) {
        console.error('budget-info element not found');
        return;
    }
    if (!progressBar) {
        console.error('budget-progress-bar element not found');
        return;
    }
    
    if (monthlyBudget === 0 || !monthlyBudget) {
        console.log('No budget set');
        budgetLeftEl.textContent = '₹0';
        budgetInfoEl.textContent = 'Click gear to set budget';
        progressBar.style.width = '0%';
        progressBar.className = 'budget-progress-bar';
        return;
    }
    
    const remaining = monthlyBudget - spent;
    const percentage = (spent / monthlyBudget) * 100;
    
    console.log('Remaining:', remaining);
    console.log('Percentage:', percentage);
    
    budgetLeftEl.textContent = `₹${remaining.toFixed(0)}`;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;
    
    // Update color based on percentage
    if (percentage >= 100) {
        progressBar.className = 'budget-progress-bar danger';
        budgetInfoEl.textContent = '⚠️ Budget exceeded!';
        budgetInfoEl.style.color = 'var(--danger)';
    } else if (percentage >= 80) {
        progressBar.className = 'budget-progress-bar warning';
        budgetInfoEl.textContent = `${(100 - percentage).toFixed(0)}% remaining`;
        budgetInfoEl.style.color = 'var(--warning)';
    } else {
        progressBar.className = 'budget-progress-bar';
        budgetInfoEl.textContent = `${(100 - percentage).toFixed(0)}% remaining`;
        budgetInfoEl.style.color = 'var(--text-secondary)';
    }
    
    console.log('Budget display updated successfully');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, var(--success), #16a34a)' : 'linear-gradient(135deg, var(--danger), #dc2626)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
    `;
    notification.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
if (token) {
    fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(user => {
        currentUser = user;
        showMainApp();
    })
    .catch(() => {
        localStorage.removeItem('token');
        token = null;
    });
} else {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    const incomeDateInput = document.getElementById('income-date');
    if (incomeDateInput) {
        incomeDateInput.valueAsDate = new Date();
    }
}

// Budget Modal Functions
function openBudgetModal() {
    console.log('Opening budget modal');
    const modal = document.getElementById('budget-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        
        // Update current expense
        const currentExpense = document.getElementById('month-expenses')?.textContent || '₹0';
        const infoEl = document.getElementById('current-month-expense-info');
        if (infoEl) {
            infoEl.textContent = currentExpense;
        }
        
        // Set current budget if exists
        if (monthlyBudget > 0) {
            const input = document.getElementById('budget-amount');
            if (input) {
                input.value = monthlyBudget;
            }
        }
    } else {
        console.error('Modal overlay not found');
    }
}

function closeBudgetModal() {
    console.log('Closing budget modal');
    const modal = document.getElementById('budget-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup Budget Modal - Called after login
function setupBudgetModal() {
    console.log('=== SETTING UP BUDGET MODAL ===');
    
    // Open button
    const openBtn = document.getElementById('open-budget-btn');
    console.log('Open button:', openBtn ? 'Found' : 'Not found');
    
    if (openBtn) {
        // Remove old listeners
        const newBtn = openBtn.cloneNode(true);
        openBtn.parentNode.replaceChild(newBtn, openBtn);
        
        // Add new listener
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ GEAR BUTTON CLICKED!');
            openBudgetModal();
        });
        console.log('✅ Click listener attached');
    }
    
    // Close button
    const closeBtn = document.getElementById('close-budget-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBudgetModal);
    }
    
    // Close on overlay click
    const overlay = document.getElementById('budget-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeBudgetModal();
            }
        });
    }
    
    // Suggestion buttons
    const suggestionBtns = document.querySelectorAll('.btn-suggestion');
    console.log('Suggestion buttons found:', suggestionBtns.length);
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const amount = btn.getAttribute('data-amount');
            const input = document.getElementById('budget-amount');
            if (input && amount) {
                input.value = amount;
                input.focus();
            }
        });
    });
    
    // Form submit
    const form = document.getElementById('budget-form');
    console.log('Budget form:', form ? 'Found' : 'Not found');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('✅ Budget form submitted');
            
            const input = document.getElementById('budget-amount');
            if (!input) {
                console.error('Budget input not found');
                return;
            }
            
            const amount = parseFloat(input.value);
            console.log('Budget amount:', amount);
            
            if (!amount || amount <= 0 || isNaN(amount)) {
                alert('Please enter a valid budget amount');
                return;
            }
            
            // Save budget to database
            await saveBudgetToDatabase(amount);
            
            monthlyBudget = amount;
            console.log('✅ Budget saved:', amount);
            
            // Update display
            const monthExpensesText = document.getElementById('month-expenses')?.textContent || '₹0';
            const monthExpenses = parseFloat(monthExpensesText.replace('₹', '').replace(',', '')) || 0;
            updateBudgetDisplay(monthExpenses);
            
            // Close modal
            closeBudgetModal();
            
            // Show success
            alert('✅ Budget set successfully! ₹' + amount.toLocaleString());
            
            // Reset form
            input.value = '';
        });
        console.log('✅ Form listener attached');
    }
    
    console.log('=== BUDGET MODAL SETUP COMPLETE ===');
}


// Create animated particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        // Random colors
        const colors = [
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(6, 182, 212, 0.6)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// ============ INCOME TRACKING FUNCTIONS ============

// Load Income
async function loadIncome() {
    try {
        const res = await fetch(`${API_URL}/income`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const income = await res.json();
        
        displayIncome(income);
    } catch (err) {
        console.error('Failed to load income');
    }
}

// Display Income
function displayIncome(incomeList) {
    const list = document.getElementById('income-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Update count badge
    const countBadge = document.getElementById('income-count');
    if (countBadge) {
        countBadge.textContent = `${incomeList.length} ${incomeList.length === 1 ? 'entry' : 'entries'}`;
    }
    
    if (incomeList.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No income added yet</p>';
        return;
    }
    
    incomeList.forEach(income => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="expense-info">
                <h4 style="color: var(--success);">${income.source}</h4>
                <p>${income.description || 'No description'} - ${new Date(income.date).toLocaleDateString()}</p>
            </div>
            <div class="expense-amount" style="color: var(--success);">+₹${income.amount}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick='editIncome(${JSON.stringify(income)})'>Edit</button>
                <button class="btn-delete" onclick="deleteIncome('${income._id}')">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Add Income Form
document.getElementById('income-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        amount: document.getElementById('income-amount').value,
        source: document.getElementById('income-source').value,
        description: document.getElementById('income-description').value,
        date: document.getElementById('income-date').value
    };

    try {
        const res = await fetch(`${API_URL}/income`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            document.getElementById('income-form').reset();
            document.getElementById('income-date').valueAsDate = new Date();
            await loadIncome();
            await loadStats();
            showNotification('✅ Income added successfully!', 'success');
        } else {
            alert('Failed to add income');
        }
    } catch (err) {
        alert('Failed to add income');
    }
});

// Edit Income
function editIncome(income) {
    document.getElementById('edit-income-id').value = income._id;
    document.getElementById('edit-income-amount').value = income.amount;
    document.getElementById('edit-income-source').value = income.source;
    document.getElementById('edit-income-description').value = income.description || '';
    document.getElementById('edit-income-date').value = income.date.split('T')[0];
    
    document.getElementById('edit-income-modal').style.display = 'block';
}

function closeEditIncomeModal() {
    document.getElementById('edit-income-modal').style.display = 'none';
}

// Update Income
document.getElementById('edit-income-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-income-id').value;
    const data = {
        amount: document.getElementById('edit-income-amount').value,
        source: document.getElementById('edit-income-source').value,
        description: document.getElementById('edit-income-description').value,
        date: document.getElementById('edit-income-date').value
    };

    try {
        const res = await fetch(`${API_URL}/income/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeEditIncomeModal();
            await loadIncome();
            await loadStats();
            showNotification('✅ Income updated!', 'success');
        } else {
            alert('Failed to update income');
        }
    } catch (err) {
        alert('Failed to update income');
    }
});

// Delete Income
async function deleteIncome(id) {
    if (!confirm('Delete this income?')) return;
    
    try {
        const res = await fetch(`${API_URL}/income/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            await loadIncome();
            await loadStats();
            showNotification('Income deleted', 'success');
        }
    } catch (err) {
        alert('Failed to delete income');
    }
}

// Close income modal on outside click
window.addEventListener('click', function(event) {
    const incomeModal = document.getElementById('edit-income-modal');
    if (event.target == incomeModal) {
        closeEditIncomeModal();
    }
});



// ============ BUDGET ALERT SYSTEM ============

let budgetAlertSettings = {
    enabled: true,
    threshold80: true,
    threshold100: true,
    dailyLimit: 0,
    notificationSound: true
};

// Load alert settings from database (called after login)
async function loadAlertSettings() {
    // Budget load function will handle alert settings too
    await loadBudgetFromDatabase();
}

// Save alert settings
async function saveAlertSettings() {
    budgetAlertSettings = {
        enabled: true,
        threshold80: document.getElementById('alert-80-enabled').checked,
        threshold100: document.getElementById('alert-100-enabled').checked,
        dailyLimit: parseFloat(document.getElementById('daily-limit').value) || 0,
        notificationSound: document.getElementById('notification-sound').checked
    };
    
    // Save to database
    await saveAlertSettingsToDatabase();
}

// Check budget alerts
function checkBudgetAlerts(monthlyBudget, spent, todaySpent = 0) {
    if (!budgetAlertSettings.enabled) return;
    
    const percentage = (spent / monthlyBudget) * 100;
    const alerts = [];
    
    // 80% Warning
    if (budgetAlertSettings.threshold80 && percentage >= 80 && percentage < 100) {
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
    if (budgetAlertSettings.threshold100 && percentage >= 100) {
        const overspent = spent - monthlyBudget;
        alerts.push({
            type: 'danger_100',
            level: 'danger',
            title: '🚨 Budget Exceeded!',
            message: `You've exceeded your monthly budget by ₹${overspent.toFixed(0)}!`,
            details: `Spent: ₹${spent.toFixed(0)} / ₹${monthlyBudget}`,
            overspent: overspent,
            icon: 'bi-x-circle',
            color: '#ef4444'
        });
    }
    
    // Daily Limit Check
    if (budgetAlertSettings.dailyLimit > 0 && todaySpent > budgetAlertSettings.dailyLimit) {
        const dailyOverspent = todaySpent - budgetAlertSettings.dailyLimit;
        alerts.push({
            type: 'daily_limit',
            level: 'warning',
            title: '📅 Daily Limit Exceeded!',
            message: `Today's spending: ₹${todaySpent.toFixed(0)}`,
            details: `Limit: ₹${budgetAlertSettings.dailyLimit} (Overspent: ₹${dailyOverspent.toFixed(0)})`,
            icon: 'bi-calendar-x',
            color: '#f59e0b'
        });
    }
    
    // Show alerts
    alerts.forEach(alert => showBudgetAlert(alert));
    
    // Get recommendations
    if (percentage >= 50 && percentage < 80) {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = daysInMonth - currentDay;
        const budgetRemaining = monthlyBudget - spent;
        const dailyBudget = budgetRemaining / daysRemaining;
        
        showBudgetRecommendation({
            type: 'daily_budget',
            message: `You can spend ₹${dailyBudget.toFixed(0)} per day for the rest of the month`,
            icon: 'bi-lightbulb',
            color: '#06b6d4'
        });
    }
}

// Show budget alert notification
function showBudgetAlert(alert) {
    const container = document.getElementById('budget-alerts-container');
    if (!container) return;
    
    // Check if alert already shown (prevent duplicates)
    const alertKey = `alert_${alert.type}_shown`;
    const lastShown = localStorage.getItem(alertKey);
    const now = Date.now();
    
    // Show alert only once per hour
    if (lastShown && (now - parseInt(lastShown)) < 3600000) {
        return;
    }
    
    localStorage.setItem(alertKey, now.toString());
    
    const alertEl = document.createElement('div');
    alertEl.className = `budget-alert budget-alert-${alert.level}`;
    alertEl.innerHTML = `
        <div class="budget-alert-icon">
            <i class="bi ${alert.icon}"></i>
        </div>
        <div class="budget-alert-content">
            <h4>${alert.title}</h4>
            <p>${alert.message}</p>
            <small>${alert.details}</small>
        </div>
        <button class="budget-alert-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    container.appendChild(alertEl);
    
    // Play sound if enabled
    if (budgetAlertSettings.notificationSound) {
        playNotificationSound(alert.level);
    }
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        alertEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alertEl.remove(), 300);
    }, 10000);
}

// Show budget recommendation
function showBudgetRecommendation(recommendation) {
    const container = document.getElementById('budget-alerts-container');
    if (!container) return;
    
    const recEl = document.createElement('div');
    recEl.className = 'budget-alert budget-alert-info';
    recEl.innerHTML = `
        <div class="budget-alert-icon">
            <i class="bi ${recommendation.icon}"></i>
        </div>
        <div class="budget-alert-content">
            <h4>💡 Budget Tip</h4>
            <p>${recommendation.message}</p>
        </div>
        <button class="budget-alert-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    container.appendChild(recEl);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        recEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => recEl.remove(), 300);
    }, 8000);
}

// Play notification sound
function playNotificationSound(level) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different levels
    if (level === 'danger') {
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
    } else if (level === 'warning') {
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
    } else {
        oscillator.frequency.value = 400;
        oscillator.type = 'sine';
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Calculate today's spending
async function getTodaySpending() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            expenseDate.setHours(0, 0, 0, 0);
            return expenseDate.getTime() === today.getTime();
        });
        
        return todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    } catch (err) {
        return 0;
    }
}

// Update budget form to save alert settings
const originalBudgetFormHandler = document.getElementById('budget-form');
if (originalBudgetFormHandler) {
    originalBudgetFormHandler.addEventListener('submit', function(e) {
        // Save alert settings along with budget
        saveAlertSettings();
    });
}

// Check alerts when expenses are loaded
async function checkAndShowAlerts() {
    if (monthlyBudget > 0) {
        const monthExpensesText = document.getElementById('total-expenses')?.textContent || '₹0';
        const monthExpenses = parseFloat(monthExpensesText.replace('₹', '').replace(',', '')) || 0;
        const todaySpent = await getTodaySpending();
        
        checkBudgetAlerts(monthlyBudget, monthExpenses, todaySpent);
    }
}

// Load alert settings on page load
loadAlertSettings();


// ============ DATABASE BUDGET FUNCTIONS ============

// Save budget to database
async function saveBudgetToDatabase(amount) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    try {
        const res = await fetch(`${API_URL}/budgets/monthly`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                amount,
                month,
                year,
                alertSettings: budgetAlertSettings
            })
        });
        
        if (!res.ok) {
            throw new Error('Failed to save budget');
        }
        
        const data = await res.json();
        console.log('✅ Budget saved to database:', data);
        return data;
    } catch (err) {
        console.error('Error saving budget:', err);
        alert('Failed to save budget to server');
    }
}

// Load budget from database
async function loadBudgetFromDatabase() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    try {
        const res = await fetch(`${API_URL}/budgets/monthly/${month}/${year}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!res.ok) {
            console.log('No budget found in database');
            return null;
        }
        
        const budget = await res.json();
        
        if (budget) {
            monthlyBudget = budget.amount;
            
            // Load alert settings
            if (budget.alertSettings) {
                budgetAlertSettings = {
                    enabled: budget.alertSettings.enabled !== false,
                    threshold80: budget.alertSettings.threshold80 !== false,
                    threshold100: budget.alertSettings.threshold100 !== false,
                    dailyLimit: budget.alertSettings.dailyLimit || 0,
                    notificationSound: budgetAlertSettings.notificationSound // Keep local sound preference
                };
                
                // Update UI
                updateAlertSettingsUI();
            }
            
            console.log('✅ Budget loaded from database:', budget);
            return budget;
        }
        
        return null;
    } catch (err) {
        console.error('Error loading budget:', err);
        return null;
    }
}

// Save alert settings to database
async function saveAlertSettingsToDatabase() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    try {
        const res = await fetch(`${API_URL}/budgets/alert-settings/${month}/${year}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                alertSettings: budgetAlertSettings
            })
        });
        
        if (!res.ok) {
            throw new Error('Failed to save alert settings');
        }
        
        const data = await res.json();
        console.log('✅ Alert settings saved to database:', data);
        return data;
    } catch (err) {
        console.error('Error saving alert settings:', err);
        // Don't show alert to user, just log
    }
}

// Update alert settings UI
function updateAlertSettingsUI() {
    const alert80El = document.getElementById('alert-80-enabled');
    const alert100El = document.getElementById('alert-100-enabled');
    const dailyLimitEl = document.getElementById('daily-limit');
    const soundEl = document.getElementById('notification-sound');
    
    if (alert80El) alert80El.checked = budgetAlertSettings.threshold80;
    if (alert100El) alert100El.checked = budgetAlertSettings.threshold100;
    if (dailyLimitEl) dailyLimitEl.value = budgetAlertSettings.dailyLimit || '';
    if (soundEl) soundEl.checked = budgetAlertSettings.notificationSound;
}


// ============ PWA SERVICE WORKER ============

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            if (confirm('New version available! Reload to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default install prompt
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button/banner
    showInstallPromotion();
});

function showInstallPromotion() {
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-banner-content">
            <i class="bi bi-phone"></i>
            <div>
                <strong>Install App</strong>
                <p>Install on your home screen for quick access!</p>
            </div>
        </div>
        <div class="install-banner-actions">
            <button class="btn-install" onclick="installPWA()">Install</button>
            <button class="btn-dismiss" onclick="dismissInstallBanner()">×</button>
        </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // Show banner with animation
    setTimeout(() => {
        installBanner.classList.add('show');
    }, 1000);
}

async function installPWA() {
    if (!deferredPrompt) return;
    
    // Show install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    
    // Clear prompt
    deferredPrompt = null;
    
    // Hide banner
    dismissInstallBanner();
}

function dismissInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
    }
}

// Detect if app is installed
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully!');
    deferredPrompt = null;
});

// Check if running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

if (isPWA()) {
    console.log('✅ Running as PWA');
}
