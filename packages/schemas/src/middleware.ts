/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/explicit-function-return-type */
/**
 * Express/Fastify middleware for request validation
 * Ensures all API inputs are validated at the boundary
 */

import { z } from 'zod';

// Generic validation middleware for Express
export function validateRequest<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: 'Validation error',
          details: result.error.format(),
          issues: result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      // Replace body with parsed and validated data
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Validate query parameters
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          error: 'Query validation error',
          details: result.error.format()
        });
      }

      req.query = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
}

// Validate route parameters
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        return res.status(400).json({
          error: 'Parameter validation error',
          details: result.error.format()
        });
      }

      req.params = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
}

// Validate response before sending
export function validateResponse<T extends z.ZodType>(schema: T) {
  return (data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error('Response validation failed:', result.error);
      throw new Error('Response validation failed');
    }

    return result.data;
  };
}

// Combined validation for complete request
export interface RequestValidation {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

export function validateFullRequest(validation: RequestValidation) {
  return (req: any, res: any, next: any) => {
    try {
      // Validate body if schema provided
      if (validation.body) {
        const bodyResult = validation.body.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            error: 'Body validation error',
            details: bodyResult.error.format()
          });
        }
        req.body = bodyResult.data;
      }

      // Validate query if schema provided
      if (validation.query) {
        const queryResult = validation.query.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({
            error: 'Query validation error',
            details: queryResult.error.format()
          });
        }
        req.query = queryResult.data;
      }

      // Validate params if schema provided
      if (validation.params) {
        const paramsResult = validation.params.safeParse(req.params);
        if (!paramsResult.success) {
          return res.status(400).json({
            error: 'Parameter validation error',
            details: paramsResult.error.format()
          });
        }
        req.params = paramsResult.data;
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Helper to create typed route handlers
export function createTypedHandler<
  TBody extends z.ZodType,
  TQuery extends z.ZodType,
  TParams extends z.ZodType,
  TResponse extends z.ZodType
>(config: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  response?: TResponse;
  handler: (req: {
    body: z.infer<TBody>;
    query: z.infer<TQuery>;
    params: z.infer<TParams>;
    user?: any;
  }) => Promise<z.infer<TResponse>>;
}) {
  return [
    validateFullRequest({
      body: config.body,
      query: config.query,
      params: config.params
    }),
    async (req: any, res: any) => {
      try {
        const result = await config.handler(req);

        // Validate response if schema provided
        if (config.response) {
          const validatedResponse = validateResponse(config.response)(result);
          return res.json(validatedResponse);
        }

        return res.json(result);
      } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  ];
}