import { z } from 'zod';

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

export const salesReportQuerySchema = z
  .object({
    from: optionalDate('from'),
    to: optionalDate('to'),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: "'from' date must be before or equal to 'to' date",
    path: ['from'],
  });

export const topProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
