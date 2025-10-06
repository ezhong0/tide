/**
 * API Contracts
 *
 * This package exports all API contract definitions, including
 * Zod schemas and TypeScript types for all API endpoints.
 */
export * from './auth.contracts.js';
export * from './email.contracts.js';
export * from './calendar.contracts.js';
export * from './commands.contracts.js';
export * from './context.contracts.js';
export declare const ApiContracts: {
    readonly auth: {
        readonly getCurrentUser: {
            readonly method: "GET";
            readonly path: "/auth/me";
            readonly request: import("zod").ZodObject<{}, "strip", import("zod").ZodTypeAny, {}, {}>;
            readonly response: import("zod").ZodObject<{
                id: import("zod").ZodString;
                email: import("zod").ZodString;
                name: import("zod").ZodString;
                emailProvider: import("zod").ZodEnum<["gmail", "outlook"]>;
                calendarProvider: import("zod").ZodEnum<["google", "outlook"]>;
                timezone: import("zod").ZodString;
                createdAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
                createdAt: string;
            }, {
                id: string;
                email: string;
                name: string;
                emailProvider: "gmail" | "outlook";
                calendarProvider: "outlook" | "google";
                timezone: string;
                createdAt: string;
            }>;
        };
        readonly logout: {
            readonly method: "POST";
            readonly path: "/auth/logout";
            readonly request: import("zod").ZodObject<{}, "strip", import("zod").ZodTypeAny, {}, {}>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                success: boolean;
            }, {
                message: string;
                success: boolean;
            }>;
        };
        readonly refreshToken: {
            readonly method: "POST";
            readonly path: "/auth/refresh";
            readonly request: import("zod").ZodObject<{
                refreshToken: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                refreshToken: string;
            }, {
                refreshToken: string;
            }>;
            readonly response: import("zod").ZodObject<{
                accessToken: import("zod").ZodString;
                refreshToken: import("zod").ZodString;
                expiresIn: import("zod").ZodNumber;
                tokenType: import("zod").ZodDefault<import("zod").ZodLiteral<"Bearer">>;
            }, "strip", import("zod").ZodTypeAny, {
                refreshToken: string;
                accessToken: string;
                expiresIn: number;
                tokenType: "Bearer";
            }, {
                refreshToken: string;
                accessToken: string;
                expiresIn: number;
                tokenType?: "Bearer" | undefined;
            }>;
        };
        readonly revokeToken: {
            readonly method: "POST";
            readonly path: "/auth/revoke";
            readonly request: import("zod").ZodObject<{
                refreshToken: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                refreshToken: string;
            }, {
                refreshToken: string;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                success: boolean;
            }, {
                message: string;
                success: boolean;
            }>;
        };
    };
    readonly email: {
        readonly sendEmail: {
            readonly method: "POST";
            readonly path: "/api/email/send";
            readonly request: import("zod").ZodObject<{
                to: import("zod").ZodArray<import("zod").ZodString, "many">;
                cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                bcc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                subject: import("zod").ZodString;
                body: import("zod").ZodString;
                replyToThreadId: import("zod").ZodOptional<import("zod").ZodString>;
                attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    filename: import("zod").ZodString;
                    mimeType: import("zod").ZodString;
                    size: import("zod").ZodNumber;
                    content: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    filename: string;
                    mimeType: string;
                    size: number;
                    content: string;
                }, {
                    filename: string;
                    mimeType: string;
                    size: number;
                    content: string;
                }>, "many">>;
            }, "strip", import("zod").ZodTypeAny, {
                to: string[];
                subject: string;
                body: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
                bcc?: string[] | undefined;
                attachments?: {
                    filename: string;
                    mimeType: string;
                    size: number;
                    content: string;
                }[] | undefined;
            }, {
                to: string[];
                subject: string;
                body: string;
                cc?: string[] | undefined;
                replyToThreadId?: string | undefined;
                bcc?: string[] | undefined;
                attachments?: {
                    filename: string;
                    mimeType: string;
                    size: number;
                    content: string;
                }[] | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                messageId: import("zod").ZodString;
                threadId: import("zod").ZodString;
                sentAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                threadId: string;
                messageId: string;
                sentAt: string;
            }, {
                success: boolean;
                threadId: string;
                messageId: string;
                sentAt: string;
            }>;
        };
        readonly searchEmails: {
            readonly method: "GET";
            readonly path: "/api/email/search";
            readonly request: import("zod").ZodObject<{
                query: import("zod").ZodOptional<import("zod").ZodString>;
                from: import("zod").ZodOptional<import("zod").ZodString>;
                to: import("zod").ZodOptional<import("zod").ZodString>;
                subject: import("zod").ZodOptional<import("zod").ZodString>;
                dateAfter: import("zod").ZodOptional<import("zod").ZodString>;
                dateBefore: import("zod").ZodOptional<import("zod").ZodString>;
                hasAttachment: import("zod").ZodOptional<import("zod").ZodBoolean>;
                isUnread: import("zod").ZodOptional<import("zod").ZodBoolean>;
                isStarred: import("zod").ZodOptional<import("zod").ZodBoolean>;
                labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                page: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                to?: string | undefined;
                subject?: string | undefined;
                query?: string | undefined;
                dateAfter?: string | undefined;
                dateBefore?: string | undefined;
                from?: string | undefined;
                labels?: string[] | undefined;
                hasAttachment?: boolean | undefined;
                isUnread?: boolean | undefined;
                isStarred?: boolean | undefined;
            }, {
                limit?: number | undefined;
                page?: number | undefined;
                to?: string | undefined;
                subject?: string | undefined;
                query?: string | undefined;
                dateAfter?: string | undefined;
                dateBefore?: string | undefined;
                from?: string | undefined;
                labels?: string[] | undefined;
                hasAttachment?: boolean | undefined;
                isUnread?: boolean | undefined;
                isStarred?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                emails: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    threadId: import("zod").ZodString;
                    direction: import("zod").ZodEnum<["sent", "received"]>;
                    from: import("zod").ZodString;
                    to: import("zod").ZodArray<import("zod").ZodString, "many">;
                    cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    subject: import("zod").ZodString;
                    snippet: import("zod").ZodString;
                    body: import("zod").ZodOptional<import("zod").ZodString>;
                    attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        filename: import("zod").ZodString;
                        mimeType: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        url: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }>, "many">>;
                    labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    isRead: import("zod").ZodBoolean;
                    isStarred: import("zod").ZodBoolean;
                    isImportant: import("zod").ZodBoolean;
                    date: import("zod").ZodString;
                    createdAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }>, "many">;
                total: import("zod").ZodNumber;
                page: import("zod").ZodNumber;
                limit: import("zod").ZodNumber;
                hasMore: import("zod").ZodBoolean;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                total: number;
                hasMore: boolean;
                emails: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }[];
            }, {
                limit: number;
                page: number;
                total: number;
                hasMore: boolean;
                emails: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }[];
            }>;
        };
        readonly getEmail: {
            readonly method: "GET";
            readonly path: "/api/email/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            readonly response: import("zod").ZodObject<{
                id: import("zod").ZodString;
                externalId: import("zod").ZodString;
                threadId: import("zod").ZodString;
                direction: import("zod").ZodEnum<["sent", "received"]>;
                from: import("zod").ZodString;
                to: import("zod").ZodArray<import("zod").ZodString, "many">;
                cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                subject: import("zod").ZodString;
                snippet: import("zod").ZodString;
                body: import("zod").ZodOptional<import("zod").ZodString>;
                attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    filename: import("zod").ZodString;
                    mimeType: import("zod").ZodString;
                    size: import("zod").ZodNumber;
                    url: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }, {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }>, "many">>;
                labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                isRead: import("zod").ZodBoolean;
                isStarred: import("zod").ZodBoolean;
                isImportant: import("zod").ZodBoolean;
                date: import("zod").ZodString;
                createdAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }, {
                id: string;
                date: string;
                createdAt: string;
                externalId: string;
                to: string[];
                subject: string;
                snippet: string;
                from: string;
                isStarred: boolean;
                threadId: string;
                isRead: boolean;
                direction: "received" | "sent";
                isImportant: boolean;
                cc?: string[] | undefined;
                body?: string | undefined;
                labels?: string[] | undefined;
                attachments?: {
                    id: string;
                    filename: string;
                    mimeType: string;
                    size: number;
                    url?: string | undefined;
                }[] | undefined;
            }>;
        };
        readonly getThread: {
            readonly method: "GET";
            readonly path: "/api/email/threads/:threadId";
            readonly request: import("zod").ZodObject<{
                threadId: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                threadId: string;
            }, {
                threadId: string;
            }>;
            readonly response: import("zod").ZodObject<{
                threadId: import("zod").ZodString;
                subject: import("zod").ZodString;
                participants: import("zod").ZodArray<import("zod").ZodString, "many">;
                messageCount: import("zod").ZodNumber;
                emails: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    threadId: import("zod").ZodString;
                    direction: import("zod").ZodEnum<["sent", "received"]>;
                    from: import("zod").ZodString;
                    to: import("zod").ZodArray<import("zod").ZodString, "many">;
                    cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    subject: import("zod").ZodString;
                    snippet: import("zod").ZodString;
                    body: import("zod").ZodOptional<import("zod").ZodString>;
                    attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        filename: import("zod").ZodString;
                        mimeType: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        url: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }>, "many">>;
                    labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    isRead: import("zod").ZodBoolean;
                    isStarred: import("zod").ZodBoolean;
                    isImportant: import("zod").ZodBoolean;
                    date: import("zod").ZodString;
                    createdAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }>, "many">;
                latestDate: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                participants: string[];
                subject: string;
                threadId: string;
                emails: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }[];
                messageCount: number;
                latestDate: string;
            }, {
                participants: string[];
                subject: string;
                threadId: string;
                emails: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }[];
                messageCount: number;
                latestDate: string;
            }>;
        };
        readonly updateEmail: {
            readonly method: "PUT";
            readonly path: "/api/email/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
                isRead: import("zod").ZodOptional<import("zod").ZodBoolean>;
                isStarred: import("zod").ZodOptional<import("zod").ZodBoolean>;
                labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                labels?: string[] | undefined;
                isStarred?: boolean | undefined;
                isRead?: boolean | undefined;
            }, {
                id: string;
                labels?: string[] | undefined;
                isStarred?: boolean | undefined;
                isRead?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                email: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    threadId: import("zod").ZodString;
                    direction: import("zod").ZodEnum<["sent", "received"]>;
                    from: import("zod").ZodString;
                    to: import("zod").ZodArray<import("zod").ZodString, "many">;
                    cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    subject: import("zod").ZodString;
                    snippet: import("zod").ZodString;
                    body: import("zod").ZodOptional<import("zod").ZodString>;
                    attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        filename: import("zod").ZodString;
                        mimeType: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        url: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }, {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }>, "many">>;
                    labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    isRead: import("zod").ZodBoolean;
                    isStarred: import("zod").ZodBoolean;
                    isImportant: import("zod").ZodBoolean;
                    date: import("zod").ZodString;
                    createdAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }, {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                email: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                };
                success: boolean;
            }, {
                email: {
                    id: string;
                    date: string;
                    createdAt: string;
                    externalId: string;
                    to: string[];
                    subject: string;
                    snippet: string;
                    from: string;
                    isStarred: boolean;
                    threadId: string;
                    isRead: boolean;
                    direction: "received" | "sent";
                    isImportant: boolean;
                    cc?: string[] | undefined;
                    body?: string | undefined;
                    labels?: string[] | undefined;
                    attachments?: {
                        id: string;
                        filename: string;
                        mimeType: string;
                        size: number;
                        url?: string | undefined;
                    }[] | undefined;
                };
                success: boolean;
            }>;
        };
        readonly archiveEmail: {
            readonly method: "POST";
            readonly path: "/api/email/:id/archive";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                archivedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                archivedAt: string;
            }, {
                success: boolean;
                archivedAt: string;
            }>;
        };
        readonly syncEmails: {
            readonly method: "POST";
            readonly path: "/api/email/sync";
            readonly request: import("zod").ZodObject<{
                provider: import("zod").ZodEnum<["gmail", "outlook"]>;
                fullSync: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, "strip", import("zod").ZodTypeAny, {
                provider: "gmail" | "outlook";
                fullSync: boolean;
            }, {
                provider: "gmail" | "outlook";
                fullSync?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                newEmails: import("zod").ZodNumber;
                updatedEmails: import("zod").ZodNumber;
                syncedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                newEmails: number;
                updatedEmails: number;
                syncedAt: string;
            }, {
                success: boolean;
                newEmails: number;
                updatedEmails: number;
                syncedAt: string;
            }>;
        };
    };
    readonly calendar: {
        readonly createEvent: {
            readonly method: "POST";
            readonly path: "/api/calendar/events";
            readonly request: import("zod").ZodObject<{
                title: import("zod").ZodString;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                start: import("zod").ZodString;
                end: import("zod").ZodString;
                isAllDay: import("zod").ZodDefault<import("zod").ZodBoolean>;
                location: import("zod").ZodOptional<import("zod").ZodString>;
                attendees: import("zod").ZodArray<import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    responseStatus: import("zod").ZodOptional<import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    name?: string | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }, {
                    email: string;
                    name?: string | undefined;
                    optional?: boolean | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }>, "many">;
                conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                    type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                    url: import("zod").ZodString;
                    id: import("zod").ZodOptional<import("zod").ZodString>;
                    pin: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }>>;
                sendNotifications: import("zod").ZodDefault<import("zod").ZodBoolean>;
                recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                    rule: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    rule: string;
                }, {
                    rule: string;
                }>>;
            }, "strip", import("zod").ZodTypeAny, {
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    name?: string | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }[];
                sendNotifications: boolean;
                description?: string | undefined;
                location?: string | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
                recurrence?: {
                    rule: string;
                } | undefined;
            }, {
                title: string;
                start: string;
                end: string;
                attendees: {
                    email: string;
                    name?: string | undefined;
                    optional?: boolean | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }[];
                description?: string | undefined;
                isAllDay?: boolean | undefined;
                location?: string | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
                sendNotifications?: boolean | undefined;
                recurrence?: {
                    rule: string;
                } | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                eventId: import("zod").ZodString;
                externalId: import("zod").ZodString;
                event: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    title: import("zod").ZodString;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    location: import("zod").ZodOptional<import("zod").ZodString>;
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    isAllDay: import("zod").ZodBoolean;
                    timezone: import("zod").ZodString;
                    attendees: import("zod").ZodArray<import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    } & {
                        responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }, {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }>, "many">;
                    organizer: import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        self: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }>;
                    status: import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>;
                    responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    meetingUrl: import("zod").ZodOptional<import("zod").ZodString>;
                    conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                        type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                        url: import("zod").ZodString;
                        id: import("zod").ZodOptional<import("zod").ZodString>;
                        pin: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }>>;
                    recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                        rule: import("zod").ZodString;
                        exceptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    }, "strip", import("zod").ZodTypeAny, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }>>;
                    aiSuggestions: import("zod").ZodOptional<import("zod").ZodObject<{
                        suggestedPrep: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        relatedEmails: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        suggestedActionItems: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        meetingSummary: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }>>;
                    createdAt: import("zod").ZodString;
                    updatedAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                externalId: string;
                eventId: string;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }, {
                success: boolean;
                externalId: string;
                eventId: string;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }>;
        };
        readonly updateEvent: {
            readonly method: "PUT";
            readonly path: "/api/calendar/events/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
                title: import("zod").ZodOptional<import("zod").ZodString>;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                start: import("zod").ZodOptional<import("zod").ZodString>;
                end: import("zod").ZodOptional<import("zod").ZodString>;
                isAllDay: import("zod").ZodOptional<import("zod").ZodBoolean>;
                location: import("zod").ZodOptional<import("zod").ZodString>;
                attendees: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    responseStatus: import("zod").ZodOptional<import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    name?: string | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }, {
                    email: string;
                    name?: string | undefined;
                    optional?: boolean | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }>, "many">>;
                conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                    type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                    url: import("zod").ZodString;
                    id: import("zod").ZodOptional<import("zod").ZodString>;
                    pin: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }>>;
                status: import("zod").ZodOptional<import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>>;
                sendNotifications: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                sendNotifications: boolean;
                status?: "tentative" | "confirmed" | "cancelled" | undefined;
                title?: string | undefined;
                description?: string | undefined;
                start?: string | undefined;
                end?: string | undefined;
                isAllDay?: boolean | undefined;
                location?: string | undefined;
                attendees?: {
                    email: string;
                    optional: boolean;
                    name?: string | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }[] | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
            }, {
                id: string;
                status?: "tentative" | "confirmed" | "cancelled" | undefined;
                title?: string | undefined;
                description?: string | undefined;
                start?: string | undefined;
                end?: string | undefined;
                isAllDay?: boolean | undefined;
                location?: string | undefined;
                attendees?: {
                    email: string;
                    name?: string | undefined;
                    optional?: boolean | undefined;
                    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction" | undefined;
                }[] | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
                sendNotifications?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                event: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    title: import("zod").ZodString;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    location: import("zod").ZodOptional<import("zod").ZodString>;
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    isAllDay: import("zod").ZodBoolean;
                    timezone: import("zod").ZodString;
                    attendees: import("zod").ZodArray<import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    } & {
                        responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }, {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }>, "many">;
                    organizer: import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        self: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }>;
                    status: import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>;
                    responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    meetingUrl: import("zod").ZodOptional<import("zod").ZodString>;
                    conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                        type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                        url: import("zod").ZodString;
                        id: import("zod").ZodOptional<import("zod").ZodString>;
                        pin: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }>>;
                    recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                        rule: import("zod").ZodString;
                        exceptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    }, "strip", import("zod").ZodTypeAny, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }>>;
                    aiSuggestions: import("zod").ZodOptional<import("zod").ZodObject<{
                        suggestedPrep: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        relatedEmails: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        suggestedActionItems: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        meetingSummary: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }>>;
                    createdAt: import("zod").ZodString;
                    updatedAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }, {
                success: boolean;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }>;
        };
        readonly deleteEvent: {
            readonly method: "DELETE";
            readonly path: "/api/calendar/events/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
                sendNotifications: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                sendNotifications: boolean;
            }, {
                id: string;
                sendNotifications?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                deletedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                deletedAt: string;
            }, {
                success: boolean;
                deletedAt: string;
            }>;
        };
        readonly getEvent: {
            readonly method: "GET";
            readonly path: "/api/calendar/events/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            readonly response: import("zod").ZodObject<{
                id: import("zod").ZodString;
                externalId: import("zod").ZodString;
                title: import("zod").ZodString;
                description: import("zod").ZodOptional<import("zod").ZodString>;
                location: import("zod").ZodOptional<import("zod").ZodString>;
                start: import("zod").ZodString;
                end: import("zod").ZodString;
                isAllDay: import("zod").ZodBoolean;
                timezone: import("zod").ZodString;
                attendees: import("zod").ZodArray<import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                } & {
                    responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }, {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }>, "many">;
                organizer: import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    self: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }, {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                }>;
                status: import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>;
                responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                meetingUrl: import("zod").ZodOptional<import("zod").ZodString>;
                conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                    type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                    url: import("zod").ZodString;
                    id: import("zod").ZodOptional<import("zod").ZodString>;
                    pin: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }, {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                }>>;
                recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                    rule: import("zod").ZodString;
                    exceptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                }, "strip", import("zod").ZodTypeAny, {
                    rule: string;
                    exceptions?: string[] | undefined;
                }, {
                    rule: string;
                    exceptions?: string[] | undefined;
                }>>;
                aiSuggestions: import("zod").ZodOptional<import("zod").ZodObject<{
                    suggestedPrep: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    relatedEmails: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    suggestedActionItems: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    meetingSummary: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }, {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                }>>;
                createdAt: import("zod").ZodString;
                updatedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    optional: boolean;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
                description?: string | undefined;
                location?: string | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
                recurrence?: {
                    rule: string;
                    exceptions?: string[] | undefined;
                } | undefined;
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }, {
                status: "tentative" | "confirmed" | "cancelled";
                id: string;
                timezone: string;
                createdAt: string;
                responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                title: string;
                start: string;
                end: string;
                isAllDay: boolean;
                attendees: {
                    email: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    name?: string | undefined;
                    optional?: boolean | undefined;
                }[];
                externalId: string;
                organizer: {
                    email: string;
                    self: boolean;
                    name?: string | undefined;
                };
                updatedAt: string;
                description?: string | undefined;
                location?: string | undefined;
                conferenceData?: {
                    type: "zoom" | "meet" | "teams" | "other";
                    url: string;
                    id?: string | undefined;
                    pin?: string | undefined;
                } | undefined;
                recurrence?: {
                    rule: string;
                    exceptions?: string[] | undefined;
                } | undefined;
                meetingUrl?: string | undefined;
                aiSuggestions?: {
                    suggestedPrep?: string[] | undefined;
                    relatedEmails?: string[] | undefined;
                    suggestedActionItems?: string[] | undefined;
                    meetingSummary?: string | undefined;
                } | undefined;
            }>;
        };
        readonly getEvents: {
            readonly method: "GET";
            readonly path: "/api/calendar/events";
            readonly request: import("zod").ZodObject<{
                start: import("zod").ZodOptional<import("zod").ZodString>;
                end: import("zod").ZodOptional<import("zod").ZodString>;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                page: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                start?: string | undefined;
                end?: string | undefined;
            }, {
                start?: string | undefined;
                end?: string | undefined;
                limit?: number | undefined;
                page?: number | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                events: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    title: import("zod").ZodString;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    location: import("zod").ZodOptional<import("zod").ZodString>;
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    isAllDay: import("zod").ZodBoolean;
                    timezone: import("zod").ZodString;
                    attendees: import("zod").ZodArray<import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    } & {
                        responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }, {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }>, "many">;
                    organizer: import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        self: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }>;
                    status: import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>;
                    responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    meetingUrl: import("zod").ZodOptional<import("zod").ZodString>;
                    conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                        type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                        url: import("zod").ZodString;
                        id: import("zod").ZodOptional<import("zod").ZodString>;
                        pin: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }>>;
                    recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                        rule: import("zod").ZodString;
                        exceptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    }, "strip", import("zod").ZodTypeAny, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }>>;
                    aiSuggestions: import("zod").ZodOptional<import("zod").ZodObject<{
                        suggestedPrep: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        relatedEmails: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        suggestedActionItems: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        meetingSummary: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }>>;
                    createdAt: import("zod").ZodString;
                    updatedAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }>, "many">;
                total: import("zod").ZodNumber;
                page: import("zod").ZodNumber;
                limit: import("zod").ZodNumber;
                hasMore: import("zod").ZodBoolean;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                events: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }[];
                total: number;
                hasMore: boolean;
            }, {
                limit: number;
                page: number;
                events: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }[];
                total: number;
                hasMore: boolean;
            }>;
        };
        readonly checkAvailability: {
            readonly method: "POST";
            readonly path: "/api/calendar/availability";
            readonly request: import("zod").ZodObject<{
                start: import("zod").ZodString;
                end: import("zod").ZodString;
                durationMinutes: import("zod").ZodNumber;
                timeOfDay: import("zod").ZodOptional<import("zod").ZodEnum<["morning", "lunch", "afternoon", "evening"]>>;
                preferredDays: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
                participants: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            }, "strip", import("zod").ZodTypeAny, {
                start: string;
                end: string;
                durationMinutes: number;
                timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
                preferredDays?: number[] | undefined;
                participants?: string[] | undefined;
            }, {
                start: string;
                end: string;
                durationMinutes: number;
                timeOfDay?: "morning" | "lunch" | "afternoon" | "evening" | undefined;
                preferredDays?: number[] | undefined;
                participants?: string[] | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                availableSlots: import("zod").ZodArray<import("zod").ZodObject<{
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    score: import("zod").ZodNumber;
                    reason: import("zod").ZodString;
                    conflicts: import("zod").ZodArray<import("zod").ZodObject<{
                        eventId: import("zod").ZodString;
                        title: import("zod").ZodString;
                        start: import("zod").ZodString;
                        end: import("zod").ZodString;
                        type: import("zod").ZodEnum<["hard", "soft"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }, {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }>, "many">;
                    isPreferred: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }, {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }>, "many">;
                totalSlots: import("zod").ZodNumber;
                preferredSlots: import("zod").ZodArray<import("zod").ZodObject<{
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    score: import("zod").ZodNumber;
                    reason: import("zod").ZodString;
                    conflicts: import("zod").ZodArray<import("zod").ZodObject<{
                        eventId: import("zod").ZodString;
                        title: import("zod").ZodString;
                        start: import("zod").ZodString;
                        end: import("zod").ZodString;
                        type: import("zod").ZodEnum<["hard", "soft"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }, {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }>, "many">;
                    isPreferred: import("zod").ZodBoolean;
                }, "strip", import("zod").ZodTypeAny, {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }, {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }>, "many">;
            }, "strip", import("zod").ZodTypeAny, {
                availableSlots: {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }[];
                totalSlots: number;
                preferredSlots: {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }[];
            }, {
                availableSlots: {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }[];
                totalSlots: number;
                preferredSlots: {
                    start: string;
                    end: string;
                    score: number;
                    reason: string;
                    conflicts: {
                        type: "hard" | "soft";
                        title: string;
                        start: string;
                        end: string;
                        eventId: string;
                    }[];
                    isPreferred: boolean;
                }[];
            }>;
        };
        readonly respondToEvent: {
            readonly method: "POST";
            readonly path: "/api/calendar/events/:id/respond";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
                response: import("zod").ZodEnum<["accepted", "declined", "tentative"]>;
                comment: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                response: "accepted" | "declined" | "tentative";
                comment?: string | undefined;
            }, {
                id: string;
                response: "accepted" | "declined" | "tentative";
                comment?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                event: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    externalId: import("zod").ZodString;
                    title: import("zod").ZodString;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    location: import("zod").ZodOptional<import("zod").ZodString>;
                    start: import("zod").ZodString;
                    end: import("zod").ZodString;
                    isAllDay: import("zod").ZodBoolean;
                    timezone: import("zod").ZodString;
                    attendees: import("zod").ZodArray<import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        optional: import("zod").ZodDefault<import("zod").ZodBoolean>;
                    } & {
                        responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }, {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }>, "many">;
                    organizer: import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodOptional<import("zod").ZodString>;
                        self: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }, {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    }>;
                    status: import("zod").ZodEnum<["confirmed", "tentative", "cancelled"]>;
                    responseStatus: import("zod").ZodEnum<["accepted", "declined", "tentative", "needsAction"]>;
                    meetingUrl: import("zod").ZodOptional<import("zod").ZodString>;
                    conferenceData: import("zod").ZodOptional<import("zod").ZodObject<{
                        type: import("zod").ZodEnum<["zoom", "meet", "teams", "other"]>;
                        url: import("zod").ZodString;
                        id: import("zod").ZodOptional<import("zod").ZodString>;
                        pin: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }, {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    }>>;
                    recurrence: import("zod").ZodOptional<import("zod").ZodObject<{
                        rule: import("zod").ZodString;
                        exceptions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    }, "strip", import("zod").ZodTypeAny, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }, {
                        rule: string;
                        exceptions?: string[] | undefined;
                    }>>;
                    aiSuggestions: import("zod").ZodOptional<import("zod").ZodObject<{
                        suggestedPrep: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        relatedEmails: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        suggestedActionItems: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        meetingSummary: import("zod").ZodOptional<import("zod").ZodString>;
                    }, "strip", import("zod").ZodTypeAny, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }, {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    }>>;
                    createdAt: import("zod").ZodString;
                    updatedAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }, {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        optional: boolean;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }, {
                success: boolean;
                event: {
                    status: "tentative" | "confirmed" | "cancelled";
                    id: string;
                    timezone: string;
                    createdAt: string;
                    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                    title: string;
                    start: string;
                    end: string;
                    isAllDay: boolean;
                    attendees: {
                        email: string;
                        responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
                        name?: string | undefined;
                        optional?: boolean | undefined;
                    }[];
                    externalId: string;
                    organizer: {
                        email: string;
                        self: boolean;
                        name?: string | undefined;
                    };
                    updatedAt: string;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceData?: {
                        type: "zoom" | "meet" | "teams" | "other";
                        url: string;
                        id?: string | undefined;
                        pin?: string | undefined;
                    } | undefined;
                    recurrence?: {
                        rule: string;
                        exceptions?: string[] | undefined;
                    } | undefined;
                    meetingUrl?: string | undefined;
                    aiSuggestions?: {
                        suggestedPrep?: string[] | undefined;
                        relatedEmails?: string[] | undefined;
                        suggestedActionItems?: string[] | undefined;
                        meetingSummary?: string | undefined;
                    } | undefined;
                };
            }>;
        };
    };
    readonly commands: {
        readonly processCommand: {
            readonly method: "POST";
            readonly path: "/api/commands";
            readonly request: import("zod").ZodObject<{
                transcript: import("zod").ZodString;
                audioFileUrl: import("zod").ZodOptional<import("zod").ZodString>;
                deviceType: import("zod").ZodEnum<["ios", "android", "web"]>;
                appVersion: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                transcript: string;
                deviceType: "ios" | "android" | "web";
                appVersion: string;
                audioFileUrl?: string | undefined;
            }, {
                transcript: string;
                deviceType: "ios" | "android" | "web";
                appVersion: string;
                audioFileUrl?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                commandId: import("zod").ZodString;
                status: import("zod").ZodEnum<["pending_approval", "processing", "completed", "failed"]>;
                intent: import("zod").ZodString;
                confidence: import("zod").ZodNumber;
                draft: import("zod").ZodOptional<import("zod").ZodUnion<[import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"email">;
                    to: import("zod").ZodArray<import("zod").ZodString, "many">;
                    cc: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    subject: import("zod").ZodString;
                    body: import("zod").ZodString;
                    tone: import("zod").ZodString;
                    replyToThreadId: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "email";
                    to: string[];
                    subject: string;
                    body: string;
                    tone: string;
                    cc?: string[] | undefined;
                    replyToThreadId?: string | undefined;
                }, {
                    type: "email";
                    to: string[];
                    subject: string;
                    body: string;
                    tone: string;
                    cc?: string[] | undefined;
                    replyToThreadId?: string | undefined;
                }>, import("zod").ZodObject<{
                    type: import("zod").ZodLiteral<"meeting_request">;
                    title: import("zod").ZodString;
                    participants: import("zod").ZodArray<import("zod").ZodString, "many">;
                    proposedTimes: import("zod").ZodArray<import("zod").ZodString, "many">;
                    duration: import("zod").ZodNumber;
                    location: import("zod").ZodOptional<import("zod").ZodString>;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    conferenceType: import("zod").ZodOptional<import("zod").ZodEnum<["zoom", "meet", "teams"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    type: "meeting_request";
                    title: string;
                    participants: string[];
                    proposedTimes: string[];
                    duration: number;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceType?: "zoom" | "meet" | "teams" | undefined;
                }, {
                    type: "meeting_request";
                    title: string;
                    participants: string[];
                    proposedTimes: string[];
                    duration: number;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceType?: "zoom" | "meet" | "teams" | undefined;
                }>]>>;
                message: import("zod").ZodOptional<import("zod").ZodString>;
                requiresApproval: import("zod").ZodBoolean;
            }, "strip", import("zod").ZodTypeAny, {
                status: "processing" | "pending_approval" | "completed" | "failed";
                commandId: string;
                intent: string;
                confidence: number;
                requiresApproval: boolean;
                message?: string | undefined;
                draft?: {
                    type: "email";
                    to: string[];
                    subject: string;
                    body: string;
                    tone: string;
                    cc?: string[] | undefined;
                    replyToThreadId?: string | undefined;
                } | {
                    type: "meeting_request";
                    title: string;
                    participants: string[];
                    proposedTimes: string[];
                    duration: number;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceType?: "zoom" | "meet" | "teams" | undefined;
                } | undefined;
            }, {
                status: "processing" | "pending_approval" | "completed" | "failed";
                commandId: string;
                intent: string;
                confidence: number;
                requiresApproval: boolean;
                message?: string | undefined;
                draft?: {
                    type: "email";
                    to: string[];
                    subject: string;
                    body: string;
                    tone: string;
                    cc?: string[] | undefined;
                    replyToThreadId?: string | undefined;
                } | {
                    type: "meeting_request";
                    title: string;
                    participants: string[];
                    proposedTimes: string[];
                    duration: number;
                    description?: string | undefined;
                    location?: string | undefined;
                    conferenceType?: "zoom" | "meet" | "teams" | undefined;
                } | undefined;
            }>;
        };
        readonly getCommand: {
            readonly method: "GET";
            readonly path: "/api/commands/:id";
            readonly request: import("zod").ZodObject<{
                id: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            readonly response: import("zod").ZodObject<{
                id: import("zod").ZodString;
                transcript: import("zod").ZodString;
                intent: import("zod").ZodString;
                intentData: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
                confidence: import("zod").ZodNumber;
                status: import("zod").ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
                result: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
                error: import("zod").ZodOptional<import("zod").ZodObject<{
                    message: import("zod").ZodString;
                    code: import("zod").ZodOptional<import("zod").ZodString>;
                    details: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                }, {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                }>>;
                timestamp: import("zod").ZodString;
                completedAt: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }, {
                status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                id: string;
                transcript: string;
                intent: string;
                intentData: Record<string, unknown>;
                confidence: number;
                timestamp: string;
                result?: Record<string, unknown> | undefined;
                error?: {
                    message: string;
                    code?: string | undefined;
                    details?: Record<string, unknown> | undefined;
                } | undefined;
                completedAt?: string | undefined;
            }>;
        };
        readonly getCommands: {
            readonly method: "GET";
            readonly path: "/api/commands";
            readonly request: import("zod").ZodObject<{
                status: import("zod").ZodOptional<import("zod").ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>>;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                page: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
            }, {
                status?: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed" | undefined;
                limit?: number | undefined;
                page?: number | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                commands: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    transcript: import("zod").ZodString;
                    intent: import("zod").ZodString;
                    intentData: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
                    confidence: import("zod").ZodNumber;
                    status: import("zod").ZodEnum<["pending", "processing", "pending_approval", "completed", "failed", "cancelled"]>;
                    result: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
                    error: import("zod").ZodOptional<import("zod").ZodObject<{
                        message: import("zod").ZodString;
                        code: import("zod").ZodOptional<import("zod").ZodString>;
                        details: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
                    }, "strip", import("zod").ZodTypeAny, {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    }, {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    }>>;
                    timestamp: import("zod").ZodString;
                    completedAt: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                    id: string;
                    transcript: string;
                    intent: string;
                    intentData: Record<string, unknown>;
                    confidence: number;
                    timestamp: string;
                    result?: Record<string, unknown> | undefined;
                    error?: {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    } | undefined;
                    completedAt?: string | undefined;
                }, {
                    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                    id: string;
                    transcript: string;
                    intent: string;
                    intentData: Record<string, unknown>;
                    confidence: number;
                    timestamp: string;
                    result?: Record<string, unknown> | undefined;
                    error?: {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    } | undefined;
                    completedAt?: string | undefined;
                }>, "many">;
                total: import("zod").ZodNumber;
                page: import("zod").ZodNumber;
                limit: import("zod").ZodNumber;
                hasMore: import("zod").ZodBoolean;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                page: number;
                total: number;
                hasMore: boolean;
                commands: {
                    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                    id: string;
                    transcript: string;
                    intent: string;
                    intentData: Record<string, unknown>;
                    confidence: number;
                    timestamp: string;
                    result?: Record<string, unknown> | undefined;
                    error?: {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    } | undefined;
                    completedAt?: string | undefined;
                }[];
            }, {
                limit: number;
                page: number;
                total: number;
                hasMore: boolean;
                commands: {
                    status: "cancelled" | "pending" | "processing" | "pending_approval" | "completed" | "failed";
                    id: string;
                    transcript: string;
                    intent: string;
                    intentData: Record<string, unknown>;
                    confidence: number;
                    timestamp: string;
                    result?: Record<string, unknown> | undefined;
                    error?: {
                        message: string;
                        code?: string | undefined;
                        details?: Record<string, unknown> | undefined;
                    } | undefined;
                    completedAt?: string | undefined;
                }[];
            }>;
        };
        readonly approveCommand: {
            readonly method: "POST";
            readonly path: "/api/commands/:id/approve";
            readonly request: import("zod").ZodObject<{
                commandId: import("zod").ZodString;
                edits: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    field: import("zod").ZodString;
                    originalValue: import("zod").ZodUnknown;
                    newValue: import("zod").ZodUnknown;
                }, "strip", import("zod").ZodTypeAny, {
                    field: string;
                    originalValue?: unknown;
                    newValue?: unknown;
                }, {
                    field: string;
                    originalValue?: unknown;
                    newValue?: unknown;
                }>, "many">>;
            }, "strip", import("zod").ZodTypeAny, {
                commandId: string;
                edits?: {
                    field: string;
                    originalValue?: unknown;
                    newValue?: unknown;
                }[] | undefined;
            }, {
                commandId: string;
                edits?: {
                    field: string;
                    originalValue?: unknown;
                    newValue?: unknown;
                }[] | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                commandId: import("zod").ZodString;
                result: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                success: boolean;
                commandId: string;
                result?: Record<string, unknown> | undefined;
            }, {
                message: string;
                success: boolean;
                commandId: string;
                result?: Record<string, unknown> | undefined;
            }>;
        };
        readonly rejectCommand: {
            readonly method: "POST";
            readonly path: "/api/commands/:id/reject";
            readonly request: import("zod").ZodObject<{
                commandId: import("zod").ZodString;
                reason: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                commandId: string;
                reason?: string | undefined;
            }, {
                commandId: string;
                reason?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                commandId: import("zod").ZodString;
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                success: boolean;
                commandId: string;
            }, {
                message: string;
                success: boolean;
                commandId: string;
            }>;
        };
        readonly cancelCommand: {
            readonly method: "POST";
            readonly path: "/api/commands/:id/cancel";
            readonly request: import("zod").ZodObject<{
                commandId: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                commandId: string;
            }, {
                commandId: string;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                commandId: import("zod").ZodString;
                cancelledAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                commandId: string;
                cancelledAt: string;
            }, {
                success: boolean;
                commandId: string;
                cancelledAt: string;
            }>;
        };
        readonly provideFeedback: {
            readonly method: "POST";
            readonly path: "/api/commands/:id/feedback";
            readonly request: import("zod").ZodObject<{
                commandId: import("zod").ZodString;
                feedbackType: import("zod").ZodEnum<["approve", "edit", "reject", "rating"]>;
                rating: import("zod").ZodOptional<import("zod").ZodNumber>;
                comment: import("zod").ZodOptional<import("zod").ZodString>;
                changes: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    field: import("zod").ZodString;
                    originalValue: import("zod").ZodUnknown;
                    newValue: import("zod").ZodUnknown;
                    reason: import("zod").ZodOptional<import("zod").ZodString>;
                }, "strip", import("zod").ZodTypeAny, {
                    field: string;
                    reason?: string | undefined;
                    originalValue?: unknown;
                    newValue?: unknown;
                }, {
                    field: string;
                    reason?: string | undefined;
                    originalValue?: unknown;
                    newValue?: unknown;
                }>, "many">>;
            }, "strip", import("zod").ZodTypeAny, {
                commandId: string;
                feedbackType: "approve" | "edit" | "reject" | "rating";
                comment?: string | undefined;
                rating?: number | undefined;
                changes?: {
                    field: string;
                    reason?: string | undefined;
                    originalValue?: unknown;
                    newValue?: unknown;
                }[] | undefined;
            }, {
                commandId: string;
                feedbackType: "approve" | "edit" | "reject" | "rating";
                comment?: string | undefined;
                rating?: number | undefined;
                changes?: {
                    field: string;
                    reason?: string | undefined;
                    originalValue?: unknown;
                    newValue?: unknown;
                }[] | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                feedbackId: import("zod").ZodString;
                message: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                message: string;
                success: boolean;
                feedbackId: string;
            }, {
                message: string;
                success: boolean;
                feedbackId: string;
            }>;
        };
    };
    readonly context: {
        readonly getUserContext: {
            readonly method: "GET";
            readonly path: "/api/context/user";
            readonly request: import("zod").ZodObject<{
                includePreferences: import("zod").ZodDefault<import("zod").ZodBoolean>;
                includeVipContacts: import("zod").ZodDefault<import("zod").ZodBoolean>;
            }, "strip", import("zod").ZodTypeAny, {
                includePreferences: boolean;
                includeVipContacts: boolean;
            }, {
                includePreferences?: boolean | undefined;
                includeVipContacts?: boolean | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                user: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    email: import("zod").ZodString;
                    name: import("zod").ZodString;
                    emailProvider: import("zod").ZodEnum<["gmail", "outlook"]>;
                    calendarProvider: import("zod").ZodEnum<["google", "outlook"]>;
                    timezone: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    email: string;
                    name: string;
                    emailProvider: "gmail" | "outlook";
                    calendarProvider: "outlook" | "google";
                    timezone: string;
                }, {
                    id: string;
                    email: string;
                    name: string;
                    emailProvider: "gmail" | "outlook";
                    calendarProvider: "outlook" | "google";
                    timezone: string;
                }>;
                preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                    defaultTone: import("zod").ZodString;
                    emailSignature: import("zod").ZodString;
                    signOffPhrase: import("zod").ZodString;
                    autoAcceptMeetings: import("zod").ZodBoolean;
                    autoRespondSimple: import("zod").ZodBoolean;
                    notificationPreferences: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
                    vipContacts: import("zod").ZodArray<import("zod").ZodObject<{
                        email: import("zod").ZodString;
                        name: import("zod").ZodString;
                        relationship: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
                        email: string;
                        name: string;
                        relationship: string;
                    }, {
                        email: string;
                        name: string;
                        relationship: string;
                    }>, "many">;
                    followUpDefaults: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
                }, "strip", import("zod").ZodTypeAny, {
                    defaultTone: string;
                    emailSignature: string;
                    signOffPhrase: string;
                    autoAcceptMeetings: boolean;
                    autoRespondSimple: boolean;
                    notificationPreferences: Record<string, unknown>;
                    vipContacts: {
                        email: string;
                        name: string;
                        relationship: string;
                    }[];
                    followUpDefaults: Record<string, unknown>;
                }, {
                    defaultTone: string;
                    emailSignature: string;
                    signOffPhrase: string;
                    autoAcceptMeetings: boolean;
                    autoRespondSimple: boolean;
                    notificationPreferences: Record<string, unknown>;
                    vipContacts: {
                        email: string;
                        name: string;
                        relationship: string;
                    }[];
                    followUpDefaults: Record<string, unknown>;
                }>>;
            }, "strip", import("zod").ZodTypeAny, {
                user: {
                    id: string;
                    email: string;
                    name: string;
                    emailProvider: "gmail" | "outlook";
                    calendarProvider: "outlook" | "google";
                    timezone: string;
                };
                preferences?: {
                    defaultTone: string;
                    emailSignature: string;
                    signOffPhrase: string;
                    autoAcceptMeetings: boolean;
                    autoRespondSimple: boolean;
                    notificationPreferences: Record<string, unknown>;
                    vipContacts: {
                        email: string;
                        name: string;
                        relationship: string;
                    }[];
                    followUpDefaults: Record<string, unknown>;
                } | undefined;
            }, {
                user: {
                    id: string;
                    email: string;
                    name: string;
                    emailProvider: "gmail" | "outlook";
                    calendarProvider: "outlook" | "google";
                    timezone: string;
                };
                preferences?: {
                    defaultTone: string;
                    emailSignature: string;
                    signOffPhrase: string;
                    autoAcceptMeetings: boolean;
                    autoRespondSimple: boolean;
                    notificationPreferences: Record<string, unknown>;
                    vipContacts: {
                        email: string;
                        name: string;
                        relationship: string;
                    }[];
                    followUpDefaults: Record<string, unknown>;
                } | undefined;
            }>;
        };
        readonly updateUserPreferences: {
            readonly method: "PUT";
            readonly path: "/api/context/preferences";
            readonly request: import("zod").ZodObject<{
                defaultTone: import("zod").ZodOptional<import("zod").ZodEnum<["professional", "casual", "friendly", "formal"]>>;
                emailSignature: import("zod").ZodOptional<import("zod").ZodString>;
                signOffPhrase: import("zod").ZodOptional<import("zod").ZodString>;
                autoAcceptMeetings: import("zod").ZodOptional<import("zod").ZodBoolean>;
                autoAcceptMeetingsFrom: import("zod").ZodOptional<import("zod").ZodEnum<["none", "vip", "all"]>>;
                autoRespondSimple: import("zod").ZodOptional<import("zod").ZodBoolean>;
                autoRespondConfidence: import("zod").ZodOptional<import("zod").ZodEnum<["high", "medium", "low"]>>;
                notificationPreferences: import("zod").ZodOptional<import("zod").ZodObject<{
                    interruptions: import("zod").ZodOptional<import("zod").ZodObject<{
                        vip_emails: import("zod").ZodBoolean;
                        meeting_reminders: import("zod").ZodBoolean;
                        urgent_deadlines: import("zod").ZodBoolean;
                        tracked_responses: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    }, {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    }>>;
                    batch_interval: import("zod").ZodOptional<import("zod").ZodNumber>;
                    quiet_hours: import("zod").ZodOptional<import("zod").ZodObject<{
                        enabled: import("zod").ZodBoolean;
                        start: import("zod").ZodString;
                        end: import("zod").ZodString;
                    }, "strip", import("zod").ZodTypeAny, {
                        start: string;
                        end: string;
                        enabled: boolean;
                    }, {
                        start: string;
                        end: string;
                        enabled: boolean;
                    }>>;
                }, "strip", import("zod").ZodTypeAny, {
                    interruptions?: {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    } | undefined;
                    batch_interval?: number | undefined;
                    quiet_hours?: {
                        start: string;
                        end: string;
                        enabled: boolean;
                    } | undefined;
                }, {
                    interruptions?: {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    } | undefined;
                    batch_interval?: number | undefined;
                    quiet_hours?: {
                        start: string;
                        end: string;
                        enabled: boolean;
                    } | undefined;
                }>>;
                vipContacts: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodString;
                    relationship: import("zod").ZodEnum<["boss", "client", "colleague"]>;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    name: string;
                    relationship: "boss" | "client" | "colleague";
                }, {
                    email: string;
                    name: string;
                    relationship: "boss" | "client" | "colleague";
                }>, "many">>;
                followUpDefaults: import("zod").ZodOptional<import("zod").ZodObject<{
                    default_delay_hours: import("zod").ZodOptional<import("zod").ZodNumber>;
                    auto_follow_up_enabled: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    follow_up_conditions: import("zod").ZodOptional<import("zod").ZodObject<{
                        no_response_to_important: import("zod").ZodBoolean;
                        meeting_not_accepted: import("zod").ZodBoolean;
                    }, "strip", import("zod").ZodTypeAny, {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    }, {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    }>>;
                }, "strip", import("zod").ZodTypeAny, {
                    default_delay_hours?: number | undefined;
                    auto_follow_up_enabled?: boolean | undefined;
                    follow_up_conditions?: {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    } | undefined;
                }, {
                    default_delay_hours?: number | undefined;
                    auto_follow_up_enabled?: boolean | undefined;
                    follow_up_conditions?: {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    } | undefined;
                }>>;
            }, "strip", import("zod").ZodTypeAny, {
                defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
                emailSignature?: string | undefined;
                signOffPhrase?: string | undefined;
                autoAcceptMeetings?: boolean | undefined;
                autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
                autoRespondSimple?: boolean | undefined;
                autoRespondConfidence?: "high" | "medium" | "low" | undefined;
                notificationPreferences?: {
                    interruptions?: {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    } | undefined;
                    batch_interval?: number | undefined;
                    quiet_hours?: {
                        start: string;
                        end: string;
                        enabled: boolean;
                    } | undefined;
                } | undefined;
                vipContacts?: {
                    email: string;
                    name: string;
                    relationship: "boss" | "client" | "colleague";
                }[] | undefined;
                followUpDefaults?: {
                    default_delay_hours?: number | undefined;
                    auto_follow_up_enabled?: boolean | undefined;
                    follow_up_conditions?: {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    } | undefined;
                } | undefined;
            }, {
                defaultTone?: "professional" | "casual" | "friendly" | "formal" | undefined;
                emailSignature?: string | undefined;
                signOffPhrase?: string | undefined;
                autoAcceptMeetings?: boolean | undefined;
                autoAcceptMeetingsFrom?: "none" | "vip" | "all" | undefined;
                autoRespondSimple?: boolean | undefined;
                autoRespondConfidence?: "high" | "medium" | "low" | undefined;
                notificationPreferences?: {
                    interruptions?: {
                        vip_emails: boolean;
                        meeting_reminders: boolean;
                        urgent_deadlines: boolean;
                        tracked_responses: boolean;
                    } | undefined;
                    batch_interval?: number | undefined;
                    quiet_hours?: {
                        start: string;
                        end: string;
                        enabled: boolean;
                    } | undefined;
                } | undefined;
                vipContacts?: {
                    email: string;
                    name: string;
                    relationship: "boss" | "client" | "colleague";
                }[] | undefined;
                followUpDefaults?: {
                    default_delay_hours?: number | undefined;
                    auto_follow_up_enabled?: boolean | undefined;
                    follow_up_conditions?: {
                        no_response_to_important: boolean;
                        meeting_not_accepted: boolean;
                    } | undefined;
                } | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                preferences: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>;
                updatedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                updatedAt: string;
                preferences: Record<string, unknown>;
            }, {
                success: boolean;
                updatedAt: string;
                preferences: Record<string, unknown>;
            }>;
        };
        readonly getContactPreferences: {
            readonly method: "GET";
            readonly path: "/api/context/contact/:email";
            readonly request: import("zod").ZodObject<{
                email: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                email: string;
            }, {
                email: string;
            }>;
            readonly response: import("zod").ZodObject<{
                id: import("zod").ZodString;
                contactEmail: import("zod").ZodString;
                contactName: import("zod").ZodOptional<import("zod").ZodString>;
                preferredTone: import("zod").ZodString;
                relationshipType: import("zod").ZodOptional<import("zod").ZodString>;
                customInstructions: import("zod").ZodOptional<import("zod").ZodString>;
                interactionCount: import("zod").ZodNumber;
                lastInteraction: import("zod").ZodString;
                patterns: import("zod").ZodOptional<import("zod").ZodObject<{
                    averageResponseTimeHours: import("zod").ZodOptional<import("zod").ZodNumber>;
                    preferredMeetingTimes: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    commonTopics: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    typicalEmailLength: import("zod").ZodOptional<import("zod").ZodEnum<["short", "medium", "long"]>>;
                }, "strip", import("zod").ZodTypeAny, {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                }, {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                }>>;
                createdAt: import("zod").ZodString;
                updatedAt: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            }, {
                id: string;
                createdAt: string;
                updatedAt: string;
                preferredTone: string;
                contactEmail: string;
                interactionCount: number;
                lastInteraction: string;
                contactName?: string | undefined;
                relationshipType?: string | undefined;
                customInstructions?: string | undefined;
                patterns?: {
                    averageResponseTimeHours?: number | undefined;
                    preferredMeetingTimes?: string[] | undefined;
                    commonTopics?: string[] | undefined;
                    typicalEmailLength?: "medium" | "short" | "long" | undefined;
                } | undefined;
            }>;
        };
        readonly updateContactPreferences: {
            readonly method: "PUT";
            readonly path: "/api/context/contact/:email";
            readonly request: import("zod").ZodObject<{
                email: import("zod").ZodString;
                contactName: import("zod").ZodOptional<import("zod").ZodString>;
                preferredTone: import("zod").ZodEnum<["professional", "casual", "friendly", "formal"]>;
                relationshipType: import("zod").ZodOptional<import("zod").ZodEnum<["colleague", "client", "friend", "boss", "vendor"]>>;
                customInstructions: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                email: string;
                preferredTone: "professional" | "casual" | "friendly" | "formal";
                contactName?: string | undefined;
                relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
                customInstructions?: string | undefined;
            }, {
                email: string;
                preferredTone: "professional" | "casual" | "friendly" | "formal";
                contactName?: string | undefined;
                relationshipType?: "boss" | "client" | "colleague" | "friend" | "vendor" | undefined;
                customInstructions?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                success: import("zod").ZodBoolean;
                preferences: import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    contactEmail: import("zod").ZodString;
                    contactName: import("zod").ZodOptional<import("zod").ZodString>;
                    preferredTone: import("zod").ZodString;
                    relationshipType: import("zod").ZodOptional<import("zod").ZodString>;
                    customInstructions: import("zod").ZodOptional<import("zod").ZodString>;
                    interactionCount: import("zod").ZodNumber;
                    lastInteraction: import("zod").ZodString;
                    patterns: import("zod").ZodOptional<import("zod").ZodObject<{
                        averageResponseTimeHours: import("zod").ZodOptional<import("zod").ZodNumber>;
                        preferredMeetingTimes: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        commonTopics: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                        typicalEmailLength: import("zod").ZodOptional<import("zod").ZodEnum<["short", "medium", "long"]>>;
                    }, "strip", import("zod").ZodTypeAny, {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    }, {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    }>>;
                    createdAt: import("zod").ZodString;
                    updatedAt: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    id: string;
                    createdAt: string;
                    updatedAt: string;
                    preferredTone: string;
                    contactEmail: string;
                    interactionCount: number;
                    lastInteraction: string;
                    contactName?: string | undefined;
                    relationshipType?: string | undefined;
                    customInstructions?: string | undefined;
                    patterns?: {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    } | undefined;
                }, {
                    id: string;
                    createdAt: string;
                    updatedAt: string;
                    preferredTone: string;
                    contactEmail: string;
                    interactionCount: number;
                    lastInteraction: string;
                    contactName?: string | undefined;
                    relationshipType?: string | undefined;
                    customInstructions?: string | undefined;
                    patterns?: {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    } | undefined;
                }>;
            }, "strip", import("zod").ZodTypeAny, {
                success: boolean;
                preferences: {
                    id: string;
                    createdAt: string;
                    updatedAt: string;
                    preferredTone: string;
                    contactEmail: string;
                    interactionCount: number;
                    lastInteraction: string;
                    contactName?: string | undefined;
                    relationshipType?: string | undefined;
                    customInstructions?: string | undefined;
                    patterns?: {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    } | undefined;
                };
            }, {
                success: boolean;
                preferences: {
                    id: string;
                    createdAt: string;
                    updatedAt: string;
                    preferredTone: string;
                    contactEmail: string;
                    interactionCount: number;
                    lastInteraction: string;
                    contactName?: string | undefined;
                    relationshipType?: string | undefined;
                    customInstructions?: string | undefined;
                    patterns?: {
                        averageResponseTimeHours?: number | undefined;
                        preferredMeetingTimes?: string[] | undefined;
                        commonTopics?: string[] | undefined;
                        typicalEmailLength?: "medium" | "short" | "long" | undefined;
                    } | undefined;
                };
            }>;
        };
        readonly getMeetingPatterns: {
            readonly method: "GET";
            readonly path: "/api/context/patterns/meetings";
            readonly request: import("zod").ZodObject<{
                startDate: import("zod").ZodOptional<import("zod").ZodString>;
                endDate: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                startDate?: string | undefined;
                endDate?: string | undefined;
            }, {
                startDate?: string | undefined;
                endDate?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                totalMeetings: import("zod").ZodNumber;
                averageDurationMinutes: import("zod").ZodNumber;
                mostCommonAttendees: import("zod").ZodArray<import("zod").ZodObject<{
                    email: import("zod").ZodString;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    count: import("zod").ZodNumber;
                }, "strip", import("zod").ZodTypeAny, {
                    email: string;
                    count: number;
                    name?: string | undefined;
                }, {
                    email: string;
                    count: number;
                    name?: string | undefined;
                }>, "many">;
                preferredTimeSlots: import("zod").ZodArray<import("zod").ZodObject<{
                    dayOfWeek: import("zod").ZodNumber;
                    startHour: import("zod").ZodNumber;
                    endHour: import("zod").ZodNumber;
                    frequency: import("zod").ZodNumber;
                }, "strip", import("zod").ZodTypeAny, {
                    dayOfWeek: number;
                    startHour: number;
                    endHour: number;
                    frequency: number;
                }, {
                    dayOfWeek: number;
                    startHour: number;
                    endHour: number;
                    frequency: number;
                }>, "many">;
                meetingsByType: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
                totalMeetings: number;
                averageDurationMinutes: number;
                mostCommonAttendees: {
                    email: string;
                    count: number;
                    name?: string | undefined;
                }[];
                preferredTimeSlots: {
                    dayOfWeek: number;
                    startHour: number;
                    endHour: number;
                    frequency: number;
                }[];
                meetingsByType: Record<string, number>;
            }, {
                totalMeetings: number;
                averageDurationMinutes: number;
                mostCommonAttendees: {
                    email: string;
                    count: number;
                    name?: string | undefined;
                }[];
                preferredTimeSlots: {
                    dayOfWeek: number;
                    startHour: number;
                    endHour: number;
                    frequency: number;
                }[];
                meetingsByType: Record<string, number>;
            }>;
        };
        readonly semanticSearch: {
            readonly method: "POST";
            readonly path: "/api/search/semantic";
            readonly request: import("zod").ZodObject<{
                query: import("zod").ZodString;
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                dateAfter: import("zod").ZodOptional<import("zod").ZodString>;
                dateBefore: import("zod").ZodOptional<import("zod").ZodString>;
                fromContact: import("zod").ZodOptional<import("zod").ZodString>;
            }, "strip", import("zod").ZodTypeAny, {
                limit: number;
                query: string;
                dateAfter?: string | undefined;
                dateBefore?: string | undefined;
                fromContact?: string | undefined;
            }, {
                query: string;
                limit?: number | undefined;
                dateAfter?: string | undefined;
                dateBefore?: string | undefined;
                fromContact?: string | undefined;
            }>;
            readonly response: import("zod").ZodObject<{
                results: import("zod").ZodArray<import("zod").ZodObject<{
                    emailId: import("zod").ZodString;
                    score: import("zod").ZodNumber;
                    snippet: import("zod").ZodString;
                    metadata: import("zod").ZodObject<{
                        from: import("zod").ZodString;
                        subject: import("zod").ZodString;
                        date: import("zod").ZodString;
                        labels: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
                    }, "strip", import("zod").ZodTypeAny, {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    }, {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
                    score: number;
                    emailId: string;
                    snippet: string;
                    metadata: {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    };
                }, {
                    score: number;
                    emailId: string;
                    snippet: string;
                    metadata: {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    };
                }>, "many">;
                total: import("zod").ZodNumber;
                query: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                total: number;
                query: string;
                results: {
                    score: number;
                    emailId: string;
                    snippet: string;
                    metadata: {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    };
                }[];
            }, {
                total: number;
                query: string;
                results: {
                    score: number;
                    emailId: string;
                    snippet: string;
                    metadata: {
                        date: string;
                        subject: string;
                        from: string;
                        labels?: string[] | undefined;
                    };
                }[];
            }>;
        };
    };
};
//# sourceMappingURL=index.d.ts.map