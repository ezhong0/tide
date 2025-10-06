"use strict";
/**
 * @tide/schemas - Runtime validation with Zod
 *
 * Provides comprehensive validation schemas for all external inputs,
 * API boundaries, and data transformations.
 *
 * Key principles:
 * - Validate ALL external inputs
 * - Fail fast with clear error messages
 * - Type inference from schemas
 * - Reusable primitive schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = void 0;
const tslib_1 = require("tslib");
// Primitive schemas
tslib_1.__exportStar(require("./primitives.schemas"), exports);
// Domain schemas
tslib_1.__exportStar(require("./email.schemas"), exports);
tslib_1.__exportStar(require("./calendar.schemas"), exports);
tslib_1.__exportStar(require("./command.schemas"), exports);
// Middleware and utilities
tslib_1.__exportStar(require("./middleware"), exports);
// Re-export zod for convenience
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
//# sourceMappingURL=index.js.map