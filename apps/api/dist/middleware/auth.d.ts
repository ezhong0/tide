import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Authentication middleware - verifies JWT token
 */
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Optional authentication - doesn't fail if no token
 */
export declare function optionalAuthenticate(request: FastifyRequest): Promise<void>;
//# sourceMappingURL=auth.d.ts.map