import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '@tide/logger';
import { jwtConfig } from '@tide/config';
import { v4 as uuidv4 } from 'uuid';
import { MessageHandler } from './message-handler';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  connectionId: string;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  messageId?: string;
  timestamp?: string;
}

export class ConnectionManager {
  private connections: Map<string, AuthenticatedWebSocket> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of connectionIds
  private messageHandler: MessageHandler;
  private heartbeatInterval: NodeJS.Timeout;

  constructor(private wss: WebSocketServer) {
    this.messageHandler = new MessageHandler(this);

    // Start heartbeat to detect broken connections
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 30000); // Check every 30 seconds

    logger.info('ConnectionManager initialized');
  }

  handleConnection(ws: WebSocket, req: IncomingMessage) {
    const authWs = ws as AuthenticatedWebSocket;
    const connectionId = uuidv4();

    authWs.connectionId = connectionId;
    authWs.isAlive = true;

    // Extract token from query string or headers
    const token = this.extractToken(req);

    if (!token) {
      logger.warn({ connectionId }, 'Connection rejected: No token provided');
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Authentication required' },
        timestamp: new Date().toISOString()
      }));
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, jwtConfig.accessTokenSecret) as any;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      authWs.userId = decoded.userId;

      // Store connection
      this.connections.set(connectionId, authWs);

      // Track user connections
      if (!this.userConnections.has(decoded.userId)) {
        this.userConnections.set(decoded.userId, new Set());
      }
      this.userConnections.get(decoded.userId)!.add(connectionId);

      logger.info({
        connectionId,
        userId: decoded.userId,
        totalConnections: this.connections.size
      }, 'WebSocket authenticated');

      // Send connection success
      ws.send(JSON.stringify({
        type: 'connected',
        payload: {
          connectionId,
          userId: decoded.userId,
          message: 'Connected to Tide real-time service'
        },
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      logger.error({ error, connectionId }, 'Authentication failed');
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Authentication failed' },
        timestamp: new Date().toISOString()
      }));
      ws.close(1008, 'Authentication failed');
      return;
    }

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.messageHandler.handleMessage(authWs, message);
      } catch (error) {
        logger.error({ error, connectionId }, 'Failed to parse message');
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' },
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Handle pong for heartbeat
    ws.on('pong', () => {
      authWs.isAlive = true;
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
      this.handleDisconnection(authWs, code, reason.toString());
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error({ error, connectionId, userId: authWs.userId }, 'WebSocket error');
    });
  }

  private extractToken(req: IncomingMessage): string | null {
    // Try query parameter first
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const tokenFromQuery = url.searchParams.get('token');

    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private handleDisconnection(ws: AuthenticatedWebSocket, code: number, reason: string) {
    const { connectionId, userId } = ws;

    logger.info({ connectionId, userId, code, reason }, 'WebSocket disconnected');

    // Remove from connections
    this.connections.delete(connectionId);

    // Remove from user connections
    if (userId && this.userConnections.has(userId)) {
      const userConns = this.userConnections.get(userId)!;
      userConns.delete(connectionId);

      // Clean up if user has no more connections
      if (userConns.size === 0) {
        this.userConnections.delete(userId);
      }
    }

    logger.info({
      totalConnections: this.connections.size
    }, 'Connection cleaned up');
  }

  private checkHeartbeats() {
    this.connections.forEach((ws, connectionId) => {
      if (!ws.isAlive) {
        logger.warn({ connectionId, userId: ws.userId }, 'Terminating inactive connection');
        ws.terminate();
        return;
      }

      ws.isAlive = false;
      ws.ping();
    });
  }

  // Public methods for sending messages

  sendToUser(userId: string, message: WebSocketMessage) {
    const connections = this.userConnections.get(userId);

    if (!connections || connections.size === 0) {
      logger.debug({ userId }, 'No active connections for user');
      return false;
    }

    const messageStr = JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    let sent = 0;
    connections.forEach(connectionId => {
      const ws = this.connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
        sent++;
      }
    });

    logger.debug({ userId, sent, total: connections.size }, 'Message sent to user connections');
    return sent > 0;
  }

  sendToConnection(connectionId: string, message: WebSocketMessage) {
    const ws = this.connections.get(connectionId);

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.debug({ connectionId }, 'Connection not available');
      return false;
    }

    ws.send(JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    }));

    return true;
  }

  broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    let sent = 0;
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
        sent++;
      }
    });

    logger.info({ sent, total: this.connections.size }, 'Broadcast message sent');
  }

  getStats() {
    return {
      totalConnections: this.connections.size,
      totalUsers: this.userConnections.size,
      connections: Array.from(this.connections.values()).map(ws => ({
        connectionId: ws.connectionId,
        userId: ws.userId,
        isAlive: ws.isAlive
      }))
    };
  }

  destroy() {
    clearInterval(this.heartbeatInterval);
    this.connections.forEach(ws => ws.terminate());
    this.connections.clear();
    this.userConnections.clear();
  }
}
