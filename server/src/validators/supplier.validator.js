import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const supplierIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid supplier ID'),
});

export const listSuppliersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export const supplierBodySchema = z.object({
  name: z
    .string({ error: 'Supplier name is required' })
    .trim()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(120, 'Supplier name must be at most 120 characters'),
  contactName: z.string().trim().max(120).optional().default(''),
  email: z
    .union([z.literal(''), z.string().trim().toLowerCase().email('Invalid email address')])
    .optional()
    .default(''),
  phone: z.string().trim().max(40).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
});

