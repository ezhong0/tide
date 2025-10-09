import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 5000,
        isolate: true,
        restoreMocks: true,
        clearMocks: true,
        mockReset: true,
    },
});
//# sourceMappingURL=vitest.config.js.map