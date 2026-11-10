import dns from 'node:dns';

// Some ISPs/routers block SRV lookups required by mongodb+srv URIs.
// Use public DNS servers for this process only.
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connects to MongoDB via Mongoose.
 *
 * Note (PostgreSQL vs MongoDB): Unlike Prisma/pg where you often instantiate a
 * pool explicitly and pass it around, Mongoose maintains an internal connection
 * pool singleton once `mongoose.connect()` resolves. Models imported anywhere
 * in the app automatically use this active connection.
 *
 * We explicitly pass `dbName: 'stockflow'` so that even if `MONGODB_URI` omits
 * the path segment after `.mongodb.net/`, Mongoose writes to `stockflow`
 * instead of MongoDB's default `test` database.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'stockflow',
    });
    console.log(`MongoDB connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
