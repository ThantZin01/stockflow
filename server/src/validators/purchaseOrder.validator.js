import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const purchaseOrderIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid purchase order ID'),
});

export const listPurchaseOrdersQuerySchema = z.object({
  status: z
    .union([z.literal(''), z.enum(['draft', 'ordered', 'received'])])
    .optional()
    .default(''),
  supplier: z
    .union([z.literal(''), z.string().regex(objectIdRegex, 'Invalid supplier filter')])
    .optional()
    .default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const purchaseOrderItemSchema = z.object({
  product: z.string({ error: 'Product is required' }).regex(objectIdRegex, 'Invalid product ID'),
  quantity: z.coerce
    .number({ error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  unitCost: z.coerce
    .number({ error: 'Unit cost is required' })
    .min(0, 'Unit cost cannot be negative'),
});

export const createPurchaseOrderSchema = z.object({
  supplier: z
    .string({ error: 'Supplier is required' })
    .regex(objectIdRegex, 'Valid supplier is required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one line item is required'),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema;
