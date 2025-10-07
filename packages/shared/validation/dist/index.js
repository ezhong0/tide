"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateAsync = validateAsync;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
exports.isValid = isValid;
exports.getValidationErrors = getValidationErrors;
const errors_1 = require("@tide/errors");
// Export all schemas
__exportStar(require("./schemas"), exports);
/**
 * Validation helper function
 */
function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw errors_1.SystemErrors.validationFailed(result.error.format());
    }
    return result.data;
}
/**
 * Async validation helper
 */
async function validateAsync(schema, data) {
    const result = await schema.safeParseAsync(data);
    if (!result.success) {
        throw errors_1.SystemErrors.validationFailed(result.error.format());
    }
    return result.data;
}
/**
 * Validation middleware for Express
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = validate(schema, req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
/**
 * Validation middleware for query parameters
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = validate(schema, req.query);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
/**
 * Validation middleware for route parameters
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = validate(schema, req.params);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
/**
 * Check if data matches schema without throwing
 */
function isValid(schema, data) {
    return schema.safeParse(data).success;
}
/**
 * Get validation errors without throwing
 */
function getValidationErrors(schema, data) {
    const result = schema.safeParse(data);
    return result.success ? null : result.error;
}
