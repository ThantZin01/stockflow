import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const productIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid product ID'),
});

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  category: z
    .union([z.literal(''), z.string().regex(objectIdRegex, 'Invalid category filter')])
    .optional()
    .default(''),
  lowStock: z
    .union([z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .default(''),
  includeArchived: z
    .union([z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .default('false'),
  sort: z
    .enum(['newest', 'name_asc', 'name_desc', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
});

export const createProductSchema = z.object({
  sku: z
    .string({ error: 'SKU is required' })
    .trim()
    .toUpperCase()
    .min(2, 'SKU must be at least 2 characters')
    .max(40, 'SKU must be at most 40 characters'),
  name: z
    .string({ error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(150, 'Product name must be at most 150 characters'),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.string().regex(objectIdRegex, 'Valid category is required'),
  supplier: z.string().regex(objectIdRegex, 'Valid supplier is required'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  salePrice: z.coerce.number().min(0, 'Sale price cannot be negative'),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level cannot be negative').default(5),
  initialQuantity: z.coerce
    .number()
    .int()
    .min(0, 'Initial quantity cannot be negative')
    .optional()
    .default(0),
});

export const updateProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'SKU must be at least 2 characters')
    .max(40, 'SKU must be at most 40 characters'),
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(150, 'Product name must be at most 150 characters'),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.string().regex(objectIdRegex, 'Valid category is required'),
  supplier: z.string().regex(objectIdRegex, 'Valid supplier is required'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  salePrice: z.coerce.number().min(0, 'Sale price cannot be negative'),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level cannot be negative'),
});

export const archiveProductSchema = z.object({
  isArchived: z.boolean().optional(),
});

