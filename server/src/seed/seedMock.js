import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const envFile = fileURLToPath(new URL('../../.env', import.meta.url));

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const preflightEnv = () => {
  if (!existsSync(envFile)) {
    fail(
      `Missing server/.env — copy server/.env.example to server/.env and set MONGODB_URI + JWT_SECRET.\n` +
        `  copy server\\.env.example server\\.env`
    );
  }

  dotenv.config({ path: envFile, quiet: true });

  if (!process.env.MONGODB_URI?.trim() || process.env.MONGODB_URI.includes('<user>')) {
    fail(
      'MONGODB_URI is empty or still a placeholder in server/.env.\n' +
        'Paste your MongoDB Atlas URI (same value as on the Vercel backend).'
    );
  }

  if (!process.env.JWT_SECRET?.trim()) {
    fail('JWT_SECRET is missing in server/.env (any long random string is fine for local seeding).');
  }
};

/**
 * Loads catalog + stock + sample orders for manual UI testing.
 * Does not create, update, or delete user accounts — uses your existing login.
 */
const seedMock = async () => {
  preflightEnv();

  const mongoose = (await import('mongoose')).default;
  const { connectDB } = await import('../config/db.js');
  const { env } = await import('../config/env.js');
  const { User } = await import('../models/User.model.js');
  const { clearFlowData, seedCatalog, seedOrderFlows } = await import('./seedFlow.js');

  if (env.NODE_ENV === 'production') {
    fail('Refusing to run mock seed while NODE_ENV=production.');
  }

  await connectDB();

  const actor =
    (await User.findOne({ role: 'admin', isActive: true }).sort({ createdAt: 1 })) ||
    (await User.findOne({ isActive: true }).sort({ createdAt: 1 }));

  if (!actor) {
    console.error(
      'No user account found. Register at /register (first user becomes admin) or run npm run seed once for demo logins.'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const staff =
    (await User.findOne({ role: 'staff', isActive: true }).sort({ createdAt: 1 })) || actor;

  console.log(`Mock seed on "${mongoose.connection.name}" @ ${mongoose.connection.host}`);
  console.log(`Using actor: ${actor.email} (orders/stock). Staff fallback: ${staff.email}`);
  console.log('Clearing catalog, stock movements, and orders (users unchanged)...');

  await clearFlowData();

  const { categories, suppliers, products } = await seedCatalog(actor._id);
  const flowSummary = await seedOrderFlows({
    suppliers,
    products,
    actorId: actor._id,
    staffId: staff._id,
  });

  console.log('\nMock data ready — sign in with your existing account and try:');
  console.log('  • Products: search, low-stock filter, archived FRN-3099');
  console.log('  • Stock: movement history + low-stock list (e.g. ELC-1003, ELC-1005)');
  console.log('  • Purchase orders: 2 drafts, 1 ordered (Receive), 1 received');
  console.log('  • Sales orders: pending confirm, confirmed → complete, cancelled restore');
  console.log('  • Dashboard / Reports: revenue and top products in MMK');
  console.log('\nCounts:', {
    categories: categories.length,
    suppliers: suppliers.length,
    products: products.length,
    ...flowSummary,
  });

  await mongoose.disconnect();
};

seedMock().catch(async (err) => {
  console.error('Mock seed failed:', err);
  try {
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});