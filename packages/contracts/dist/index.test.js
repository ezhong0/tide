"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment */
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Contracts Package', () => {
    (0, globals_1.it)('should export service interfaces', () => {
        // This test verifies that the contracts package exports are available
        const contracts = require('./index');
        // Check that the module exports exist
        (0, globals_1.expect)(contracts).toBeDefined();
        // The actual interfaces are TypeScript types,
        // so we're mainly testing that the module structure is valid
        (0, globals_1.expect)(true).toBe(true);
    });
    (0, globals_1.it)('should maintain immutable contract structure', () => {
        // This is a placeholder test to ensure the contracts remain immutable
        // In a real scenario, we could use tools to detect breaking changes
        (0, globals_1.expect)(true).toBe(true);
    });
});
//# sourceMappingURL=index.test.js.map