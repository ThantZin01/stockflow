import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const userIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid user ID'),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'staff'], {
    error: "Role must be either 'admin' or 'staff'",
  }),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({
    error: 'isActive must be a boolean',
  }),
});
