require('dotenv').config();
const mongoose = require('mongoose');
const userRepository = require('../app/user/repository');
const authRepository = require('../app/auth/auth.repository');
const authService = require('../app/auth/auth.service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/database';

// Admin credentials to seed. Change if needed before running.
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@reseau.eseo.fr';
const ADMIN_USERNAME = process.env.ADMIN_SEED_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin!2026';

(async () => {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Check if admin already exists by email
    const existing = await userRepository.findUserByEmail(ADMIN_EMAIL);
    if (existing) {
      console.log('Admin already exists with this email. Skipping creation.');
      console.log({ id: existing._id || existing.id, email: existing.email, role: existing.role, status: existing.status });
      process.exit(0);
    }

    const userResult = await userRepository.createUser({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      role: 'ADMIN',
      status: 'ACTIF',
      firstName: 'Admin',
      lastName: 'Systeme',
    });

    console.log('User created:', userResult);

    const hashedPassword = await authService.hashPassword(ADMIN_PASSWORD);
    await authRepository.createAuthRecord(userResult._id || userResult.id, hashedPassword);

    console.log('Auth record created.');
    console.log('Admin account ready:', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'ADMIN',
      status: 'ACTIF',
    });

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
})();
