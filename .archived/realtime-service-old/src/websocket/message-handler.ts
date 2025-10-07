import { WebSocket } from 'ws';
import { logger } from '@tide/logger';
import { ConnectionManager } from './connection-manager';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  connectionId: string;
  isAlive: boolean;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  messageId?: string;
  timestamp?: string;
}

export class MessageHandler {
  constructor(private connectionManager: ConnectionManager) {}

  handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    const { type, payload, messageId } = message;
    const { userId, connectionId } = ws;

    logger.info({
      type,
      userId,
      connectionId,
      messageId
    }, 'Handling WebSocket message');

    try {
      switch (type) {
        case 'ping':
          this.handlePing(ws, messageId);
          break;

        case 'message':
          this.handleChatMessage(ws, payload, messageId);
          break;

        case 'typing':
          this.handleTypingIndicator(ws, payload);
          break;

        case 'subscribe':
          this.handleSubscribe(ws, payload);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(ws, payload);
          break;

        default:
          logger.warn({ type, userId, connectionId }, 'Unknown message type');
          this.sendError(ws, 'Unknown message type', messageId);
      }
    } catch (error) {
      logger.error({ error, type, userId, connectionId }, 'Error handling message');
      this.sendError(ws, 'Failed to process message', messageId);
    }
  }

  private handlePing(ws: AuthenticatedWebSocket, messageId?: string) {
    this.sendMessage(ws, {
      type: 'pong',
      messageId,
      payload: {
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleChatMessage(ws: AuthenticatedWebSocket, payload: any, messageId?: string) {
    const { conversationId, content, recipientId } = payload;

    if (!conversationId || !content) {
      this.sendError(ws, 'Missing required fields', messageId);
      return;
    }

    // In a real implementation, this would:
    // 1. Save message to database
    // 2. Process with AI if needed
    // 3. Send to recipient(s)
    // 4. Return acknowledgment

    // For now, echo back with AI simulation
    const aiResponse = {
      type: 'message',
      payload: {
        conversationId,
        messageId: `msg_${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
    };

    // Send to user (echo)
    this.connectionManager.sendToUser(ws.userId!, aiResponse);

    // Send acknowledgment
    this.sendMessage(ws, {
      type: 'message_ack',
      messageId,
      payload: {
        messageId: aiResponse.payload.messageId,
        status: 'delivered'
      }
    });

    // Simulate AI response after 1 second
    setTimeout(() => {
      const aiReply = {
        type: 'message',
        payload: {
          conversationId,
          messageId: `msg_${Date.now()}`,
          content: `AI received: "${content}". Processing...`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          status: 'sent'
        }
      };

      this.connectionManager.sendToUser(ws.userId!, aiReply);
    }, 1000);
  }

  private handleTypingIndicator(ws: AuthenticatedWebSocket, payload: any) {
    const { conversationId, isTyping } = payload;

    // Broadcast typing indicator to other participants in conversation
    // In real implementation, would query conversation participants from DB
    logger.debug({
      userId: ws.userId,
      conversationId,
      isTyping
    }, 'Typing indicator');

    // For now, just acknowledge
    this.sendMessage(ws, {
      type: 'typing_ack',
      payload: { conversationId, isTyping }
    });
  }

  private handleSubscribe(ws: AuthenticatedWebSocket, payload: any) {
    const { channel } = payload;

    logger.info({
      userId: ws.userId,
      channel
    }, 'User subscribed to channel');

    this.sendMessage(ws, {
      type: 'subscribed',
      payload: { channel }
    });
  }

  private handleUnsubscribe(ws: AuthenticatedWebSocket, payload: any) {
    const { channel } = payload;

    logger.info({
      userId: ws.userId,
      channel
    }, 'User unsubscribed from channel');

    this.sendMessage(ws, {
      type: 'unsubscribed',
      payload: { channel }
    });
  }

  private sendMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      }));
    }
  }

  private sendError(ws: AuthenticatedWebSocket, error: string, messageId?: string) {
    this.sendMessage(ws, {
      type: 'error',
      messageId,
      payload: { error }
    });
  }
}
