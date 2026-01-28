require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@moovie.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();