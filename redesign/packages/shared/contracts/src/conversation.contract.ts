import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  ConversationSchema,
  MessageSchema,
  PaginationSchema,
  ErrorResponseSchema,
} from '@tide/types';

const c = initContract();

export const conversationContract = c.router({
  // Create a new conversation
  createConversation: {
    method: 'POST',
    path: '/conversations',
    body: z.object({
      title: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    }),
    responses: {
      201: ConversationSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Create a new conversation',
  },

  // Get all conversations for a user
  getConversations: {
    method: 'GET',
    path: '/conversations',
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
      search: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(ConversationSchema),
        pagination: PaginationSchema,
      }),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get all conversations',
  },

  // Get a specific conversation
  getConversation: {
    method: 'GET',
    path: '/conversations/:conversationId',
    pathParams: z.object({
      conversationId: z.string().uuid(),
    }),
    responses: {
      200: ConversationSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get a specific conversation',
  },

  // Update a conversation
  updateConversation: {
    method: 'PATCH',
    path: '/conversations/:conversationId',
    pathParams: z.object({
      conversationId: z.string().uuid(),
    }),
    body: z.object({
      title: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    }),
    responses: {
      200: ConversationSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Update a conversation',
  },

  // Delete a conversation
  deleteConversation: {
    method: 'DELETE',
    path: '/conversations/:conversationId',
    pathParams: z.object({
      conversationId: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      204: z.object({}),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Delete a conversation',
  },

  // Send a message
  sendMessage: {
    method: 'POST',
    path: '/conversations/:conversationId/messages',
    pathParams: z.object({
      conversationId: z.string().uuid(),
    }),
    body: z.object({
      content: z.string(),
      metadata: z.record(z.unknown()).optional(),
    }),
    responses: {
      201: MessageSchema,
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Send a message in a conversation',
  },

  // Get messages in a conversation
  getMessages: {
    method: 'GET',
    path: '/conversations/:conversationId/messages',
    pathParams: z.object({
      conversationId: z.string().uuid(),
    }),
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
      beforeId: z.string().optional(),
      afterId: z.string().optional(),
    }),
    responses: {
      200: z.object({
        data: z.array(MessageSchema),
        pagination: PaginationSchema,
      }),
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get messages in a conversation',
  },

  // Get a specific message
  getMessage: {
    method: 'GET',
    path: '/conversations/:conversationId/messages/:messageId',
    pathParams: z.object({
      conversationId: z.string().uuid(),
      messageId: z.string().uuid(),
    }),
    responses: {
      200: MessageSchema,
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
    summary: 'Get a specific message',
  },
});
