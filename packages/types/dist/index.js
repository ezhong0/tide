"use strict";
/**
 * @tide/types - Core type definitions for the Tide AI Executive Assistant
 *
 * This package provides all base types, branded types, and utility types
 * used throughout the system. All types follow strict TypeScript rules
 * with no 'any' types allowed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = exports.flatMap = exports.mapErr = exports.map = exports.unwrapErr = exports.unwrap = exports.isErr = exports.isOk = exports.err = exports.ok = exports.Err = exports.Ok = void 0;
const tslib_1 = require("tslib");
// Export base types (excluding conflicts)
var base_types_1 = require("./base.types");
Object.defineProperty(exports, "Ok", { enumerable: true, get: function () { return base_types_1.Ok; } });
Object.defineProperty(exports, "Err", { enumerable: true, get: function () { return base_types_1.Err; } });
Object.defineProperty(exports, "ok", { enumerable: true, get: function () { return base_types_1.ok; } });
Object.defineProperty(exports, "err", { enumerable: true, get: function () { return base_types_1.err; } });
Object.defineProperty(exports, "isOk", { enumerable: true, get: function () { return base_types_1.isOk; } });
Object.defineProperty(exports, "isErr", { enumerable: true, get: function () { return base_types_1.isErr; } });
Object.defineProperty(exports, "unwrap", { enumerable: true, get: function () { return base_types_1.unwrap; } });
Object.defineProperty(exports, "unwrapErr", { enumerable: true, get: function () { return base_types_1.unwrapErr; } });
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return base_types_1.map; } });
Object.defineProperty(exports, "mapErr", { enumerable: true, get: function () { return base_types_1.mapErr; } });
Object.defineProperty(exports, "flatMap", { enumerable: true, get: function () { return base_types_1.flatMap; } });
Object.defineProperty(exports, "match", { enumerable: true, get: function () { return base_types_1.match; } });
// Export domain types
tslib_1.__exportStar(require("./domain/index"), exports);
// Export event types
tslib_1.__exportStar(require("./events/index"), exports);
// Export agent types
tslib_1.__exportStar(require("./agents/index"), exports);
//# sourceMappingURL=index.js.map