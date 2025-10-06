/**
 * Express/Fastify middleware for request validation
 * Ensures all API inputs are validated at the boundary
 */
import { z } from 'zod';
export declare function validateRequest<T extends z.ZodType>(schema: T): (req: any, res: any, next: any) => any;
export declare function validateQuery<T extends z.ZodType>(schema: T): (req: any, res: any, next: any) => any;
export declare function validateParams<T extends z.ZodType>(schema: T): (req: any, res: any, next: any) => any;
export declare function validateResponse<T extends z.ZodType>(schema: T): (data: unknown) => any;
export interface RequestValidation {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
}
export declare function validateFullRequest(validation: RequestValidation): (req: any, res: any, next: any) => Promise<any>;
export declare function createTypedHandler<TBody extends z.ZodType, TQuery extends z.ZodType, TParams extends z.ZodType, TResponse extends z.ZodType>(config: {
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
}): ((req: any, res: any, next: any) => Promise<any>)[];
//# sourceMappingURL=middleware.d.ts.map