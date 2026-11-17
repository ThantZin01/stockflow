/**
 * Generates sequential yearly order numbers like `PO-2026-0001` or `SO-2026-0001`.
 *
 * Queries the latest matching document for the current year and increments its
 * trailing sequence number. Unique index on the model still guards against races.
 */
export const generateOrderNumber = async (Model, fieldName, prefix) => {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-\\d+$`);

  const latest = await Model.findOne({ [fieldName]: pattern })
    .sort({ [fieldName]: -1 })
    .select(fieldName)
    .lean();

  let nextSeq = 1;
  if (latest?.[fieldName]) {
    const parts = latest[fieldName].split('-');
    const lastNum = Number.parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  return `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
};
