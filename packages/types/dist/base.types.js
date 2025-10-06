"use strict";
/**
 * Base types with branded types for compile-time type safety.
 * These types ensure that values are not accidentally mixed up.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResult = exports.isTimestamp = exports.isEmail = exports.isUUID = exports.match = exports.flatMap = exports.mapErr = exports.map = exports.unwrapErr = exports.unwrap = exports.isErr = exports.isOk = exports.err = exports.ok = exports.Err = exports.Ok = exports.SessionId = exports.AgentId = exports.UserId = exports.EventId = exports.EmailId = exports.ThreadId = exports.PhoneNumber = exports.Email = exports.Timestamp = exports.UUID = void 0;
// Type guard functions and constructors
const UUID = (id) => {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        throw new Error(`Invalid UUID format: ${id}`);
    }
    return id;
};
exports.UUID = UUID;
const Timestamp = (ts) => {
    if (!Number.isFinite(ts) || ts < 0) {
        throw new Error(`Invalid timestamp: ${ts}`);
    }
    return ts;
};
exports.Timestamp = Timestamp;
const Email = (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`Invalid email format: ${email}`);
    }
    return email.toLowerCase();
};
exports.Email = Email;
const PhoneNumber = (phone) => {
    if (!phone || !/^\+?[\d\s-()]+$/.test(phone)) {
        throw new Error(`Invalid phone number: ${phone}`);
    }
    return phone;
};
exports.PhoneNumber = PhoneNumber;
const ThreadId = (id) => id;
exports.ThreadId = ThreadId;
const EmailId = (id) => id;
exports.EmailId = EmailId;
const EventId = (id) => id;
exports.EventId = EventId;
const UserId = (id) => id;
exports.UserId = UserId;
const AgentId = (id) => id;
exports.AgentId = AgentId;
const SessionId = (id) => id;
exports.SessionId = SessionId;
// Helper functions for Result type
const Ok = (data) => ({ success: true, data });
exports.Ok = Ok;
const Err = (error) => ({ success: false, error });
exports.Err = Err;
// Alias functions to match test expectations
exports.ok = exports.Ok;
exports.err = exports.Err;
const isOk = (result) => result.success;
exports.isOk = isOk;
const isErr = (result) => !result.success;
exports.isErr = isErr;
const unwrap = (result) => {
    if (result.success)
        return result.data;
    throw new Error('Called unwrap on an error result');
};
exports.unwrap = unwrap;
const unwrapErr = (result) => {
    if (!result.success)
        return result.error;
    throw new Error('Called unwrapErr on a success result');
};
exports.unwrapErr = unwrapErr;
const map = (result, fn) => result.success ? (0, exports.Ok)(fn(result.data)) : result;
exports.map = map;
const mapErr = (result, fn) => !result.success ? (0, exports.Err)(fn(result.error)) : result;
exports.mapErr = mapErr;
const flatMap = (result, fn) => result.success ? fn(result.data) : result;
exports.flatMap = flatMap;
const match = (result, handlers) => result.success ? handlers.ok(result.data) : handlers.err(result.error);
exports.match = match;
// Type guards
const isUUID = (value) => {
    return typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
};
exports.isUUID = isUUID;
const isEmail = (value) => {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
exports.isEmail = isEmail;
const isTimestamp = (value) => {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};
exports.isTimestamp = isTimestamp;
const isResult = (value) => {
    return typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        typeof value.success === 'boolean';
};
exports.isResult = isResult;
//# sourceMappingURL=base.types.js.map