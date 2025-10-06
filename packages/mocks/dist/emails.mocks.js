/**
 * Mock email data for testing and development
 */
import { createEmailId, createThreadId } from '@tide/shared-types';
import { mockUser1 } from './users.mocks.js';
// ============================================================================
// Mock Attachments
// ============================================================================
export const mockAttachment1 = {
    id: 'att_001',
    filename: 'proposal.pdf',
    mimeType: 'application/pdf',
    size: 245678,
    url: 'https://storage.example.com/attachments/proposal.pdf',
};
export const mockAttachment2 = {
    id: 'att_002',
    filename: 'screenshot.png',
    mimeType: 'image/png',
    size: 98765,
    url: 'https://storage.example.com/attachments/screenshot.png',
};
// ============================================================================
// Mock Emails
// ============================================================================
export const mockEmail1 = {
    id: createEmailId('770e8400-e29b-41d4-a716-446655440001'),
    userId: mockUser1.id,
    externalId: 'msg_ext_001',
    threadId: createThreadId('thread_001'),
    direction: 'received',
    from: 'client@acmecorp.com',
    to: ['john.doe@example.com'],
    cc: ['team@example.com'],
    subject: 'Q1 Project Proposal',
    body: 'Hi John,\n\nI wanted to discuss the Q1 project proposal. Can we schedule a meeting?\n\nBest,\nJohn',
    snippet: 'I wanted to discuss the Q1 project proposal. Can we schedule a meeting?',
    attachments: [mockAttachment1],
    labels: ['important', 'project'],
    isRead: false,
    isStarred: true,
    isImportant: true,
    indexed: true,
    embeddingId: 'emb_001',
    priority: 'high',
    category: 'business',
    archived: false,
    date: new Date('2024-01-20T09:30:00Z'),
    createdAt: new Date('2024-01-20T09:30:05Z'),
    updatedAt: new Date('2024-01-20T09:30:05Z'),
};
export const mockEmail2 = {
    id: createEmailId('770e8400-e29b-41d4-a716-446655440002'),
    userId: mockUser1.id,
    externalId: 'msg_ext_002',
    threadId: createThreadId('thread_001'),
    direction: 'sent',
    from: 'john.doe@example.com',
    to: ['client@acmecorp.com'],
    cc: ['team@example.com'],
    subject: 'Re: Q1 Project Proposal',
    body: 'Hi,\n\nAbsolutely! How about Tuesday at 2pm?\n\nBest,\nJohn',
    snippet: 'Absolutely! How about Tuesday at 2pm?',
    labels: ['sent', 'project'],
    isRead: true,
    isStarred: false,
    isImportant: false,
    indexed: true,
    embeddingId: 'emb_002',
    category: 'business',
    archived: false,
    date: new Date('2024-01-20T10:15:00Z'),
    createdAt: new Date('2024-01-20T10:15:03Z'),
    updatedAt: new Date('2024-01-20T10:15:03Z'),
};
export const mockEmail3 = {
    id: createEmailId('770e8400-e29b-41d4-a716-446655440003'),
    userId: mockUser1.id,
    externalId: 'msg_ext_003',
    threadId: createThreadId('thread_002'),
    direction: 'received',
    from: 'newsletter@techblog.com',
    to: ['john.doe@example.com'],
    subject: 'Weekly Tech Roundup - January 2024',
    snippet: 'Your weekly dose of tech news and insights...',
    labels: ['newsletters'],
    isRead: false,
    isStarred: false,
    isImportant: false,
    indexed: false,
    category: 'newsletter',
    archived: false,
    date: new Date('2024-01-19T08:00:00Z'),
    createdAt: new Date('2024-01-19T08:00:12Z'),
    updatedAt: new Date('2024-01-19T08:00:12Z'),
};
export const mockEmails = [mockEmail1, mockEmail2, mockEmail3];
//# sourceMappingURL=emails.mocks.js.map