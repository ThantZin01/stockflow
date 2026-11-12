import { ApiError } from '../utils/ApiError.js';

/**
 * Validates `req.body`, `req.query`, and/or `req.params` against Zod schemas.
 *
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
export const validate = (schemas) => (req, _res, next) => {
  const targets = ['params', 'query', 'body'];

  for (const target of targets) {
    const schema = schemas[target];
    if (!schema) continue;

    const result = schema.safeParse(req[target] ?? {});
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
          return `${path}${issue.message}`;
        })
        .join(', ');

      return next(new ApiError(400, message || 'Validation error'));
    }

    if (target === 'query') {
      // Express 5 defines `req.query` as a getter on IncomingMessage; override on the instance.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      req[target] = result.data;
    }
  }

  return next();
};
