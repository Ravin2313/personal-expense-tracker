// Migration script to add security questions to existing users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Find users without security question
    const usersWithoutSecurity = await User.find({
      $or: [
        { securityQuestion: { $exists: false } },
        { securityAnswer: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${usersWithoutSecurity.length} users without security questions`);

    if (usersWithoutSecurity.length === 0) {
      console.log('✅ All users already have security questions!');
      process.exit(0);
    }

    // Default security question and answer
    const defaultQuestion = "What is your favorite food?";
    const defaultAnswer = "pizza"; // Users will need to change this

    console.log('\n🔧 Migrating users...');
    console.log(`Default Question: ${defaultQuestion}`);
    console.log(`Default Answer: ${defaultAnswer}`);
    console.log('\n⚠️  IMPORTANT: Users should update their security question from settings!\n');

    // Hash the default answer
    const salt = await bcrypt.genSalt(10);
    const hashedAnswer = await bcrypt.hash(defaultAnswer.toLowerCase().trim(), salt);

    let migratedCount = 0;

    for (const user of usersWithoutSecurity) {
      user.securityQuestion = defaultQuestion;
      user.securityAnswer = hashedAnswer;
      await user.save();
      migratedCount++;
      console.log(`✅ Migrated: ${user.email}`);
    }

    console.log(`\n✅ Successfully migrated ${migratedCount} users!`);
    console.log('\n📝 Next Steps:');
    console.log('1. Inform users about the default security question');
    console.log('2. Users can reset password using:');
    console.log('   - Question: "What is your favorite food?"');
    console.log('   - Answer: "pizza"');
    console.log('3. Add a feature in settings to update security question (optional)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

migrateUsers();
