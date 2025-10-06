"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const globals_1 = require("@jest/globals");
const base_types_1 = require("./base.types");
(0, globals_1.describe)('Result Type', () => {
    (0, globals_1.describe)('ok', () => {
        (0, globals_1.it)('should create a success result', () => {
            const result = (0, base_types_1.ok)(42);
            (0, globals_1.expect)((0, base_types_1.isOk)(result)).toBe(true);
            (0, globals_1.expect)((0, base_types_1.isErr)(result)).toBe(false);
        });
        (0, globals_1.it)('should unwrap to the success value', () => {
            const result = (0, base_types_1.ok)('success');
            (0, globals_1.expect)((0, base_types_1.unwrap)(result)).toBe('success');
        });
    });
    (0, globals_1.describe)('err', () => {
        (0, globals_1.it)('should create an error result', () => {
            const result = (0, base_types_1.err)('error message');
            (0, globals_1.expect)((0, base_types_1.isOk)(result)).toBe(false);
            (0, globals_1.expect)((0, base_types_1.isErr)(result)).toBe(true);
        });
        (0, globals_1.it)('should unwrap to the error value', () => {
            const result = (0, base_types_1.err)('error');
            (0, globals_1.expect)((0, base_types_1.unwrapErr)(result)).toBe('error');
        });
    });
    (0, globals_1.describe)('map', () => {
        (0, globals_1.it)('should transform success values', () => {
            const result = (0, base_types_1.ok)(5);
            const doubled = (0, base_types_1.map)(result, x => x * 2);
            (0, globals_1.expect)((0, base_types_1.unwrap)(doubled)).toBe(10);
        });
        (0, globals_1.it)('should pass through errors unchanged', () => {
            const result = (0, base_types_1.err)('error');
            const mapped = (0, base_types_1.map)(result, (x) => x * 2);
            (0, globals_1.expect)((0, base_types_1.isErr)(mapped)).toBe(true);
            (0, globals_1.expect)((0, base_types_1.unwrapErr)(mapped)).toBe('error');
        });
    });
    (0, globals_1.describe)('mapErr', () => {
        (0, globals_1.it)('should transform error values', () => {
            const result = (0, base_types_1.err)('error');
            const wrapped = (0, base_types_1.mapErr)(result, e => `Wrapped: ${e}`);
            (0, globals_1.expect)((0, base_types_1.unwrapErr)(wrapped)).toBe('Wrapped: error');
        });
        (0, globals_1.it)('should pass through success values unchanged', () => {
            const result = (0, base_types_1.ok)(42);
            const mapped = (0, base_types_1.mapErr)(result, e => `Wrapped: ${String(e)}`);
            (0, globals_1.expect)((0, base_types_1.isOk)(mapped)).toBe(true);
            (0, globals_1.expect)((0, base_types_1.unwrap)(mapped)).toBe(42);
        });
    });
    (0, globals_1.describe)('flatMap', () => {
        (0, globals_1.it)('should chain successful operations', () => {
            const divide = (a, b) => b === 0 ? (0, base_types_1.err)('Division by zero') : (0, base_types_1.ok)(a / b);
            const result = (0, base_types_1.flatMap)((0, base_types_1.ok)(10), x => divide(x, 2));
            (0, globals_1.expect)((0, base_types_1.unwrap)(result)).toBe(5);
        });
        (0, globals_1.it)('should short-circuit on first error', () => {
            const divide = (a, b) => b === 0 ? (0, base_types_1.err)('Division by zero') : (0, base_types_1.ok)(a / b);
            const result = (0, base_types_1.flatMap)((0, base_types_1.ok)(10), x => divide(x, 0));
            (0, globals_1.expect)((0, base_types_1.isErr)(result)).toBe(true);
            (0, globals_1.expect)((0, base_types_1.unwrapErr)(result)).toBe('Division by zero');
        });
        (0, globals_1.it)('should propagate initial error', () => {
            const result = (0, base_types_1.flatMap)((0, base_types_1.err)('initial error'), (x) => (0, base_types_1.ok)(x * 2));
            (0, globals_1.expect)((0, base_types_1.isErr)(result)).toBe(true);
            (0, globals_1.expect)((0, base_types_1.unwrapErr)(result)).toBe('initial error');
        });
    });
    (0, globals_1.describe)('match', () => {
        (0, globals_1.it)('should handle success case', () => {
            const result = (0, base_types_1.ok)(42);
            const output = (0, base_types_1.match)(result, {
                ok: value => `Success: ${String(value)}`,
                err: error => `Error: ${String(error)}`
            });
            (0, globals_1.expect)(output).toBe('Success: 42');
        });
        (0, globals_1.it)('should handle error case', () => {
            const result = (0, base_types_1.err)('failed');
            const output = (0, base_types_1.match)(result, {
                ok: value => `Success: ${String(value)}`,
                err: error => `Error: ${String(error)}`
            });
            (0, globals_1.expect)(output).toBe('Error: failed');
        });
    });
});
(0, globals_1.describe)('Branded Types', () => {
    (0, globals_1.describe)('UUID', () => {
        (0, globals_1.it)('should be a string at runtime', () => {
            const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            (0, globals_1.expect)(typeof id).toBe('string');
        });
        (0, globals_1.it)('should maintain string operations', () => {
            const id = 'test-uuid';
            (0, globals_1.expect)(id.toUpperCase()).toBe('TEST-UUID');
        });
    });
    (0, globals_1.describe)('Timestamp', () => {
        (0, globals_1.it)('should be a number at runtime', () => {
            const now = Date.now();
            (0, globals_1.expect)(typeof now).toBe('number');
        });
        (0, globals_1.it)('should support numeric operations', () => {
            const t1 = 1000;
            const t2 = 2000;
            (0, globals_1.expect)(t2 - t1).toBe(1000);
        });
    });
    (0, globals_1.describe)('Json', () => {
        (0, globals_1.it)('should handle valid JSON structures', () => {
            const data = {
                string: 'value',
                number: 42,
                boolean: true,
                null: null,
                array: [1, 2, 3],
                object: { nested: 'value' }
            };
            (0, globals_1.expect)(data).toEqual({
                string: 'value',
                number: 42,
                boolean: true,
                null: null,
                array: [1, 2, 3],
                object: { nested: 'value' }
            });
        });
    });
});
//# sourceMappingURL=base.types.test.js.map