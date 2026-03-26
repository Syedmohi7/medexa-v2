require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node create-admin.js your@email.com');
      process.exit(1);
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ ${email} is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();