// Export error classes
export { TideError, UnexpectedError, toTideError } from './tide-error';
export type { ErrorDetail } from './tide-error';

// Export error codes
export { ErrorCode, ERROR_STATUS_MAP } from './codes';

// Export error factories
export {
  AuthErrors,
  EmailErrors,
  CalendarErrors,
  AIErrors,
  WorkflowErrors,
  MessageErrors,
  IntegrationErrors,
  DatabaseErrors,
  SystemErrors,
} from './factories';
