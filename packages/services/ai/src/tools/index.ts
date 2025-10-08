/**
 * Tool System Exports
 */

export * from './types.js';
export * from './registry.js';
export * from './email.tools.js';
export * from './calendar.tools.js';
export * from './task.tools.js';
export * from './custom.tools.js';
export * from './intelligence.tools.js';
export * from './privacy.js';

import { toolRegistry } from './registry.js';
import { emailTools } from './email.tools.js';
import { calendarTools } from './calendar.tools.js';
import { taskTools } from './task.tools.js';
import { customTools } from './custom.tools.js';
import { intelligenceTools } from './intelligence.tools.js';

/**
 * Initialize and register all tools
 */
export function initializeTools(options: {
  includeCustomTools?: boolean;
  includeIntelligenceTools?: boolean;
} = {}): void {
  const tools = [
    ...emailTools,
    ...calendarTools,
    ...taskTools,
  ];

  // Intelligence tools (advanced agents wrapped as tools) - recommended for production
  if (options.includeIntelligenceTools !== false) {
    tools.push(...intelligenceTools);
  }

  // Custom tools are opt-in (requires code execution sandbox)
  if (options.includeCustomTools) {
    tools.push(...customTools);
  }

  // Register all tool categories
  toolRegistry.registerAll(tools);

  return;
}

/**
 * Get the global tool registry
 */
export { toolRegistry };
