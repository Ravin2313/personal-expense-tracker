// Script to create admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Admin details
    const adminEmail = 'admin@expense.com';
    const adminPassword = 'admin123'; // Change this!
    const adminName = 'Admin';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Updating to admin role...');
      
      admin.role = 'admin';
      await admin.save();
      
      console.log('✅ User updated to admin role');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Create admin user
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Admin Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔗 Access admin panel at: http://localhost:5000/admin.html');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createAdmin();
