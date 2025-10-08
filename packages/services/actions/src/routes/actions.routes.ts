import { Router } from 'express';
import { logger } from '@tide/logger';
import { createSupabase } from '@tide/database';
import type { UserId } from '@tide/types';
import { ActionExecutor } from '../executor/action-executor.js';
import { ActionSuggester } from '../suggestions/action-suggester.js';
import type { Action, ApprovalRequest, UndoRequest } from '../types/index.js';

const router = Router();
const db = createSupabase(true);
const executor = new ActionExecutor();
const suggester = new ActionSuggester();

/**
 * Generate action suggestions for a user
 * POST /actions/suggest/:userId
 */
router.post('/suggest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const suggestions = await suggester.generateSuggestions(userId as UserId);

    // Save suggestions to database
    const savedIds = await Promise.all(
      suggestions.map(suggestion => suggester.saveSuggestion(userId as UserId, suggestion))
    );

    res.json({ suggestions, count: suggestions.length, savedIds });
  } catch (error) {
    logger.error({ error }, 'Failed to generate suggestions');
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * Get pending actions for a user
 * GET /actions/pending/:userId
 */
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: actions, error } = await db
      .from('action_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ actions: actions || [], count: actions?.length || 0 });
  } catch (error) {
    logger.error({ error }, 'Failed to get pending actions');
    res.status(500).json({ error: 'Failed to get pending actions' });
  }
});

/**
 * Approve or reject an action
 * POST /actions/:actionId/approve
 */
router.post('/:actionId/approve', async (req, res) => {
  try {
    const { actionId } = req.params;
    const { userId, approved, modifications }: ApprovalRequest = req.body;

    // Get action
    const { data: actionData, error: fetchError } = await db
      .from('action_suggestions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !actionData) {
      return res.status(404).json({ error: 'Action not found' });
    }

    if (approved) {
      // Apply modifications if provided
      let context = actionData.context;
      if (modifications) {
        context = { ...context, payload: { ...context.payload, ...modifications } };
      }

      const action: Action = {
        id: actionData.id,
        userId: actionData.user_id,
        type: actionData.suggestion_type,
        context,
        preview: actionData.preview,
        confidence: actionData.confidence,
        requiresApproval: actionData.requires_approval,
        status: 'approved',
        canUndo: true,
        createdAt: new Date(actionData.created_at),
        updatedAt: new Date()
      };

      // Update status to approved
      await db
        .from('action_suggestions')
        .update({ status: 'approved' })
        .eq('id', actionId);

      // Execute action
      const result = await executor.execute(action);

      res.json({ success: true, result });
    } else {
      // Reject action
      await db
        .from('action_suggestions')
        .update({ status: 'rejected' })
        .eq('id', actionId);

      res.json({ success: true, rejected: true });
    }
  } catch (error) {
    logger.error({ error }, 'Failed to process approval');
    res.status(500).json({ error: 'Failed to process approval' });
  }
});

/**
 * Execute an action immediately (for autonomous actions)
 * POST /actions/:actionId/execute
 */
router.post('/:actionId/execute', async (req, res) => {
  try {
    const { actionId } = req.params;
    const { userId } = req.body;

    // Get action
    const { data: actionData, error: fetchError } = await db
      .from('action_suggestions')
      .select('*')
      .eq('id', actionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !actionData) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if action can be executed autonomously
    if (actionData.requires_approval) {
      return res.status(403).json({ error: 'Action requires approval' });
    }

    const action: Action = {
      id: actionData.id,
      userId: actionData.user_id,
      type: actionData.suggestion_type,
      context: actionData.context,
      preview: actionData.preview,
      confidence: actionData.confidence,
      requiresApproval: actionData.requires_approval,
      status: 'approved',
      canUndo: true,
      createdAt: new Date(actionData.created_at),
      updatedAt: new Date()
    };

    const result = await executor.execute(action);

    res.json({ success: result.success, result });
  } catch (error) {
    logger.error({ error }, 'Failed to execute action');
    res.status(500).json({ error: 'Failed to execute action' });
  }
});

/**
 * Undo an executed action
 * POST /actions/:actionId/undo
 */
router.post('/:actionId/undo', async (req, res) => {
  try {
    const { actionId } = req.params;
    const { userId, reason }: UndoRequest = req.body;

    const result = await executor.undo({ actionId, userId, reason });

    res.json({ success: result.success, result });
  } catch (error) {
    logger.error({ error }, 'Failed to undo action');
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to undo action' });
  }
});

/**
 * Get action history for a user
 * GET /actions/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const { data: actions, error } = await db
      .from('action_suggestions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['executed', 'undone', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      throw error;
    }

    res.json({ actions: actions || [], count: actions?.length || 0 });
  } catch (error) {
    logger.error({ error }, 'Failed to get action history');
    res.status(500).json({ error: 'Failed to get action history' });
  }
});

export default router;
