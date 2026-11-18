import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (value) => {
  if (!value) return true;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

const optionalDate = (label) =>
  z
    .union([z.literal(''), z.string().regex(dateRegex, `${label} must be YYYY-MM-DD`)])
    .optional()
    .default('')
    .refine(isRealDate, `${label} is not a real calendar date`);

export const lowStockQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const listMovementsQuerySchema = z
  .object({
    product: z
      .union([z.literal(''), z.string().regex(objectIdRegex, 'Invalid product filter')])
      .optional()
      .default(''),
    type: z
      .union([z.literal(''), z.enum(['IN', 'OUT', 'ADJUSTMENT'])])
      .optional()
      .default(''),
    from: optionalDate('from'),
    to: optionalDate('to'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: "'from' date must be before or equal to 'to' date",
    path: ['from'],
  });

export const adjustStockSchema = z.object({
  productId: z.string({ error: 'Product is required' }).regex(objectIdRegex, 'Invalid product ID'),
  quantityChange: z.coerce
    .number({ error: 'Quantity change is required' })
    .int('Quantity change must be a whole number')
    .refine((value) => value !== 0, 'Quantity change cannot be zero'),
  reason: z
    .string({ error: 'Reason is required' })
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(300, 'Reason must be at most 300 characters'),
});
