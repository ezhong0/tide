/**
 * Action Preview Service Contract (Module 00)
 * Shows users what will happen before actions are taken
 *
 * Performance Requirements:
 * - Generate preview: <500ms
 * - Execute action: <1000ms
 * - Undo action: <500ms
 */

import {
  Result,
  IAction,
  IActionPreview,
  IActionResult,
  UserId
} from '@tide/types';

export interface IActionPreviewService {
  /**
   * Generate preview for an action
   * @param action Action to preview
   * @param userId User performing the action
   * @returns Preview with details and risks
   * @performance <500ms
   */
  generatePreview(
    action: IAction,
    userId: UserId
  ): Promise<Result<IActionPreview>>;

  /**
   * Execute a confirmed action
   * @param action Action to execute
   * @param userId User performing the action
   * @param modifications Optional modifications from preview
   * @returns Action result with undo info
   * @performance <1000ms
   */
  executeAction(
    action: IAction,
    userId: UserId,
    modifications?: Record<string, unknown>
  ): Promise<Result<IActionResult>>;

  /**
   * Check if action requires confirmation
   * @param action Action to check
   * @returns Whether confirmation is required
   * @performance <50ms
   */
  requiresConfirmation(action: IAction): Promise<Result<boolean>>;

  /**
   * Check if action requires authentication
   * @param action Action to check
   * @returns Whether authentication is required
   * @performance <50ms
   */
  requiresAuthentication(action: IAction): Promise<Result<boolean>>;

  /**
   * Get undo window for action
   * @param actionType Type of action
   * @returns Undo window in milliseconds
   * @performance <10ms
   */
  getUndoWindow(actionType: string): Promise<Result<number>>;

  /**
   * Undo an action
   * @param resultId ID of the action result to undo
   * @param userId User requesting undo
   * @returns Success result
   * @performance <500ms
   */
  undoAction(resultId: string, userId: UserId): Promise<Result<void>>;

  /**
   * Validate action parameters
   * @param action Action to validate
   * @returns Validation result with errors if any
   * @performance <100ms
   */
  validateAction(
    action: IAction
  ): Promise<Result<{ valid: boolean; errors?: string[] }>>;
}
