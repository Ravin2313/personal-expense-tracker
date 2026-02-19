// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;

let token = localStorage.getItem('token');
let currentUser = null;

console.log('⚙️ Settings Page Loaded');
console.log('🔑 Token:', token ? 'Found' : 'Not Found');

// Authentication Check
if (!token) {
    console.log('❌ No authentication token, redirecting...');
    window.location.href = 'index.html';
} else {
    // Show settings section
    document.getElementById('settings-section').style.display = 'block';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettings);
    } else {
        initSettings();
    }
}

// Initialize Settings Page
async function initSettings() {
    console.log('🚀 Initializing settings...');
    
    try {
        await loadUserProfile();
        await loadUserStats();
        setupForms();
        createParticles();
        console.log('✅ Settings initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing settings:', err);
        showNotification('Failed to load settings. Please refresh the page.', 'error');
    }
}

// Load User Profile
async function loadUserProfile() {
    try {
        console.log('👤 Loading user profile...');
        
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            if (res.status === 401) {
                console.error('❌ Unauthorized - Invalid token');
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            throw new Error(`HTTP ${res.status}`);
        }

        currentUser = await res.json();
        console.log('✅ Profile loaded:', currentUser.name);
        
        // Update UI
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('member-since').textContent = new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
        
        // Pre-fill edit form
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-email').value = currentUser.email;
        
        // Show current security question
        document.getElementById('current-security-question').textContent = currentUser.securityQuestion || 'Not set';
        
    } catch (err) {
        console.error('❌ Error loading profile:', err);
        showNotification('Failed to load profile', 'error');
    }
}

// Load User Stats
async function loadUserStats() {
    try {
        console.log('📊 Loading user stats...');
        
        // Load expenses
        const expensesRes = await fetch(`${API_URL}/expenses`, {
            headers: { 'x-auth-token': token }
        });
        if (expensesRes.ok) {
            const expenses = await expensesRes.json();
            document.getElementById('total-expenses').textContent = expenses.length;
        }

        // Load income
        const incomeRes = await fetch(`${API_URL}/income`, {
            headers: { 'x-auth-token': token }
        });
        if (incomeRes.ok) {
            const income = await incomeRes.json();
            document.getElementById('total-income').textContent = income.length;
        }

        // Load budgets
        const now = new Date();
        const budgetsRes = await fetch(`${API_URL}/budgets/${now.getMonth() + 1}/${now.getFullYear()}`, {
            headers: { 'x-auth-token': token }
        });
        if (budgetsRes.ok) {
            const budgets = await budgetsRes.json();
            document.getElementById('budgets-count').textContent = budgets.length;
        }
        
        console.log('✅ Stats loaded');
    } catch (err) {
        console.error('❌ Error loading stats:', err);
    }
}

// Setup Forms
function setupForms() {
    // Edit Profile Form
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', handleProfileUpdate);
    }

    // Change Password Form
    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Update Security Question Form
    const securityForm = document.getElementById('update-security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', handleSecurityQuestionUpdate);
    }
}

// Handle Profile Update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (name.length < 2) {
        showNotification('Name must be at least 2 characters', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';

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
            currentUser = data.user;
            document.getElementById('profile-name').textContent = name;
            showNotification('Profile updated successfully! 🎉', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Save Changes';
    }
}

// Handle Password Change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validation
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Updating...';

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
            e.target.reset();
        } else {
            showNotification(data.message || 'Failed to change password', 'error');
        }
    } catch (err) {
        console.error('Error changing password:', err);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-shield-check"></i> Update Password';
    }
}

// Handle Security Question Update
async function handleSecurityQuestionUpdate(e) {
    e.preventDefault();
    
    const securityQuestion = document.getElementById('new-security-question').value;
    const securityAnswer = document.getElementById('new-security-answer').value.trim();
    const currentPassword = document.getElementById('security-current-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validation
    if (!securityQuestion) {
        showNotification('Please select a security question', 'error');
        return;
    }

    if (securityAnswer.length < 2) {
        showNotification('Security answer must be at least 2 characters', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Updating...';

    try {
        const res = await fetch(`${API_URL}/auth/security-question`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ securityQuestion, securityAnswer, currentPassword })
        });

        const data = await res.json();

        if (res.ok) {
            showNotification('Security question updated successfully! 🎉', 'success');
            document.getElementById('current-security-question').textContent = data.securityQuestion;
            e.target.reset();
        } else {
            showNotification(data.message || 'Failed to update security question', 'error');
        }
    } catch (err) {
        console.error('Error updating security question:', err);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Update Security Question';
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

// Logout
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
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
