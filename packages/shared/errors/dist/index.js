"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemErrors = exports.DatabaseErrors = exports.IntegrationErrors = exports.MessageErrors = exports.WorkflowErrors = exports.AIErrors = exports.CalendarErrors = exports.EmailErrors = exports.AuthErrors = exports.ERROR_STATUS_MAP = exports.ErrorCode = exports.toTideError = exports.UnexpectedError = exports.TideError = void 0;
// Export error classes
var tide_error_1 = require("./tide-error");
Object.defineProperty(exports, "TideError", { enumerable: true, get: function () { return tide_error_1.TideError; } });
Object.defineProperty(exports, "UnexpectedError", { enumerable: true, get: function () { return tide_error_1.UnexpectedError; } });
Object.defineProperty(exports, "toTideError", { enumerable: true, get: function () { return tide_error_1.toTideError; } });
// Export error codes
var codes_1 = require("./codes");
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return codes_1.ErrorCode; } });
Object.defineProperty(exports, "ERROR_STATUS_MAP", { enumerable: true, get: function () { return codes_1.ERROR_STATUS_MAP; } });
// Export error factories
var factories_1 = require("./factories");
Object.defineProperty(exports, "AuthErrors", { enumerable: true, get: function () { return factories_1.AuthErrors; } });
Object.defineProperty(exports, "EmailErrors", { enumerable: true, get: function () { return factories_1.EmailErrors; } });
Object.defineProperty(exports, "CalendarErrors", { enumerable: true, get: function () { return factories_1.CalendarErrors; } });
Object.defineProperty(exports, "AIErrors", { enumerable: true, get: function () { return factories_1.AIErrors; } });
Object.defineProperty(exports, "WorkflowErrors", { enumerable: true, get: function () { return factories_1.WorkflowErrors; } });
Object.defineProperty(exports, "MessageErrors", { enumerable: true, get: function () { return factories_1.MessageErrors; } });
Object.defineProperty(exports, "IntegrationErrors", { enumerable: true, get: function () { return factories_1.IntegrationErrors; } });
Object.defineProperty(exports, "DatabaseErrors", { enumerable: true, get: function () { return factories_1.DatabaseErrors; } });
Object.defineProperty(exports, "SystemErrors", { enumerable: true, get: function () { return factories_1.SystemErrors; } });
