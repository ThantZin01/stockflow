/**
 * Generates sequential yearly order numbers like `PO-2026-0001` or `SO-2026-0001`.
 *
 * The sequence is taken from the highest numeric suffix, not a string sort:
 * "PO-2026-9999" sorts after "PO-2026-10000" lexicographically, which would
 * keep handing out 10000. The unique index still rejects a lost race; callers
 * retry through `withOrderNumberRetry`.
 */
export const generateOrderNumber = async (Model, fieldName, prefix, session = null) => {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-\\d+$`);

  const pipeline = Model.aggregate([
    { $match: { [fieldName]: pattern } },
    {
      $project: {
        seq: {
          $convert: {
            input: { $arrayElemAt: [{ $split: [`$${fieldName}`, '-'] }, 2] },
            to: 'int',
            onError: 0,
            onNull: 0,
          },
        },
      },
    },
    { $sort: { seq: -1 } },
    { $limit: 1 },
  ]);

  if (session) {
    pipeline.session(session);
  }

  const [latest] = await pipeline;
  const nextSeq = (latest?.seq || 0) + 1;

  return `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
};

const ORDER_NUMBER_FIELDS = new Set(['orderNumber', 'poNumber']);

const isDuplicateOrderNumber = (error) =>
  error?.code === 11000 &&
  Object.keys(error.keyValue || {}).some((field) => ORDER_NUMBER_FIELDS.has(field));

/** Re-reads the sequence when a concurrent create took the same number. */
export const withOrderNumberRetry = async (create, attempts = 3) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await create();
    } catch (error) {
      if (!isDuplicateOrderNumber(error) || attempt === attempts) {
        throw error;
      }
    }
  }
};
