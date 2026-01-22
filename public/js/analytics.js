const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;

let monthlyTrendChart, categoryPieChart, categoryBarChart, paymentMethodChart, topCategoriesChart;

// Check authentication
if (!token) {
    window.location.href = 'index.html';
}

// Load user info
fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(user => {
    currentUser = user;
    document.getElementById('user-name').textContent = user.name;
    loadAnalytics();
})
.catch(() => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Update loadAnalytics to store data
async function loadAnalytics() {
    const monthRange = parseInt(document.getElementById('month-range').value);
    
    try {
        const res = await fetch(`${API_URL}/expenses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expenses = await res.json();
        
        console.log('Total expenses loaded:', expenses.length);

        // Filter expenses by date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthRange + 1, 1);
        const filteredExpenses = expenses.filter(exp => new Date(exp.date) >= startDate);
        
        console.log('Filtered expenses:', filteredExpenses.length);

        // Process data
        const monthlyData = processMonthlyData(filteredExpenses, monthRange);
        const categoryData = processCategoryData(filteredExpenses);
        const paymentData = processPaymentData(filteredExpenses);
        const categoryMonthlyData = processCategoryMonthlyData(filteredExpenses, monthRange);

        console.log('Monthly data:', monthlyData);
        console.log('Category data:', categoryData);

        // Update charts
        updateMonthlyTrendChart(monthlyData);
        updateCategoryPieChart(categoryData);
        updateCategoryBarChart(categoryMonthlyData);
        updatePaymentMethodChart(paymentData);
        updateTopCategoriesChart(categoryData);

        // Update summary
        updateSummary(filteredExpenses, monthlyData, categoryData);
        
        // Store for export
        storeExportData(filteredExpenses, {});

    } catch (err) {
        console.error('Failed to load analytics', err);
        alert('Failed to load analytics data. Please check console.');
    }
}

function processMonthlyData(expenses, monthRange) {
    const now = new Date();
    const monthlyTotals = {};
    
    // Initialize months
    for (let i = monthRange - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[key] = 0;
    }

    // Sum expenses by month
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyTotals.hasOwnProperty(key)) {
            monthlyTotals[key] += exp.amount;
        }
    });

    return monthlyTotals;
}

function processCategoryData(expenses) {
    const categoryTotals = {};
    
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return categoryTotals;
}

function processPaymentData(expenses) {
    const paymentTotals = {};
    
    expenses.forEach(exp => {
        paymentTotals[exp.paymentMethod] = (paymentTotals[exp.paymentMethod] || 0) + exp.amount;
    });

    return paymentTotals;
}

function processCategoryMonthlyData(expenses, monthRange) {
    const now = new Date();
    const data = {};

    // Initialize structure
    for (let i = monthRange - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data[key] = {};
    }

    // Fill data
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (data[key]) {
            data[key][exp.category] = (data[key][exp.category] || 0) + exp.amount;
        }
    });

    return data;
}

function updateMonthlyTrendChart(monthlyData) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const values = Object.values(monthlyData);

    if (monthlyTrendChart) monthlyTrendChart.destroy();

    monthlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function updateCategoryPieChart(categoryData) {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#a8edea', '#fed6e3'
    ];

    if (categoryPieChart) categoryPieChart.destroy();

    categoryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateCategoryBarChart(categoryMonthlyData) {
    const ctx = document.getElementById('categoryBarChart').getContext('2d');
    
    const months = Object.keys(categoryMonthlyData);
    const labels = months.map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
    });

    // Get all unique categories
    const categories = new Set();
    Object.values(categoryMonthlyData).forEach(monthData => {
        Object.keys(monthData).forEach(cat => categories.add(cat));
    });

    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];

    const datasets = Array.from(categories).map((category, index) => ({
        label: category,
        data: months.map(month => categoryMonthlyData[month][category] || 0),
        backgroundColor: colors[index % colors.length]
    }));

    if (categoryBarChart) categoryBarChart.destroy();

    categoryBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function updatePaymentMethodChart(paymentData) {
    const ctx = document.getElementById('paymentMethodChart').getContext('2d');
    
    const labels = Object.keys(paymentData);
    const values = Object.values(paymentData);
    const colors = ['#667eea', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

    if (paymentMethodChart) paymentMethodChart.destroy();

    paymentMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTopCategoriesChart(categoryData) {
    const ctx = document.getElementById('topCategoriesChart').getContext('2d');
    
    // Sort and get top 5
    const sorted = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sorted.map(item => item[0]);
    const values = sorted.map(item => item[1]);

    if (topCategoriesChart) topCategoriesChart.destroy();

    topCategoriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount Spent',
                data: values,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function updateSummary(expenses, monthlyData, categoryData) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthCount = Object.keys(monthlyData).length;
    const average = total / monthCount;

    // Find highest and lowest months
    const monthEntries = Object.entries(monthlyData);
    const highest = monthEntries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
    const lowest = monthEntries.reduce((min, curr) => curr[1] < min[1] ? curr : min);

    // Top category
    const topCategory = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById('total-summary').textContent = '₹' + total.toFixed(2);
    document.getElementById('avg-summary').textContent = '₹' + average.toFixed(2);
    
    const [highYear, highMonth] = highest[0].split('-');
    document.getElementById('highest-month').textContent = 
        new Date(highYear, highMonth - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) + 
        ' (₹' + highest[1].toFixed(2) + ')';
    
    const [lowYear, lowMonth] = lowest[0].split('-');
    document.getElementById('lowest-month').textContent = 
        new Date(lowYear, lowMonth - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) + 
        ' (₹' + lowest[1].toFixed(2) + ')';
    
    if (topCategory) {
        document.getElementById('top-category').textContent = 
            topCategory[0] + ' (₹' + topCategory[1].toFixed(2) + ')';
    }
    
    document.getElementById('total-transactions').textContent = expenses.length;
}

// Initial load
document.getElementById('month-range').addEventListener('change', loadAnalytics);


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

// Update Chart.js default colors for dark theme
Chart.defaults.color = '#a1a1aa';
Chart.defaults.borderColor = 'rgba(139, 92, 246, 0.2)';


// Export Functions
let currentExpenses = [];
let currentStats = {};

// Store data for export
function storeExportData(expenses, stats) {
    currentExpenses = expenses;
    currentStats = stats;
}

// Export to CSV
function exportToCSV() {
    if (currentExpenses.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method'];
    const rows = currentExpenses.map(exp => [
        new Date(exp.date).toLocaleDateString(),
        exp.category,
        exp.description || '',
        exp.amount,
        exp.paymentMethod
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Add summary
    csvContent += '\n\nSummary\n';
    csvContent += `Total Expenses,${currentExpenses.reduce((sum, exp) => sum + exp.amount, 0)}\n`;
    csvContent += `Total Transactions,${currentExpenses.length}\n`;

    downloadFile(csvContent, 'expense-report.csv', 'text/csv');
}

// Export to Excel
function exportToExcel() {
    if (currentExpenses.length === 0) {
        alert('No data to export');
        return;
    }

    const data = currentExpenses.map(exp => ({
        'Date': new Date(exp.date).toLocaleDateString(),
        'Category': exp.category,
        'Description': exp.description || '',
        'Amount': exp.amount,
        'Payment Method': exp.paymentMethod
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Expenses sheet
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    // Summary sheet
    const summaryData = [
        { 'Metric': 'Total Expenses', 'Value': currentExpenses.reduce((sum, exp) => sum + exp.amount, 0) },
        { 'Metric': 'Total Transactions', 'Value': currentExpenses.length },
        { 'Metric': 'Average per Transaction', 'Value': (currentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / currentExpenses.length).toFixed(2) }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Category breakdown sheet
    const categoryData = {};
    currentExpenses.forEach(exp => {
        categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
    });
    const categoryArray = Object.entries(categoryData).map(([cat, amount]) => ({
        'Category': cat,
        'Total Amount': amount
    }));
    const categoryWs = XLSX.utils.json_to_sheet(categoryArray);
    XLSX.utils.book_append_sheet(wb, categoryWs, 'By Category');

    // Download
    XLSX.writeFile(wb, 'expense-report.xlsx');
}

// Export to PDF
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(20);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Expense Report', 105, 20, { align: 'center' });
    
    // Add date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    
    let yPos = 40;
    
    // Add summary
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Summary', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    const total = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    pdf.text(`Total Expenses: ₹${total.toFixed(2)}`, 20, yPos);
    yPos += 7;
    pdf.text(`Total Transactions: ${currentExpenses.length}`, 20, yPos);
    yPos += 7;
    pdf.text(`Average per Transaction: ₹${(total / currentExpenses.length).toFixed(2)}`, 20, yPos);
    yPos += 15;
    
    // Capture charts
    try {
        // Monthly Trend Chart
        const trendChart = document.getElementById('monthlyTrendChart');
        if (trendChart) {
            pdf.setFontSize(12);
            pdf.text('Monthly Spending Trend', 20, yPos);
            yPos += 5;
            
            const trendCanvas = await html2canvas(trendChart.parentElement, { 
                backgroundColor: '#1e293b',
                scale: 2 
            });
            const trendImg = trendCanvas.toDataURL('image/png');
            pdf.addImage(trendImg, 'PNG', 20, yPos, 170, 70);
            yPos += 80;
        }
        
        // Check if we need a new page
        if (yPos > 200) {
            pdf.addPage();
            yPos = 20;
        }
        
        // Category Pie Chart
        const pieChart = document.getElementById('categoryPieChart');
        if (pieChart) {
            pdf.setFontSize(12);
            pdf.text('Category Breakdown', 20, yPos);
            yPos += 5;
            
            const pieCanvas = await html2canvas(pieChart.parentElement, { 
                backgroundColor: '#1e293b',
                scale: 2 
            });
            const pieImg = pieCanvas.toDataURL('image/png');
            pdf.addImage(pieImg, 'PNG', 20, yPos, 170, 70);
        }
        
    } catch (err) {
        console.error('Error capturing charts:', err);
    }
    
    // Add new page for transactions
    pdf.addPage();
    yPos = 20;
    
    pdf.setFontSize(14);
    pdf.text('Recent Transactions', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(9);
    
    // Table headers
    pdf.setFillColor(99, 102, 241);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(20, yPos, 170, 8, 'F');
    pdf.text('Date', 25, yPos + 5);
    pdf.text('Category', 55, yPos + 5);
    pdf.text('Description', 90, yPos + 5);
    pdf.text('Amount', 160, yPos + 5);
    yPos += 10;
    
    // Table rows
    pdf.setTextColor(0, 0, 0);
    currentExpenses.slice(0, 30).forEach((exp, index) => {
        if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
        }
        
        if (index % 2 === 0) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(20, yPos - 2, 170, 7, 'F');
        }
        
        pdf.text(new Date(exp.date).toLocaleDateString(), 25, yPos + 3);
        pdf.text(exp.category.substring(0, 15), 55, yPos + 3);
        pdf.text((exp.description || '').substring(0, 20), 90, yPos + 3);
        pdf.text(`₹${exp.amount}`, 160, yPos + 3);
        yPos += 7;
    });
    
    // Save PDF
    pdf.save('expense-report.pdf');
}

// Email Modal
function openEmailModal() {
    const modal = new bootstrap.Modal(document.getElementById('emailModal'));
    modal.show();
}

// Email Form Submit
document.getElementById('email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-address').value;
    const format = document.getElementById('email-format').value;
    const message = document.getElementById('email-message').value;
    
    const btn = e.target.querySelector('.btn-send-email');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading-spinner"></span> Sending...';
    btn.disabled = true;
    
    // Simulate email sending (you'll need to implement backend API)
    setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-check-circle"></i> Sent Successfully!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        
        setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('emailModal')).hide();
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            document.getElementById('email-form').reset();
        }, 2000);
    }, 2000);
    
    console.log('Email report to:', email, 'Format:', format, 'Message:', message);
});

// Helper function to download file
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Removed duplicate loadAnalytics wrapper - causing infinite loop


// Initialize analytics on page load
console.log('=== ANALYTICS PAGE LOADED ===');
console.log('Token:', token ? 'Present' : 'Missing');
console.log('Chart.js loaded:', typeof Chart !== 'undefined');

// Check authentication
fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(user => {
    currentUser = user;
    document.getElementById('user-name').textContent = user.name;
    console.log('User authenticated:', user.name);
    
    // Load analytics data
    loadAnalytics();
})
.catch((err) => {
    console.error('Auth failed:', err);
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Month range change listener
const monthRangeSelect = document.getElementById('month-range');
if (monthRangeSelect) {
    monthRangeSelect.addEventListener('change', () => {
        console.log('Month range changed to:', monthRangeSelect.value);
        loadAnalytics();
    });
    console.log('Month range listener attached');
} else {
    console.error('Month range select not found');
}
