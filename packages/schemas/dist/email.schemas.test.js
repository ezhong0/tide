"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/explicit-function-return-type */
const globals_1 = require("@jest/globals");
const email_schemas_1 = require("./email.schemas");
const primitives_schemas_1 = require("./primitives.schemas");
(0, globals_1.describe)('Email Schemas', () => {
    (0, globals_1.describe)('EmailSchema (from primitives)', () => {
        (0, globals_1.it)('should validate correct email addresses', () => {
            const result = primitives_schemas_1.EmailSchema.safeParse('user@example.com');
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject invalid email addresses', () => {
            const result = primitives_schemas_1.EmailSchema.safeParse('not-an-email');
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('PrioritySchema (from primitives)', () => {
        (0, globals_1.it)('should accept valid priorities', () => {
            const result = primitives_schemas_1.PrioritySchema.safeParse('normal');
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject invalid priorities', () => {
            const result = primitives_schemas_1.PrioritySchema.safeParse('critical');
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('EmailContactSchema', () => {
        (0, globals_1.it)('should validate correct email contact', () => {
            const contact = {
                email: 'user@example.com',
                name: 'Test User'
            };
            const result = email_schemas_1.EmailContactSchema.safeParse(contact);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
    (0, globals_1.describe)('AttachmentSchema', () => {
        (0, globals_1.it)('should validate correct attachment structure', () => {
            const attachment = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                filename: 'document.pdf',
                size: 1024000,
                mimeType: 'application/pdf'
            };
            const result = email_schemas_1.AttachmentSchema.safeParse(attachment);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.it)('should reject oversized attachments', () => {
            const attachment = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                filename: 'huge.pdf',
                size: 30 * 1024 * 1024, // 30MB
                mimeType: 'application/pdf'
            };
            const result = email_schemas_1.AttachmentSchema.safeParse(attachment);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('EmailQuerySchema', () => {
        (0, globals_1.it)('should validate email query', () => {
            const query = {
                userId: '123e4567-e89b-12d3-a456-426614174000',
                text: 'search term'
            };
            const result = email_schemas_1.EmailQuerySchema.safeParse(query);
            (0, globals_1.expect)(result.success).toBe(true);
        });
    });
});
//# sourceMappingURL=email.schemas.test.js.map