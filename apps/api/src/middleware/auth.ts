import { FastifyRequest, FastifyReply } from 'fastify';

import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        error: {
          message: 'No authorization header',
          statusCode: 401,
        },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        error: {
          message: 'No token provided',
          statusCode: 401,
        },
      });
    }

    const payload = verifyToken(token);

    // Attach user to request
    request.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    request.log.warn({ err: error }, 'Authentication failed');

    return reply.status(401).send({
      error: {
        message: error instanceof Error ? error.message : 'Authentication failed',
        statusCode: 401,
      },
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuthenticate(request: FastifyRequest): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);

    request.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    // Silently fail - user will be undefined
  }
}
