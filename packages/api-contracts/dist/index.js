/**
 * API Contracts
 *
 * This package exports all API contract definitions, including
 * Zod schemas and TypeScript types for all API endpoints.
 */
export * from './auth.contracts.js';
export * from './email.contracts.js';
export * from './calendar.contracts.js';
export * from './commands.contracts.js';
export * from './context.contracts.js';
// Re-export all contracts as a single object for convenience
import { AuthContracts } from './auth.contracts.js';
import { EmailContracts } from './email.contracts.js';
import { CalendarContracts } from './calendar.contracts.js';
import { CommandContracts } from './commands.contracts.js';
import { ContextContracts } from './context.contracts.js';
export const ApiContracts = {
    auth: AuthContracts,
    email: EmailContracts,
    calendar: CalendarContracts,
    commands: CommandContracts,
    context: ContextContracts,
};
//# sourceMappingURL=index.js.map