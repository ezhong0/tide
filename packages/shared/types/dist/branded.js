"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserId = createUserId;
exports.createConversationId = createConversationId;
exports.createMessageId = createMessageId;
/**
 * Validate and brand ID
 */
function createUserId(id) {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid user ID');
    }
    return id;
}
function createConversationId(id) {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid conversation ID');
    }
    return id;
}
function createMessageId(id) {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid message ID');
    }
    return id;
}
//# sourceMappingURL=branded.js.map