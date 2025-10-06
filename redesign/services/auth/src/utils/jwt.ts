import jwt, { SignOptions } from 'jsonwebtoken';
import { UserId } from '@tide/types';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  constructor(
    private secret: string,
    private accessTokenExpiresIn: string = '15m',
    private refreshTokenExpiresIn: string = '7d'
  ) {}

  generateAccessToken(userId: UserId, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'access',
    };

    const options: SignOptions = {
      expiresIn: this.accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'tide-auth',
      audience: 'tide-api',
    };

    return jwt.sign(payload, this.secret, options);
  }

  generateRefreshToken(userId: UserId, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'tide-auth',
      audience: 'tide-api',
    };

    return jwt.sign(payload, this.secret, options);
  }

  generateTokenPair(userId: UserId, email: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }

  verify(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.secret, {
        issuer: 'tide-auth',
        audience: 'tide-api',
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  decode(token: string): JWTPayload | null {
    try {
      const payload = jwt.decode(token) as JWTPayload;
      return payload;
    } catch {
      return null;
    }
  }
}
