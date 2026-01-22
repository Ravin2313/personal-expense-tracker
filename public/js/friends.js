// Auto-detect API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`;
let token = localStorage.getItem('token');
let currentUser = null;
let friends = [];
let splits = [];

// Check authentication
if (!token) {
    window.location.href = 'index.html';
}

fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(user => {
    currentUser = user;
    document.getElementById('user-name').textContent = user.name;
    loadData();
})
.catch(() => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Load all data
async function loadData() {
    await loadBalanceSummary();
    await loadFriends();
    await loadSplits();
}

// Load balance summary
async function loadBalanceSummary() {
    try {
        const res = await fetch(`${API_URL}/friends/balance-summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        document.getElementById('total-owed').textContent = `₹${data.totalOwed.toFixed(0)}`;
        document.getElementById('total-owing').textContent = `₹${data.totalOwing.toFixed(0)}`;
        
        const netEl = document.getElementById('net-balance');
        netEl.textContent = `₹${Math.abs(data.netBalance).toFixed(0)}`;
        
        const netCard = netEl.closest('.balance-card');
        if (data.netBalance > 0) {
            netCard.classList.add('positive');
            netCard.classList.remove('negative');
        } else if (data.netBalance < 0) {
            netCard.classList.add('negative');
            netCard.classList.remove('positive');
        }
    } catch (err) {
        console.error('Failed to load balance summary', err);
    }
}

// Load friends
async function loadFriends() {
    try {
        const res = await fetch(`${API_URL}/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        friends = await res.json();
        displayFriends();
    } catch (err) {
        console.error('Failed to load friends', err);
    }
}

function displayFriends() {
    const list = document.getElementById('friends-list');
    
    if (friends.length === 0) {
        list.innerHTML = '<p class="empty-state"><i class="bi bi-people"></i> No friends added yet. Add a friend to start splitting expenses!</p>';
        return;
    }
    
    list.innerHTML = '';
    
    friends.forEach(friend => {
        const item = document.createElement('div');
        item.className = 'friend-item';
        
        const balance = friend.balance;
        const balanceText = balance > 0 
            ? `<span class="friend-owes">Owes you ₹${balance.toFixed(0)}</span>`
            : balance < 0
            ? `<span class="you-owe">You owe ₹${Math.abs(balance).toFixed(0)}</span>`
            : `<span class="settled">All settled up!</span>`;
        
        item.innerHTML = `
            <div class="friend-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="friend-info">
                <h4>${friend.friendName}</h4>
                <p>${friend.friendEmail || friend.friendPhone || 'No contact info'}</p>
                ${balanceText}
            </div>
            <div class="friend-actions">
                ${balance > 0 ? `<button class="btn-remind" onclick="openReminderModal('${friend._id}', '${friend.friendName}', ${balance}, '${friend.friendPhone || ''}', '${friend.friendEmail || ''}')">
                    <i class="bi bi-bell"></i> Remind
                </button>` : ''}
                ${balance !== 0 ? `<button class="btn-settle" onclick="settleWithFriend('${friend._id}', '${friend.friendName}', ${balance})">
                    <i class="bi bi-check-circle"></i> Settle
                </button>` : ''}
                <button class="btn-view-details" onclick="viewFriendDetails('${friend._id}')">
                    <i class="bi bi-eye"></i> Details
                </button>
                <button class="btn-delete-friend" onclick="deleteFriend('${friend._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Load splits
async function loadSplits() {
    try {
        const res = await fetch(`${API_URL}/splitExpenses/unsettled`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        splits = await res.json();
        displaySplits();
    } catch (err) {
        console.error('Failed to load splits', err);
    }
}

function displaySplits() {
    const list = document.getElementById('splits-list');
    
    if (splits.length === 0) {
        list.innerHTML = '<p class="empty-state"><i class="bi bi-receipt"></i> No unsettled split expenses</p>';
        return;
    }
    
    list.innerHTML = '';
    
    splits.forEach(split => {
        const item = document.createElement('div');
        item.className = 'split-item';
        
        item.innerHTML = `
            <div class="split-info">
                <h4>${split.expense.category}</h4>
                <p>${split.expense.description || 'No description'}</p>
                <p class="split-date">${new Date(split.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="split-details">
                <div class="split-amount">
                    <span class="label">Total:</span>
                    <span class="value">₹${split.totalAmount}</span>
                </div>
                <div class="split-amount">
                    <span class="label">Your share:</span>
                    <span class="value">₹${split.yourShare}</span>
                </div>
                <div class="split-amount friend-share">
                    <span class="label">${split.friend.friendName}'s share:</span>
                    <span class="value">₹${split.friendShare}</span>
                </div>
            </div>
            <div class="split-actions">
                <button class="btn-settle-split" onclick="settleSplit('${split._id}')">
                    <i class="bi bi-check-circle"></i> Mark Settled
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Add friend modal
document.getElementById('add-friend-btn').addEventListener('click', () => {
    document.getElementById('add-friend-modal').classList.add('active');
});

document.getElementById('close-friend-modal').addEventListener('click', () => {
    document.getElementById('add-friend-modal').classList.remove('active');
});

document.getElementById('add-friend-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('friend-name').value;
    const email = document.getElementById('friend-email').value;
    const phone = document.getElementById('friend-phone').value;
    
    try {
        const res = await fetch(`${API_URL}/friends`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                friendName: name,
                friendEmail: email,
                friendPhone: phone
            })
        });
        
        if (res.ok) {
            document.getElementById('add-friend-modal').classList.remove('active');
            document.getElementById('add-friend-form').reset();
            loadData();
            alert('✅ Friend added successfully!');
        } else {
            alert('Failed to add friend');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to add friend');
    }
});

// Settle with friend
let currentSettleFriend = null;

function settleWithFriend(friendId, friendName, balance) {
    currentSettleFriend = { friendId, balance };
    
    const message = balance > 0
        ? `${friendName} will pay you ₹${balance.toFixed(0)}`
        : `You will pay ${friendName} ₹${Math.abs(balance).toFixed(0)}`;
    
    document.getElementById('settle-message').textContent = message;
    document.getElementById('settle-modal').classList.add('active');
}

document.getElementById('close-settle-modal').addEventListener('click', () => {
    document.getElementById('settle-modal').classList.remove('active');
});

document.getElementById('confirm-settle-btn').addEventListener('click', async () => {
    if (!currentSettleFriend) return;
    
    try {
        // Get all unsettled splits for this friend
        const res = await fetch(`${API_URL}/splitExpenses/friend/${currentSettleFriend.friendId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const friendSplits = await res.json();
        
        // Settle all unsettled splits
        for (const split of friendSplits) {
            if (!split.settled) {
                await fetch(`${API_URL}/splitExpenses/${split._id}/settle`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ settledBy: 'manual' })
                });
            }
        }
        
        document.getElementById('settle-modal').classList.remove('active');
        loadData();
        alert('✅ Settlement completed!');
    } catch (err) {
        console.error(err);
        alert('Failed to settle');
    }
});

// Settle individual split
async function settleSplit(splitId) {
    if (!confirm('Mark this expense as settled?')) return;
    
    try {
        const res = await fetch(`${API_URL}/splitExpenses/${splitId}/settle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ settledBy: 'manual' })
        });
        
        if (res.ok) {
            loadData();
            alert('✅ Marked as settled!');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to settle');
    }
}

// Delete friend
async function deleteFriend(friendId) {
    if (!confirm('Delete this friend? All split history will be lost.')) return;
    
    try {
        const res = await fetch(`${API_URL}/friends/${friendId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            loadData();
            alert('✅ Friend deleted');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to delete friend');
    }
}

// View friend details
async function viewFriendDetails(friendId) {
    try {
        // Get friend info
        const friendRes = await fetch(`${API_URL}/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allFriends = await friendRes.json();
        const friend = allFriends.find(f => f._id === friendId);
        
        if (!friend) {
            alert('Friend not found');
            return;
        }
        
        // Get friend's split history
        const splitsRes = await fetch(`${API_URL}/splitExpenses/friend/${friendId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const friendSplits = await splitsRes.json();
        
        // Update modal
        document.getElementById('detail-friend-name').textContent = friend.friendName;
        document.getElementById('detail-email').textContent = friend.friendEmail || 'Not provided';
        document.getElementById('detail-phone').textContent = friend.friendPhone || 'Not provided';
        
        const balanceEl = document.getElementById('detail-balance');
        const balance = friend.balance;
        if (balance > 0) {
            balanceEl.textContent = `₹${balance.toFixed(0)} (Owes you)`;
            balanceEl.style.color = 'var(--success)';
        } else if (balance < 0) {
            balanceEl.textContent = `₹${Math.abs(balance).toFixed(0)} (You owe)`;
            balanceEl.style.color = 'var(--danger)';
        } else {
            balanceEl.textContent = 'Settled';
            balanceEl.style.color = 'var(--text-secondary)';
        }
        
        // Display transactions
        const transactionList = document.getElementById('transaction-list');
        if (friendSplits.length === 0) {
            transactionList.innerHTML = '<p class="empty-state">No transactions yet</p>';
        } else {
            transactionList.innerHTML = '';
            friendSplits.forEach(split => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                
                const statusClass = split.settled ? 'settled' : 'pending';
                const statusText = split.settled ? 'Settled' : 'Pending';
                const statusIcon = split.settled ? 'check-circle-fill' : 'clock';
                
                item.innerHTML = `
                    <div class="transaction-left">
                        <div class="transaction-icon ${statusClass}">
                            <i class="bi bi-${statusIcon}"></i>
                        </div>
                        <div class="transaction-info">
                            <h5>${split.expense.category}</h5>
                            <p>${split.expense.description || 'No description'}</p>
                            <span class="transaction-date">${new Date(split.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                            })}</span>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amounts">
                            <div class="amount-row">
                                <span class="amount-label">Total:</span>
                                <span class="amount-value">₹${split.totalAmount}</span>
                            </div>
                            <div class="amount-row">
                                <span class="amount-label">Your share:</span>
                                <span class="amount-value">₹${split.yourShare}</span>
                            </div>
                            <div class="amount-row highlight">
                                <span class="amount-label">${friend.friendName}'s share:</span>
                                <span class="amount-value">₹${split.friendShare}</span>
                            </div>
                        </div>
                        <span class="transaction-status ${statusClass}">${statusText}</span>
                    </div>
                `;
                
                transactionList.appendChild(item);
            });
        }
        
        // Calculate statistics
        const totalSplits = friendSplits.length;
        const totalAmount = friendSplits.reduce((sum, split) => sum + split.totalAmount, 0);
        const settledCount = friendSplits.filter(split => split.settled).length;
        const pendingCount = friendSplits.filter(split => !split.settled).length;
        
        document.getElementById('stat-total-splits').textContent = totalSplits;
        document.getElementById('stat-total-amount').textContent = `₹${totalAmount.toFixed(0)}`;
        document.getElementById('stat-settled').textContent = settledCount;
        document.getElementById('stat-pending').textContent = pendingCount;
        
        // Show modal
        document.getElementById('friend-details-modal').classList.add('active');
        
    } catch (err) {
        console.error('Failed to load friend details', err);
        alert('Failed to load friend details');
    }
}

// Close details modal
document.getElementById('close-details-modal').addEventListener('click', () => {
    document.getElementById('friend-details-modal').classList.remove('active');
});

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
            'rgba(99, 102, 241, 0.6)',
            'rgba(168, 85, 247, 0.6)',
            'rgba(20, 184, 166, 0.6)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
    }
}

createParticles();


// ============ PAYMENT REMINDER FUNCTIONS ============

let currentReminderFriend = null;

// Open Reminder Modal
function openReminderModal(friendId, friendName, balance, phone, email) {
    currentReminderFriend = {
        id: friendId,
        name: friendName,
        balance: balance,
        phone: phone,
        email: email
    };
    
    document.getElementById('reminder-friend-name').textContent = friendName;
    document.getElementById('reminder-amount').textContent = `Owes you ₹${balance.toFixed(0)}`;
    
    // Load reminder history
    loadReminderHistory(friendId);
    
    // Show modal
    document.getElementById('reminder-modal').classList.add('active');
}

// Close Reminder Modal
document.getElementById('close-reminder-modal')?.addEventListener('click', () => {
    document.getElementById('reminder-modal').classList.remove('active');
});

// Load Reminder History
async function loadReminderHistory(friendId) {
    try {
        const friend = friends.find(f => f._id === friendId);
        const historyList = document.getElementById('reminder-history-list');
        
        if (!friend || !friend.reminders || friend.reminders.length === 0) {
            historyList.innerHTML = '<p class="empty-state-small">No reminders sent yet</p>';
            return;
        }
        
        historyList.innerHTML = '';
        
        // Show last 5 reminders
        const recentReminders = friend.reminders.slice(-5).reverse();
        
        recentReminders.forEach(reminder => {
            const item = document.createElement('div');
            item.className = 'reminder-history-item';
            
            const methodIcons = {
                whatsapp: 'bi-whatsapp',
                sms: 'bi-chat-dots',
                email: 'bi-envelope',
                link: 'bi-link-45deg'
            };
            
            const methodNames = {
                whatsapp: 'WhatsApp',
                sms: 'SMS',
                email: 'Email',
                link: 'Link Copied'
            };
            
            item.innerHTML = `
                <i class="bi ${methodIcons[reminder.method]}"></i>
                <div class="reminder-history-info">
                    <span class="reminder-method">${methodNames[reminder.method]}</span>
                    <span class="reminder-time">${new Date(reminder.sentAt).toLocaleString()}</span>
                </div>
                <span class="reminder-amount-small">₹${reminder.amount}</span>
            `;
            
            historyList.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load reminder history', err);
    }
}

// Send Reminder Via Different Methods
async function sendReminderVia(method) {
    if (!currentReminderFriend) return;
    
    const { id, name, balance, phone, email } = currentReminderFriend;
    const amount = balance.toFixed(0);
    
    // Create reminder message
    const message = `Hi ${name}! 👋\n\nFriendly reminder: You owe me ₹${amount}.\n\nPlease settle up when you can. Thanks! 😊`;
    
    switch(method) {
        case 'whatsapp':
            if (!phone) {
                alert('❌ Phone number not available for this friend. Please add phone number first.');
                return;
            }
            // Remove all non-digits and ensure it starts with country code
            let cleanPhone = phone.replace(/\D/g, '');
            if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
                cleanPhone = '91' + cleanPhone;
            }
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            await saveReminder(id, method, amount, message);
            showNotification('✅ WhatsApp opened! Send the reminder message.', 'success');
            break;
            
        case 'sms':
            if (!phone) {
                alert('❌ Phone number not available for this friend. Please add phone number first.');
                return;
            }
            const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
            window.location.href = smsUrl;
            await saveReminder(id, method, amount, message);
            showNotification('✅ SMS app opened! Send the reminder.', 'success');
            break;
            
        case 'email':
            if (!email) {
                alert('❌ Email not available for this friend. Please add email first.');
                return;
            }
            const subject = `Payment Reminder - ₹${amount}`;
            const emailBody = `Hi ${name},\n\nThis is a friendly reminder about the pending payment.\n\nAmount: ₹${amount}\n\nPlease settle up when convenient.\n\nThanks!`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            window.location.href = mailtoUrl;
            await saveReminder(id, method, amount, message);
            showNotification('✅ Email client opened! Send the reminder.', 'success');
            break;
            
        case 'link':
            const paymentLink = `Payment Reminder:\n${name} owes you ₹${amount}\n\n${message}`;
            
            // Copy to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(paymentLink);
                showNotification('✅ Payment reminder copied! Share it anywhere.', 'success');
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = paymentLink;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('✅ Payment reminder copied!', 'success');
            }
            await saveReminder(id, method, amount, message);
            break;
    }
    
    // Close modal after a delay
    setTimeout(() => {
        document.getElementById('reminder-modal').classList.remove('active');
    }, 1500);
}

// Save Reminder to Database
async function saveReminder(friendId, method, amount, message) {
    try {
        const res = await fetch(`${API_URL}/friends/${friendId}/reminder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method,
                amount,
                message
            })
        });
        
        if (res.ok) {
            // Reload friends to update reminder history
            await loadFriends();
            loadReminderHistory(friendId);
        }
    } catch (err) {
        console.error('Failed to save reminder', err);
    }
}

// Show Notification
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
