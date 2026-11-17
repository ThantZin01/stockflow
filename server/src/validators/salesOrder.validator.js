import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const salesOrderIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid sales order ID'),
});

export const listSalesOrdersQuerySchema = z.object({
  status: z
    .union([z.literal(''), z.enum(['pending', 'confirmed', 'completed', 'cancelled'])])
    .optional()
    .default(''),
  search: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const salesOrderItemSchema = z.object({
  product: z.string({ error: 'Product is required' }).regex(objectIdRegex, 'Invalid product ID'),
  quantity: z.coerce
    .number({ error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
});

export const createSalesOrderSchema = z.object({
  customerName: z
    .string({ error: 'Customer name is required' })
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(120, 'Customer name must be at most 120 characters'),
  customerPhone: z
    .string()
    .trim()
    .max(40, 'Phone must be at most 40 characters')
    .optional()
    .default(''),
  items: z.array(salesOrderItemSchema).min(1, 'At least one line item is required'),
});
