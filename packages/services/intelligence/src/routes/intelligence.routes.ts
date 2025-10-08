import { Router } from 'express';
import { logger } from '@tide/logger';
import type { UserId } from '@tide/types';
import { DailySnapshotAggregator } from '../aggregators/daily-snapshot-aggregator.js';

const router = Router();
const aggregator = new DailySnapshotAggregator();

/**
 * Generate daily snapshot for a user
 * POST /intelligence/daily-snapshot/:userId
 */
router.post('/daily-snapshot/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const options = req.body || {};

    const snapshot = await aggregator.generateSnapshot(userId as UserId, options);

    res.json({ snapshot });
  } catch (error) {
    logger.error({ error }, 'Failed to generate daily snapshot');
    res.status(500).json({ error: 'Failed to generate daily snapshot' });
  }
});

/**
 * Get latest snapshot for a user
 * GET /intelligence/daily-snapshot/:userId
 */
router.get('/daily-snapshot/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let snapshot = await aggregator.getLatestSnapshot(userId as UserId);

    // If no snapshot exists or it's old, generate a new one
    if (!snapshot || isSnapshotStale(snapshot)) {
      snapshot = await aggregator.generateSnapshot(userId as UserId);
    }

    res.json({ snapshot });
  } catch (error) {
    logger.error({ error }, 'Failed to get daily snapshot');
    res.status(500).json({ error: 'Failed to get daily snapshot' });
  }
});

/**
 * Get priority items for a user
 * GET /intelligence/priority-items/:userId
 */
router.get('/priority-items/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await aggregator.getLatestSnapshot(userId as UserId);

    if (!snapshot) {
      return res.json({ items: [] });
    }

    res.json({ items: snapshot.priorityItems });
  } catch (error) {
    logger.error({ error }, 'Failed to get priority items');
    res.status(500).json({ error: 'Failed to get priority items' });
  }
});

/**
 * Get pending decisions for a user
 * GET /intelligence/pending-decisions/:userId
 */
router.get('/pending-decisions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await aggregator.getLatestSnapshot(userId as UserId);

    if (!snapshot) {
      return res.json({ decisions: [] });
    }

    res.json({ decisions: snapshot.pendingDecisions });
  } catch (error) {
    logger.error({ error }, 'Failed to get pending decisions');
    res.status(500).json({ error: 'Failed to get pending decisions' });
  }
});

/**
 * Get predictions for a user
 * GET /intelligence/predictions/:userId
 */
router.get('/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await aggregator.getLatestSnapshot(userId as UserId);

    if (!snapshot) {
      return res.json({ predictions: [] });
    }

    res.json({ predictions: snapshot.predictions });
  } catch (error) {
    logger.error({ error }, 'Failed to get predictions');
    res.status(500).json({ error: 'Failed to get predictions' });
  }
});

/**
 * Check if snapshot is stale (older than 1 hour)
 */
function isSnapshotStale(snapshot: any): boolean {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return new Date(snapshot.generatedAt) < oneHourAgo;
}

export default router;
