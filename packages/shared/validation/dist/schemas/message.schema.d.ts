import { z } from 'zod';
/**
 * Message role schema
 */
export declare const MessageRoleSchema: z.ZodEnum<["user", "assistant", "system"]>;
/**
 * AI Intent schema
 */
export declare const EntitySchema: z.ZodObject<{
    type: z.ZodString;
    value: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: string;
    confidence: number;
}, {
    value: string;
    type: string;
    confidence: number;
}>;
export declare const AIIntentSchema: z.ZodObject<{
    type: z.ZodString;
    confidence: z.ZodNumber;
    entities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        value: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        confidence: number;
    }, {
        value: string;
        type: string;
        confidence: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    confidence: number;
    entities: {
        value: string;
        type: string;
        confidence: number;
    }[];
}, {
    type: string;
    confidence: number;
    entities?: {
        value: string;
        type: string;
        confidence: number;
    }[] | undefined;
}>;
/**
 * Suggested action schema
 */
export declare const SuggestedActionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    description: z.ZodString;
    preview: z.ZodString;
    confidence: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    confidence: number;
    description: string;
    preview: string;
    metadata?: Record<string, any> | undefined;
}, {
    type: string;
    id: string;
    confidence: number;
    description: string;
    preview: string;
    metadata?: Record<string, any> | undefined;
}>;
/**
 * Message schema
 */
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    conversationId: z.ZodString;
    content: z.ZodString;
    role: z.ZodEnum<["user", "assistant", "system"]>;
    intent: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
        confidence: z.ZodNumber;
        entities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            confidence: number;
        }, {
            value: string;
            type: string;
            confidence: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        confidence: number;
        entities: {
            value: string;
            type: string;
            confidence: number;
        }[];
    }, {
        type: string;
        confidence: number;
        entities?: {
            value: string;
            type: string;
            confidence: number;
        }[] | undefined;
    }>>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        description: z.ZodString;
        preview: z.ZodString;
        confidence: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }, {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">>;
    timestamp: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    timestamp: number;
    id: string;
    conversationId: string;
    content: string;
    role: "user" | "assistant" | "system";
    metadata?: Record<string, any> | undefined;
    intent?: {
        type: string;
        confidence: number;
        entities: {
            value: string;
            type: string;
            confidence: number;
        }[];
    } | undefined;
    actions?: {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
}, {
    userId: string;
    timestamp: number;
    id: string;
    conversationId: string;
    content: string;
    role: "user" | "assistant" | "system";
    metadata?: Record<string, any> | undefined;
    intent?: {
        type: string;
        confidence: number;
        entities?: {
            value: string;
            type: string;
            confidence: number;
        }[] | undefined;
    } | undefined;
    actions?: {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
}>;
export type Message = z.infer<typeof MessageSchema>;
/**
 * Conversation schema
 */
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    messages: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        conversationId: z.ZodString;
        content: z.ZodString;
        role: z.ZodEnum<["user", "assistant", "system"]>;
        intent: z.ZodOptional<z.ZodObject<{
            type: z.ZodString;
            confidence: z.ZodNumber;
            entities: z.ZodDefault<z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                value: z.ZodString;
                confidence: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: string;
                confidence: number;
            }, {
                value: string;
                type: string;
                confidence: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            confidence: number;
            entities: {
                value: string;
                type: string;
                confidence: number;
            }[];
        }, {
            type: string;
            confidence: number;
            entities?: {
                value: string;
                type: string;
                confidence: number;
            }[] | undefined;
        }>>;
        actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            description: z.ZodString;
            preview: z.ZodString;
            confidence: z.ZodNumber;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }, {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }>, "many">>;
        timestamp: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        timestamp: number;
        id: string;
        conversationId: string;
        content: string;
        role: "user" | "assistant" | "system";
        metadata?: Record<string, any> | undefined;
        intent?: {
            type: string;
            confidence: number;
            entities: {
                value: string;
                type: string;
                confidence: number;
            }[];
        } | undefined;
        actions?: {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
    }, {
        userId: string;
        timestamp: number;
        id: string;
        conversationId: string;
        content: string;
        role: "user" | "assistant" | "system";
        metadata?: Record<string, any> | undefined;
        intent?: {
            type: string;
            confidence: number;
            entities?: {
                value: string;
                type: string;
                confidence: number;
            }[] | undefined;
        } | undefined;
        actions?: {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    messages: {
        userId: string;
        timestamp: number;
        id: string;
        conversationId: string;
        content: string;
        role: "user" | "assistant" | "system";
        metadata?: Record<string, any> | undefined;
        intent?: {
            type: string;
            confidence: number;
            entities: {
                value: string;
                type: string;
                confidence: number;
            }[];
        } | undefined;
        actions?: {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
    }[];
    metadata?: Record<string, any> | undefined;
    title?: string | undefined;
}, {
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any> | undefined;
    title?: string | undefined;
    messages?: {
        userId: string;
        timestamp: number;
        id: string;
        conversationId: string;
        content: string;
        role: "user" | "assistant" | "system";
        metadata?: Record<string, any> | undefined;
        intent?: {
            type: string;
            confidence: number;
            entities?: {
                value: string;
                type: string;
                confidence: number;
            }[] | undefined;
        } | undefined;
        actions?: {
            type: string;
            id: string;
            confidence: number;
            description: string;
            preview: string;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export type Conversation = z.infer<typeof ConversationSchema>;
/**
 * Create message schema
 */
export declare const CreateMessageSchema: z.ZodObject<{
    conversationId: z.ZodString;
    content: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
    content: string;
    metadata?: Record<string, any> | undefined;
}, {
    conversationId: string;
    content: string;
    metadata?: Record<string, any> | undefined;
}>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
/**
 * Create conversation schema
 */
export declare const CreateConversationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    initialMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    initialMessage?: string | undefined;
}, {
    title?: string | undefined;
    initialMessage?: string | undefined;
}>;
export type CreateConversation = z.infer<typeof CreateConversationSchema>;
/**
 * AI Response schema
 */
export declare const AIResponseSchema: z.ZodObject<{
    content: z.ZodString;
    confidence: z.ZodNumber;
    suggestedActions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        description: z.ZodString;
        preview: z.ZodString;
        confidence: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }, {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }>, "many">>;
    reasoning: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    content: string;
    suggestedActions: {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }[];
    metadata?: Record<string, any> | undefined;
    reasoning?: string | undefined;
}, {
    confidence: number;
    content: string;
    metadata?: Record<string, any> | undefined;
    suggestedActions?: {
        type: string;
        id: string;
        confidence: number;
        description: string;
        preview: string;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
    reasoning?: string | undefined;
}>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
