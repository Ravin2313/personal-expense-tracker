// Auto-detect API URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;

console.log('🌐 Settings - API URL:', API_URL);

let token = localStorage.getItem('token');
let currentUser = null;

console.log('🔑 Token exists:', !!token);

// Check authentication
if (!token) {
    console.log('❌ No token found, redirecting to login');
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 Settings page loaded');
    await loadUserProfile();
    await loadUserStats();
    setupForms();
});

// Load user profile
async function loadUserProfile() {
    console.log('👤 Loading user profile...');
    try {
        console.log('📤 Fetching:', `${API_URL}/auth/me`);
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'x-auth-token': token }
        });

        console.log('📥 Response status:', res.status);

        if (!res.ok) {
            if (res.status === 401) {
                console.error('❌ Unauthorized - Token invalid');
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Failed to load profile');
        }

        currentUser = await res.json();
        console.log('✅ User profile loaded:', currentUser);
        
        // Update UI
        document.getElementById('user-name-display').textContent = currentUser.name;
        document.getElementById('user-email-display').textContent = currentUser.email;
        document.getElementById('user-join-date').textContent = new Date(currentUser.createdAt || Date.now()).toLocaleDateString();
        
        // Pre-fill edit form
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-email').value = currentUser.email;
        
    } catch (err) {
        console.error('❌ Error loading profile:', err);
        showNotification('Failed to load profile', 'error');
    }
}

// Load user stats
async function loadUserStats() {
    try {
        // Load expenses count
        const expensesRes = await fetch(`${API_URL}/expenses`, {
            headers: { 'x-auth-token': token }
        });
        if (expensesRes.ok) {
            const expenses = await expensesRes.json();
            document.getElementById('total-expenses-count').textContent = expenses.length;
        }

        // Load income count
        const incomeRes = await fetch(`${API_URL}/income`, {
            headers: { 'x-auth-token': token }
        });
        if (incomeRes.ok) {
            const income = await incomeRes.json();
            document.getElementById('total-income-count').textContent = income.length;
        }

        // Load budgets count
        const now = new Date();
        const budgetsRes = await fetch(`${API_URL}/budgets/${now.getMonth() + 1}/${now.getFullYear()}`, {
            headers: { 'x-auth-token': token }
        });
        if (budgetsRes.ok) {
            const budgets = await budgetsRes.json();
            document.getElementById('budgets-set-count').textContent = budgets.length;
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Setup forms
function setupForms() {
    // Change password form
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validation
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Password changed successfully! 🎉', 'success');
                document.getElementById('change-password-form').reset();
            } else {
                showNotification(data.message || 'Failed to change password', 'error');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            showNotification('Network error. Please try again.', 'error');
        }
    });

    // Edit profile form
    document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('edit-name').value.trim();

        if (name.length < 2) {
            showNotification('Name must be at least 2 characters', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ name })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Profile updated successfully! 🎉', 'success');
                currentUser = data.user;
                document.getElementById('user-name-display').textContent = name;
            } else {
                showNotification(data.message || 'Failed to update profile', 'error');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            showNotification('Network error. Please try again.', 'error');
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-x-circle' : 'bi-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Create particles
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
        
        const colors = [
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(6, 182, 212, 0.6)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
    }
}

createParticles();
