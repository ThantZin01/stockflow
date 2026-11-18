import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { clearFlowData, seedCatalog, seedOrderFlows } from './seedFlow.js';

/** Full reset: demo users + catalog + orders (destructive). */
const seed = async () => {
  if (env.NODE_ENV === 'production') {
    console.error(
      'Refusing to seed while NODE_ENV=production. This script deletes every collection.'
    );
    process.exit(1);
  }

  await connectDB();

  console.log(`Seeding database "${mongoose.connection.name}" on ${mongoose.connection.host}`);
  console.log('Clearing existing collections (including users)...');
  await clearFlowData();
  await User.deleteMany({});

  const [adminHash, staffHash] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('Staff123!', 10),
  ]);

  const [admin, staff] = await User.create([
    {
      name: 'Alex Morgan (Admin)',
      email: 'admin@stockflow.dev',
      passwordHash: adminHash,
      role: 'admin',
    },
    {
      name: 'Jordan Lee (Staff)',
      email: 'staff@stockflow.dev',
      passwordHash: staffHash,
      role: 'staff',
    },
  ]);

  const { categories, suppliers, products } = await seedCatalog(admin._id);
  await seedOrderFlows({ suppliers, products, actorId: admin._id, staffId: staff._id });

  console.log('Seed complete:');
  console.log('  Admin: admin@stockflow.dev / Admin123!');
  console.log('  Staff: staff@stockflow.dev / Staff123!');
  console.log(
    `  Categories: ${categories.length}, Suppliers: ${suppliers.length}, Products: ${products.length}`
  );
  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});