# 🔐 Admin Panel Setup Guide

## Overview
The admin panel allows you to manage all users, view system statistics, monitor activities, and perform administrative tasks.

---

## 🚀 Quick Setup (3 Methods)

### Method 1: Using Setup Page (Easiest - Recommended for Render)

**Step 1: Add Secret Key to Environment**

Add this to your `.env` file or Render environment variables:
```env
ADMIN_SETUP_KEY=your_secret_random_key_here
```
Example: `ADMIN_SETUP_KEY=mysecret123xyz`

**Step 2: Open Setup Page**

Go to: `http://your-domain.com/setup-admin.html`

Or locally: `http://localhost:5000/setup-admin.html`

**Step 3: Fill the Form**
- Admin Email: `admin@example.com`
- Admin Password: `your_secure_password`
- Secret Setup Key: `mysecret123xyz` (same as ADMIN_SETUP_KEY)

**Step 4: Create Admin**

Click "Create Admin" button. Done! ✅

**Step 5: Login**

Go to: `http://your-domain.com/admin.html`

Login with your admin credentials.

---

### Method 2: Using npm Script (Local Development)

**Step 1: Run Command**
```bash
npm run create-admin
```

**Step 2: Default Credentials**
```
Email: admin@expense.com
Password: admin123
```

**Step 3: Login**

Go to: `http://localhost:5000/admin.html`

⚠️ **Important:** Change password after first login!

---

### Method 3: Using API (Postman/cURL)

**Step 1: Make POST Request**

```bash
curl -X POST http://your-domain.com/api/admin/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password",
    "secretKey": "your_secret_key"
  }'
```

**Step 2: Response**
```json
{
  "message": "Admin user created successfully!",
  "email": "admin@example.com",
  "note": "You can now login and access admin panel at /admin.html"
}
```

---

## 🎯 Admin Panel Features

### 1. Dashboard
- Total users count
- Total expenses & income
- Active users today
- Financial overview
- Top spending categories
- Recent users list

### 2. User Management
- View all users (with pagination)
- Search users by name/email
- View detailed user stats
- Reset user passwords
- Toggle user roles (make admin/user)
- Delete users (with all their data)

### 3. Activity Monitor
- Recent transactions (expenses & income)
- User activity tracking
- Real-time updates

### 4. Statistics
- System-wide analytics
- Category breakdowns
- Trends and insights

---

## 🔒 Security Features

### 1. Secret Key Protection
- Setup endpoint requires secret key
- Only works if no admin exists
- Prevents unauthorized admin creation

### 2. Role-Based Access
- Admin middleware checks user role
- Protected routes require admin token
- Cannot delete or modify own account

### 3. JWT Authentication
- All admin routes require valid token
- Token verification on every request
- Automatic logout on invalid token

---

## 📋 Admin Operations

### View User Details
1. Go to "Users" section
2. Click "View" button on any user
3. See complete user information:
   - Personal details
   - Financial statistics
   - Recent transactions
   - Budget information

### Reset User Password
1. Go to "Users" section
2. Click "Reset" button
3. Enter new password (min 6 characters)
4. User can login with new password

### Make User Admin
1. Go to "Users" section
2. Click "Role" button
3. Confirm role change
4. User becomes admin (or vice versa)

### Delete User
1. Go to "Users" section
2. Click "Delete" button
3. Confirm deletion
4. User and ALL their data deleted permanently

⚠️ **Warning:** Deletion is permanent and cannot be undone!

---

## 🌐 Deployment on Render

### Step 1: Deploy Your App
Follow normal deployment process.

### Step 2: Add Environment Variable
In Render dashboard:
1. Go to your service
2. Click "Environment"
3. Add new variable:
   - Key: `ADMIN_SETUP_KEY`
   - Value: `your_secret_key_123`

### Step 3: Create Admin
**Option A: Using Setup Page**
- Visit: `https://your-app.onrender.com/setup-admin.html`
- Fill form with secret key
- Create admin

**Option B: Using Render Shell**
1. Go to Render dashboard
2. Click "Shell" tab
3. Run: `npm run create-admin`
4. Use default credentials

### Step 4: Access Admin Panel
- Visit: `https://your-app.onrender.com/admin.html`
- Login with admin credentials

---

## 🔧 Troubleshooting

### "Invalid secret key" Error
- Check ADMIN_SETUP_KEY in .env file
- Make sure it matches what you entered
- Restart server after adding .env variable

### "Admin already exists" Error
- An admin user already exists
- Login with existing admin credentials
- Use admin panel to create more admins

### "Access denied. Admin only" Error
- You're not logged in as admin
- Login with admin account
- Check if your account has admin role

### Cannot Access Admin Panel
- Make sure you're logged in
- Check if token is valid
- Try logging out and logging in again

### MongoDB Connection Error (Local)
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- For Atlas: Whitelist your IP address

---

## 📝 Best Practices

### 1. Secure Your Secret Key
- Use a strong random string
- Don't share it publicly
- Change it after first admin creation
- Store it securely in environment variables

### 2. Strong Admin Password
- Minimum 8 characters
- Mix of letters, numbers, symbols
- Change default password immediately
- Don't reuse passwords

### 3. Limit Admin Accounts
- Only create admins when necessary
- Review admin list regularly
- Remove admin access when not needed

### 4. Regular Monitoring
- Check activity logs regularly
- Monitor user growth
- Review system statistics
- Watch for suspicious activity

### 5. Backup Data
- Regular database backups
- Export important data
- Test restore procedures

---

## 🎉 Quick Start Checklist

- [ ] Add ADMIN_SETUP_KEY to .env
- [ ] Deploy/Start your application
- [ ] Visit setup-admin.html
- [ ] Create admin account
- [ ] Login to admin panel
- [ ] Change default password
- [ ] Explore admin features
- [ ] Create additional admins if needed

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review error messages
3. Check server logs
4. Verify environment variables
5. Test with default setup

---

**Made with ❤️ for better system management**
