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
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        dbName: 'stockflow',
      })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host} (${conn.connection.name})`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        if (process.env.VERCEL) {
          throw error;
        }
        process.exit(1);
      });
  }

  return connectionPromise;
};
