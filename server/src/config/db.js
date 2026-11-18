import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Some local ISPs/routers block SRV lookups required by mongodb+srv URIs.
// Only override DNS locally; cloud runtimes (Vercel/Render) use their own DNS.
if (!process.env.VERCEL && env.NODE_ENV === 'development') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

/**
 * Connects to MongoDB via Mongoose.
 *
 * Note (PostgreSQL vs MongoDB): Unlike Prisma/pg where you often instantiate a
 * pool explicitly and pass it around, Mongoose maintains an internal connection
 * pool singleton once `mongoose.connect()` resolves. Models imported anywhere
 * in the app automatically use this active connection.
 *
 * We explicitly pass `dbName` so that even if `MONGODB_URI` omits the path
 * segment after `.mongodb.net/`, Mongoose writes to `stockflow` instead of
 * MongoDB's default `test` database. Tests use a separate database so Jest
 * never reads or deletes the application data.
 */
const dbName = env.NODE_ENV === 'test' ? 'stockflow_test' : 'stockflow';

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        dbName,
        serverSelectionTimeoutMS: 8000,
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
