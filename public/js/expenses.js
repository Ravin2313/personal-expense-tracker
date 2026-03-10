// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;

let token = localStorage.getItem('token');
let currentUser = null;
let allExpenses = [];
let filteredExpenses = [];

// Category icons mapping
const categoryIcons = {
    'Food': 'bi-cup-hot',
    'Transport': 'bi-car-front',
    'Shopping': 'bi-bag-shopping',
    'Entertainment': 'bi-controller',
    'Bills': 'bi-receipt',
    'Health': 'bi-heart-pulse',
    'Education': 'bi-book',
    'Travel': 'bi-airplane',
    'Groceries': 'bi-basket',
    'Rent': 'bi-house',
    'Other': 'bi-three-dots'
};

// Category colors
const categoryColors = {
    'Food': 'linear-gradient(135deg, #f59e0b, #d97706)',
    'Transport': 'linear-gradient(135deg, #06b6d4, #0891b2)',
    'Shopping': 'linear-gradient(135deg, #ec4899, #db2777)',
    'Entertainment': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'Bills': 'linear-gradient(135deg, #ef4444, #dc2626)',
    'Health': 'linear-gradient(135deg, #10b981, #059669)',
    'Education': 'linear-gradient(135deg, #3b82f6, #2563eb)',
    'Travel': 'linear-gradient(135deg, #f97316, #ea580c)',
    'Groceries': 'linear-gradient(135deg, #84cc16, #65a30d)',
    'Rent': 'linear-gradient(135deg, #6366f1, #4f46e5)',
    'Other': 'linear-gradient(135deg, #6b7280, #4b5563)'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    await checkAuth();
    createParticles();
    setupFilterTabs();
    await loadExpenses();
});

// Check authentication
async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            throw new Error('Unauthorized');
        }
        
        currentUser = await res.json();
        document.getElementById('user-name').textContent = currentUser.name;
    } catch (err) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

// Load all expenses
async function loadExpenses() {
    try {
        const res = await fetch(`${API_URL}/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to load expenses');
        
        allExpenses = await res.json();
        filteredExpenses = [...allExpenses];
        
        displayExpenses(filteredExpenses);
        updateStats(filteredExpenses);
    } catch (err) {
        console.error('Failed to load expenses:', err);
        showError('Failed to load expenses');
    }
}

// Display expenses with cool cards
function displayExpenses(expenses) {
    const container = document.getElementById('expenses-container');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="no-expenses">
                <i class="bi bi-receipt"></i>
                <h4>No expenses found</h4>
                <p>Try adjusting your filters or add some expenses!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = expenses.map(expense => {
        const categoryIcon = categoryIcons[expense.category] || categoryIcons['Other'];
        const categoryColor = categoryColors[expense.category] || categoryColors['Other'];
        const date = new Date(expense.date);
        const formattedDate = date.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="expense-card">
                <div class="expense-header">
                    <div class="expense-category">
                        <div class="category-icon" style="background: ${categoryColor}">
                            <i class="bi ${categoryIcon}"></i>
                        </div>
                        <div>
                            <h5 style="margin: 0; color: white; font-weight: 600;">${expense.category}</h5>
                            <p style="margin: 0; color: #a1a1aa; font-size: 14px;">${timeAgo}</p>
                        </div>
                    </div>
                    <div class="expense-amount-large">₹${expense.amount}</div>
                </div>
                
                <div class="expense-details">
                    <div class="detail-item">
                        <i class="bi bi-chat-left-text"></i>
                        <span>${expense.description || 'No description'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-calendar-event"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-credit-card"></i>
                        <span>${expense.paymentMethod}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-clock"></i>
                        <span>${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                
                <div class="expense-actions-new">
                    <button class="btn-action btn-edit-new" onclick='editExpense(${JSON.stringify(expense)})'>
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn-action btn-delete-new" onclick="deleteExpense('${expense._id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStats(expenses) {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalCount = expenses.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    document.getElementById('total-amount').textContent = `₹${totalAmount.toFixed(0)}`;
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('avg-amount').textContent = `₹${avgAmount.toFixed(0)}`;
}

// Setup filter tabs
function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    const customPicker = document.getElementById('custom-date-picker');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filter = tab.dataset.filter;
            
            if (filter === 'custom') {
                customPicker.classList.add('active');
            } else {
                customPicker.classList.remove('active');
                applyFilter(filter);
            }
        });
    });
}

// Apply filters
function applyFilter(filter) {
    const now = new Date();
    let filtered = [...allExpenses];
    
    switch (filter) {
        case 'today':
            filtered = allExpenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.toDateString() === now.toDateString();
            });
            break;
            
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            
            filtered = allExpenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= weekStart;
            });
            break;
            
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            
            filtered = allExpenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate >= monthStart;
            });
            break;
            
        case 'all':
        default:
            filtered = [...allExpenses];
            break;
    }
    
    filteredExpenses = filtered;
    displayExpenses(filtered);
    updateStats(filtered);
}

// Apply custom date filter
function applyCustomFilter() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both from and to dates');
        return;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire end date
    
    const filtered = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= from && expDate <= to;
    });
    
    filteredExpenses = filtered;
    displayExpenses(filtered);
    updateStats(filtered);
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Edit expense (redirect to main page with edit modal)
function editExpense(expense) {
    localStorage.setItem('editExpense', JSON.stringify(expense));
    window.location.href = 'index.html?edit=true';
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            await loadExpenses(); // Reload expenses
            showSuccess('Expense deleted successfully!');
        } else {
            throw new Error('Failed to delete expense');
        }
    } catch (err) {
        console.error('Error deleting expense:', err);
        showError('Failed to delete expense');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

// Show success message
function showSuccess(message) {
    // You can implement a toast notification here
    alert(message);
}

// Show error message
function showError(message) {
    // You can implement a toast notification here
    alert(message);
}

// Create particles effect
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        const colors = [
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(6, 182, 212, 0.6)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
    }
}