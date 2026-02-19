// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;

let token = localStorage.getItem('token');
let currentUser = null;
let currentPage = 1;

console.log('🔐 Admin Panel Loaded');

// Authentication Check
if (!token) {
    console.log('❌ No authentication token');
    window.location.href = 'index.html';
} else {
    checkAdminAccess();
}

// Check if user is admin
async function checkAdminAccess() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            throw new Error('Unauthorized');
        }

        currentUser = await res.json();
        
        if (currentUser.role !== 'admin') {
            alert('Access Denied! Admin only.');
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ Admin access granted');
        initAdmin();
    } catch (err) {
        console.error('❌ Error:', err);
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

// Initialize Admin Panel
async function initAdmin() {
    createParticles();
    loadDashboard();
    
    // Search users on input
    document.getElementById('user-search').addEventListener('input', (e) => {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            loadUsers(1, e.target.value);
        }, 500);
    });
}

// Load Dashboard Stats
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error('Failed to load stats');

        const data = await res.json();
        
        // Update stat cards
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-expenses-count').textContent = data.totalExpenses;
        document.getElementById('total-income-count').textContent = data.totalIncome;
        document.getElementById('active-users').textContent = data.activeUsers;
        
        document.getElementById('total-expense-amount').textContent = `₹${data.totalExpenseAmount.toFixed(0)}`;
        document.getElementById('total-income-amount').textContent = `₹${data.totalIncomeAmount.toFixed(0)}`;
        
        const netAmount = data.totalIncomeAmount - data.totalExpenseAmount;
        const netEl = document.getElementById('net-amount');
        netEl.textContent = `₹${netAmount.toFixed(0)}`;
        netEl.style.color = netAmount >= 0 ? '#10b981' : '#ef4444';
        
        // Category breakdown
        const categoryDiv = document.getElementById('category-breakdown');
        if (data.categoryBreakdown.length > 0) {
            categoryDiv.innerHTML = data.categoryBreakdown.map(cat => `
                <div class="category-item">
                    <span style="color: #a1a1aa;">${cat._id}</span>
                    <strong style="color: #ef4444;">₹${cat.total.toFixed(0)} <small style="color: #71717a;">(${cat.count})</small></strong>
                </div>
            `).join('');
        } else {
            categoryDiv.innerHTML = '<p style="color: #71717a; text-align: center;">No data available</p>';
        }
        
        // Recent users
        const usersDiv = document.getElementById('recent-users');
        if (data.recentUsers.length > 0) {
            usersDiv.innerHTML = data.recentUsers.map(user => `
                <div class="user-row">
                    <div>
                        <strong style="color: white;">${user.name}</strong>
                        <br>
                        <small style="color: #71717a;">${user.email}</small>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge-admin ${user.role}">${user.role}</span>
                        <br>
                        <small style="color: #71717a;">${new Date(user.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('');
        } else {
            usersDiv.innerHTML = '<p style="color: #71717a; text-align: center;">No users found</p>';
        }
        
    } catch (err) {
        console.error('Error loading dashboard:', err);
        showNotification('Failed to load dashboard', 'error');
    }
}

// Load Users
async function loadUsers(page = 1, search = '') {
    try {
        currentPage = page;
        const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=10&search=${search}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error('Failed to load users');

        const data = await res.json();
        
        const usersDiv = document.getElementById('users-list');
        if (data.users.length > 0) {
            usersDiv.innerHTML = data.users.map(user => `
                <div class="user-row">
                    <div>
                        <strong style="color: white; font-size: 16px;">${user.name}</strong>
                        <br>
                        <small style="color: #71717a;"><i class="bi bi-envelope"></i> ${user.email}</small>
                        <br>
                        <span class="badge-admin ${user.role}" style="margin-top: 8px; display: inline-block;">${user.role}</span>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn-sm" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 8px 16px; border-radius: 8px;" onclick="viewUserDetails('${user._id}')">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button class="btn btn-sm" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 8px 16px; border-radius: 8px;" onclick="resetUserPassword('${user._id}', '${user.name}')">
                            <i class="bi bi-key"></i> Reset
                        </button>
                        <button class="btn btn-sm" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 8px 16px; border-radius: 8px;" onclick="toggleUserRole('${user._id}', '${user.role}')">
                            <i class="bi bi-shield"></i> Role
                        </button>
                        <button class="btn btn-sm" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 8px 16px; border-radius: 8px;" onclick="deleteUser('${user._id}', '${user.name}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            usersDiv.innerHTML = '<p style="color: #71717a; text-align: center; padding: 40px;">No users found</p>';
        }
        
        // Pagination
        const paginationDiv = document.getElementById('pagination');
        let paginationHTML = '';
        for (let i = 1; i <= data.totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadUsers(${i}, '${search}'); return false;">${i}</a>
                </li>
            `;
        }
        paginationDiv.innerHTML = paginationHTML;
        
    } catch (err) {
        console.error('Error loading users:', err);
        showNotification('Failed to load users', 'error');
    }
}

// View User Details
async function viewUserDetails(userId) {
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error('Failed to load user details');

        const data = await res.json();
        
        const content = `
            <div class="row">
                <div class="col-md-6">
                    <h6>User Information</h6>
                    <p><strong>Name:</strong> ${data.user.name}</p>
                    <p><strong>Email:</strong> ${data.user.email}</p>
                    <p><strong>Role:</strong> <span class="badge-admin ${data.user.role}">${data.user.role}</span></p>
                    <p><strong>Joined:</strong> ${new Date(data.user.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="col-md-6">
                    <h6>Statistics</h6>
                    <p><strong>Total Expenses:</strong> ₹${data.stats.totalExpenses.toFixed(0)} (${data.stats.expenseCount})</p>
                    <p><strong>Total Income:</strong> ₹${data.stats.totalIncome.toFixed(0)} (${data.stats.incomeCount})</p>
                    <p><strong>Net Savings:</strong> <span style="color: ${data.stats.netSavings >= 0 ? '#10b981' : '#ef4444'}">₹${data.stats.netSavings.toFixed(0)}</span></p>
                    <p><strong>Friends:</strong> ${data.stats.friendsCount}</p>
                </div>
            </div>
            
            <hr>
            
            <h6>Recent Expenses (Last 20)</h6>
            <div style="max-height: 200px; overflow-y: auto;">
                ${data.recentExpenses.length > 0 ? data.recentExpenses.map(exp => `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${exp.category} - ${exp.description || 'No description'}</span>
                        <strong class="text-danger">₹${exp.amount}</strong>
                    </div>
                `).join('') : '<p class="text-muted">No expenses</p>'}
            </div>
            
            <hr>
            
            <h6>Recent Income (Last 20)</h6>
            <div style="max-height: 200px; overflow-y: auto;">
                ${data.recentIncome.length > 0 ? data.recentIncome.map(inc => `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${inc.source} - ${inc.description || 'No description'}</span>
                        <strong class="text-success">₹${inc.amount}</strong>
                    </div>
                `).join('') : '<p class="text-muted">No income</p>'}
            </div>
        `;
        
        document.getElementById('user-detail-content').innerHTML = content;
        new bootstrap.Modal(document.getElementById('userDetailModal')).show();
        
    } catch (err) {
        console.error('Error loading user details:', err);
        showNotification('Failed to load user details', 'error');
    }
}

// Reset User Password
async function resetUserPassword(userId, userName) {
    const newPassword = prompt(`Reset password for ${userName}?\n\nEnter new password (min 6 characters):`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (err) {
        console.error('Error resetting password:', err);
        showNotification('Failed to reset password', 'error');
    }
}

// Toggle User Role
async function toggleUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-role`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });

        const data = await res.json();

        if (res.ok) {
            showNotification(data.message, 'success');
            loadUsers(currentPage);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (err) {
        console.error('Error toggling role:', err);
        showNotification('Failed to change role', 'error');
    }
}

// Delete User
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}?\n\nThis will delete all their data permanently!`)) return;
    
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        const data = await res.json();

        if (res.ok) {
            showNotification(data.message, 'success');
            loadUsers(currentPage);
            loadDashboard(); // Refresh stats
        } else {
            showNotification(data.message, 'error');
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        showNotification('Failed to delete user', 'error');
    }
}

// Load Activity
async function loadActivity() {
    try {
        const res = await fetch(`${API_URL}/admin/activity?limit=50`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) throw new Error('Failed to load activity');

        const activities = await res.json();
        
        const activityDiv = document.getElementById('activity-list');
        if (activities.length > 0) {
            activityDiv.innerHTML = activities.map(act => `
                <div class="user-row">
                    <div>
                        <strong style="color: white;">${act.user?.name || 'Unknown'}</strong>
                        <small style="color: #71717a; margin-left: 10px;"><i class="bi bi-envelope"></i> ${act.user?.email || ''}</small>
                        <br>
                        <span class="badge-admin ${act.type === 'expense' ? 'admin' : 'user'}" style="margin-top: 8px; background: ${act.type === 'expense' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)'};">${act.type}</span>
                        <span style="color: #a1a1aa; margin-left: 10px;">${act.category || act.source}</span>
                        ${act.description ? `<br><small style="color: #71717a;">${act.description}</small>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <strong style="color: ${act.type === 'expense' ? '#ef4444' : '#10b981'}; font-size: 18px;">₹${act.amount}</strong>
                        <br>
                        <small style="color: #71717a;">${new Date(act.date).toLocaleString()}</small>
                    </div>
                </div>
            `).join('');
        } else {
            activityDiv.innerHTML = '<p style="color: #71717a; text-align: center; padding: 40px;">No activity found</p>';
        }
        
    } catch (err) {
        console.error('Error loading activity:', err);
        showNotification('Failed to load activity', 'error');
    }
}

// Show Section
function showSection(section) {
    // Hide all sections
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('activity-section').style.display = 'none';
    document.getElementById('stats-section').style.display = 'none';
    
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Add active class to clicked nav item
    event.target.closest('.admin-nav-item').classList.add('active');
    
    // Load data based on section
    if (section === 'users') {
        loadUsers();
    } else if (section === 'activity') {
        loadActivity();
    } else if (section === 'dashboard') {
        loadDashboard();
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle-fill' : 
                 type === 'error' ? 'x-circle-fill' : 'info-circle-fill';
    
    notification.innerHTML = `
        <i class="bi bi-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Create Particles
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

// Migrate Existing Users
async function migrateExistingUsers() {
    if (!confirm('This will add default security questions to all existing users.\n\nDefault Question: "What is your favorite food?"\nDefault Answer: "pizza"\n\nContinue?')) {
        return;
    }

    const resultDiv = document.getElementById('migration-result');
    resultDiv.innerHTML = '<p style="color: #a1a1aa;">Migrating users...</p>';

    try {
        const res = await fetch(`${API_URL}/admin/migrate-users`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        });

        const data = await res.json();

        if (res.ok) {
            resultDiv.innerHTML = `
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; color: #10b981;">
                    <h6 style="color: #10b981; margin-bottom: 10px;"><i class="bi bi-check-circle"></i> Migration Successful!</h6>
                    <p style="margin: 5px 0;"><strong>Migrated Users:</strong> ${data.migratedCount}</p>
                    <p style="margin: 5px 0;"><strong>Default Question:</strong> ${data.defaultQuestion}</p>
                    <p style="margin: 5px 0;"><strong>Default Answer:</strong> ${data.defaultAnswer}</p>
                    <hr style="border-color: rgba(16, 185, 129, 0.3); margin: 15px 0;">
                    <p style="font-size: 14px; margin: 0;">${data.note}</p>
                </div>
            `;
            showNotification(data.message, 'success');
        } else {
            resultDiv.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 15px; color: #ef4444;">
                    <i class="bi bi-x-circle"></i> ${data.message}
                </div>
            `;
            showNotification(data.message, 'error');
        }
    } catch (err) {
        console.error('Error migrating users:', err);
        resultDiv.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 15px; color: #ef4444;">
                <i class="bi bi-x-circle"></i> Network error. Please try again.
            </div>
        `;
        showNotification('Failed to migrate users', 'error');
    }
}
