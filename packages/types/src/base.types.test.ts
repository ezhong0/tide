/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, it, expect } from '@jest/globals';

import {
  Result,
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapErr,
  map,
  mapErr,
  flatMap,
  match,
  UUID,
  Timestamp,
  Json
} from './base.types';

describe('Result Type', () => {
  describe('ok', () => {
    it('should create a success result', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
    });

    it('should unwrap to the success value', () => {
      const result = ok('success');
      expect(unwrap(result)).toBe('success');
    });
  });

  describe('err', () => {
    it('should create an error result', () => {
      const result = err('error message');
      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);
    });

    it('should unwrap to the error value', () => {
      const result = err('error');
      expect(unwrapErr(result)).toBe('error');
    });
  });

  describe('map', () => {
    it('should transform success values', () => {
      const result = ok(5);
      const doubled = map(result, x => x * 2);
      expect(unwrap(doubled)).toBe(10);
    });

    it('should pass through errors unchanged', () => {
      const result = err('error');
      const mapped = map(result, (x: number) => x * 2);
      expect(isErr(mapped)).toBe(true);
      expect(unwrapErr(mapped)).toBe('error');
    });
  });

  describe('mapErr', () => {
    it('should transform error values', () => {
      const result = err('error');
      const wrapped = mapErr(result, e => `Wrapped: ${e}`);
      expect(unwrapErr(wrapped)).toBe('Wrapped: error');
    });

    it('should pass through success values unchanged', () => {
      const result = ok(42);
      const mapped = mapErr(result, e => `Wrapped: ${String(e)}`);
      expect(isOk(mapped)).toBe(true);
      expect(unwrap(mapped)).toBe(42);
    });
  });

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err<string>('Division by zero') : ok(a / b) as Result<number, string>;

      const result = flatMap(ok(10) as Result<number, string>, x => divide(x, 2));
      expect(unwrap(result)).toBe(5);
    });

    it('should short-circuit on first error', () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err<string>('Division by zero') : ok(a / b) as Result<number, string>;

      const result = flatMap(ok(10) as Result<number, string>, x => divide(x, 0));
      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toBe('Division by zero');
    });

    it('should propagate initial error', () => {
      const result = flatMap(err<string>('initial error'), (x: number) => ok(x * 2) as Result<number, string>);
      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toBe('initial error');
    });
  });

  describe('match', () => {
    it('should handle success case', () => {
      const result = ok(42);
      const output = match(result, {
        ok: value => `Success: ${String(value)}`,
        err: error => `Error: ${String(error)}`
      });
      expect(output).toBe('Success: 42');
    });

    it('should handle error case', () => {
      const result = err('failed');
      const output = match(result, {
        ok: value => `Success: ${String(value)}`,
        err: error => `Error: ${String(error)}`
      });
      expect(output).toBe('Error: failed');
    });
  });
});

describe('Branded Types', () => {
  describe('UUID', () => {
    it('should be a string at runtime', () => {
      const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' as UUID;
      expect(typeof id).toBe('string');
    });

    it('should maintain string operations', () => {
      const id = 'test-uuid' as UUID;
      expect(id.toUpperCase()).toBe('TEST-UUID');
    });
  });

  describe('Timestamp', () => {
    it('should be a number at runtime', () => {
      const now = Date.now() as Timestamp;
      expect(typeof now).toBe('number');
    });

    it('should support numeric operations', () => {
      const t1 = 1000 as Timestamp;
      const t2 = 2000 as Timestamp;
      expect(t2 - t1).toBe(1000);
    });
  });

  describe('Json', () => {
    it('should handle valid JSON structures', () => {
      const data: Json = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      };

      expect(data).toEqual({
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