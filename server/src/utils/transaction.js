import mongoose from 'mongoose';

/**
 * Runs `work` inside a MongoDB transaction.
 *
 * Callers that already own a session (order confirm, receive, cancel) pass it
 * through so stock and the order status commit or roll back together. Callers
 * without one get a session here, which keeps a quantity change and its
 * StockMovement from being saved independently.
 */
export const runInTransaction = async (session, work) => {
  if (session) {
    return work(session);
  }

  const owned = await mongoose.startSession();
  try {
    return await owned.withTransaction(() => work(owned));
  } finally {
    await owned.endSession();
  }
};
