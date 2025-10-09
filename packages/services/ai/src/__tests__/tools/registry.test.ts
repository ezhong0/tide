/**
 * Tool Registry Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../../tools/registry.js';
import type { TideTool, ToolContext } from '../../tools/types.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let mockContext: ToolContext;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockContext = {
      userId: 'test-user-123',
      requestId: 'test-request-456',
      timestamp: Date.now(),
    };
  });

  describe('register', () => {
    it('registers a tool successfully', () => {
      const tool: TideTool = {
        type: 'function',
        name: 'test_tool',
        description: 'A test tool',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: async () => ({ success: true }),
      };

      registry.register(tool);

      expect(registry.has('test_tool')).toBe(true);
      expect(registry.get('test_tool')).toEqual(tool);
    });

    it('overwrites existing tool with warning', () => {
      const tool1: TideTool = {
        type: 'function',
        name: 'duplicate',
        description: 'First version',
        handler: async () => ({ version: 1 }),
      };

      const tool2: TideTool = {
        type: 'function',
        name: 'duplicate',
        description: 'Second version',
        handler: async () => ({ version: 2 }),
      };

      registry.register(tool1);
      registry.register(tool2);

      expect(registry.get('duplicate')).toEqual(tool2);
    });
  });

  describe('registerAll', () => {
    it('registers multiple tools at once', () => {
      const tools: TideTool[] = [
        {
          type: 'function',
          name: 'tool_1',
          description: 'Tool 1',
          handler: async () => ({}),
        },
        {
          type: 'function',
          name: 'tool_2',
          description: 'Tool 2',
          handler: async () => ({}),
        },
      ];

      registry.registerAll(tools);

      expect(registry.getAll()).toHaveLength(2);
      expect(registry.has('tool_1')).toBe(true);
      expect(registry.has('tool_2')).toBe(true);
    });
  });

  describe('execute', () => {
    it('executes a tool successfully', async () => {
      const tool: TideTool = {
        type: 'function',
        name: 'echo_tool',
        description: 'Echoes the input',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Message to echo' },
          },
          required: ['message'],
        },
        handler: async (params) => ({ echoed: params.message }),
      };

      registry.register(tool);

      const result = await registry.execute(
        'echo_tool',
        { message: 'Hello, world!' },
        mockContext
      );

      expect(result.success).toBe(true);
      expect(result.result).toEqual({ echoed: 'Hello, world!' });
      expect(result.executionTime).toBeGreaterThanOrEqual(0); // Can be 0 in fast environments
    });

    it('handles tool not found', async () => {
      const result = await registry.execute(
        'nonexistent_tool',
        {},
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool not found');
    });

    it('handles tool execution errors', async () => {
      const tool: TideTool = {
        type: 'function',
        name: 'failing_tool',
        description: 'Always fails',
        handler: async () => {
          throw new Error('Tool failed intentionally');
        },
      };

      registry.register(tool);

      const result = await registry.execute('failing_tool', {}, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool failed intentionally');
      expect(result.executionTime).toBeGreaterThanOrEqual(0); // Can be 0 in fast environments
    });

    it('passes context to tool handler', async () => {
      let receivedContext: ToolContext | null = null;

      const tool: TideTool = {
        type: 'function',
        name: 'context_tool',
        description: 'Captures context',
        handler: async (params, context) => {
          receivedContext = context;
          return { success: true };
        },
      };

      registry.register(tool);

      await registry.execute('context_tool', {}, mockContext);

      expect(receivedContext).toEqual(mockContext);
    });
  });

  describe('getAll', () => {
    it('returns all registered tools', () => {
      const tools: TideTool[] = [
        {
          type: 'function',
          name: 'tool_a',
          description: 'Tool A',
          handler: async () => ({}),
        },
        {
          type: 'function',
          name: 'tool_b',
          description: 'Tool B',
          handler: async () => ({}),
        },
      ];

      registry.registerAll(tools);

      const allTools = registry.getAll();

      expect(allTools).toHaveLength(2);
      expect(allTools.map(t => t.name)).toContain('tool_a');
      expect(allTools.map(t => t.name)).toContain('tool_b');
    });
  });

  describe('getToolNames', () => {
    it('returns names of all registered tools', () => {
      registry.registerAll([
        {
          type: 'function',
          name: 'alpha',
          description: 'Alpha tool',
          handler: async () => ({}),
        },
        {
          type: 'function',
          name: 'beta',
          description: 'Beta tool',
          handler: async () => ({}),
        },
      ]);

      const names = registry.getToolNames();

      expect(names).toEqual(['alpha', 'beta']);
    });
  });

  describe('clear', () => {
    it('removes all tools', () => {
      registry.registerAll([
        {
          type: 'function',
          name: 'temp_tool',
          description: 'Temporary',
          handler: async () => ({}),
        },
      ]);

      expect(registry.getAll()).toHaveLength(1);

      registry.clear();

      expect(registry.getAll()).toHaveLength(0);
    });
  });
});
