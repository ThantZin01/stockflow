import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const categoryIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid category ID'),
});

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const categoryBodySchema = z.object({
  name: z
    .string({ error: 'Category name is required' })
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters'),
  description: z.string().trim().max(500).optional().default(''),
});

