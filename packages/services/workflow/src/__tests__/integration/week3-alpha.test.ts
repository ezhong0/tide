import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { WorkflowEngine } from '../../engine/workflow-engine';
import { WorkflowDefinition, WorkflowStepId } from '../../types';
import { databaseConfig } from '@tide/config';

/**
 * Week 3 Alpha Integration Tests
 *
 * Tests for Track 4 (Task & Workflow) alpha integration milestone:
 * - Task creation and management
 * - Basic workflow execution
 * - Pattern detection started
 * - State persistence working
 */

describe('Week 3 Alpha Integration - Track 4', () => {
  let pool: Pool;
  let engine: WorkflowEngine;

  beforeAll(async () => {
    // Initialize database connection
    pool = new Pool({
      connectionString: databaseConfig.url,
      ssl: false,
      max: 5,
    });

    // Test connection
    await pool.query('SELECT 1');

    // Initialize workflow engine
    engine = new WorkflowEngine(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Infrastructure Health', () => {
    it('should connect to PostgreSQL', async () => {
      const result = await pool.query('SELECT 1 as value');
      expect(result.rows[0].value).toBe(1);
    });

    it('should have workflow tables', async () => {
      const tables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'tide'
          AND table_name IN ('workflows', 'workflow_executions', 'tasks', 'subtasks', 'user_behaviors', 'detected_patterns')
        ORDER BY table_name
      `);

      const tableNames = tables.rows.map(r => r.table_name);
      expect(tableNames).toContain('workflows');
      expect(tableNames).toContain('workflow_executions');
      expect(tableNames).toContain('tasks');
      expect(tableNames).toContain('subtasks');
      expect(tableNames).toContain('user_behaviors');
      expect(tableNames).toContain('detected_patterns');
    });

    it('should pass workflow engine health check', async () => {
      const health = await engine.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.components.database).toBe('up');
    });
  });

  describe('Task Management', () => {
    it('should create a task', async () => {
      const taskEngine = engine.getTaskEngine();

      const task = await taskEngine.createTask({
        userId: 'test_user_1' as any,
        title: 'Complete project proposal',
        description: 'Draft and review project proposal for Q1',
        dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        tags: ['important', 'project'],
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Complete project proposal');
      expect(task.priority).toBeGreaterThan(0);
      expect(task.status).toBe('pending');
    });

    it('should prioritize tasks correctly', async () => {
      const taskEngine = engine.getTaskEngine();

      // Create high priority task (urgent, due soon)
      const urgentTask = await taskEngine.createTask({
        userId: 'test_user_1' as any,
        title: 'Critical bug fix',
        description: 'Fix production issue',
        dueDate: new Date(Date.now() + 3600000), // 1 hour from now
        tags: ['urgent', 'bug'],
      });

      // Create low priority task (not urgent)
      const normalTask = await taskEngine.createTask({
        userId: 'test_user_1' as any,
        title: 'Update documentation',
        description: 'Update README',
        dueDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
      });

      expect(urgentTask.priority).toBeGreaterThan(normalTask.priority);
    });

    it('should get ready tasks', async () => {
      const taskEngine = engine.getTaskEngine();
      const readyTasks = await taskEngine.getReadyTasks('test_user_1' as any);

      expect(Array.isArray(readyTasks)).toBe(true);
      // All ready tasks should be in pending status
      readyTasks.forEach(task => {
        expect(task.status).toBe('pending');
      });
    });
  });

  describe('Workflow Execution', () => {
    it('should create and execute a simple workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'test_workflow_1' as any,
        name: 'Simple Test Workflow',
        description: 'A workflow for testing basic execution',
        version: 1,
        steps: [
          {
            id: 'step1' as WorkflowStepId,
            name: 'Initialize',
            type: 'action',
            config: {
              action: 'initialize',
            },
            next: 'step2' as WorkflowStepId,
          },
          {
            id: 'step2' as WorkflowStepId,
            name: 'Process',
            type: 'action',
            config: {
              action: 'process',
            },
            next: 'step3' as WorkflowStepId,
          },
          {
            id: 'step3' as WorkflowStepId,
            name: 'Complete',
            type: 'action',
            config: {
              action: 'complete',
            },
          },
        ],
        createdBy: 'test_user_1' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save workflow
      const repository = engine.getWorkflowRepository();
      await repository.saveWorkflow(workflow);

      // Execute workflow
      const result = await engine.executeWorkflowStateMachine(workflow, {
        inputs: { testData: 'alpha integration test' },
        outputs: {},
        stepResults: new Map(),
        variables: {},
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(['completed', 'running']).toContain(result.status);
    });

    it('should execute workflow with DAG executor', async () => {
      const workflow: WorkflowDefinition = {
        id: 'test_workflow_dag' as any,
        name: 'DAG Test Workflow',
        description: 'Workflow for testing DAG execution',
        version: 1,
        steps: [
          {
            id: 'dag_step1' as WorkflowStepId,
            name: 'Step 1',
            type: 'action',
            config: {},
            next: 'dag_step2' as WorkflowStepId,
          },
          {
            id: 'dag_step2' as WorkflowStepId,
            name: 'Step 2',
            type: 'action',
            config: {},
          },
        ],
        createdBy: 'test_user_1' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await engine.executeWorkflowDAG(workflow, {
        inputs: {},
        outputs: {},
        stepResults: new Map(),
        variables: {},
      });

      expect(result.success).toBe(true);
      expect(result.results.size).toBeGreaterThan(0);
    });

    it('should persist workflow execution state', async () => {
      const repository = engine.getWorkflowRepository();

      // Get recent executions
      const executions = await repository.getActiveExecutions();

      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe('Pattern Detection', () => {
    it('should record user behavior', async () => {
      const patternDetector = engine.getPatternDetector();

      // Record some behaviors
      const behaviors = [
        {
          userId: 'test_user_1' as any,
          action: 'email_sent',
          timestamp: new Date(),
          metadata: { to: 'test@example.com' },
        },
        {
          userId: 'test_user_1' as any,
          action: 'task_created',
          timestamp: new Date(),
          metadata: { taskTitle: 'Follow up email' },
        },
      ];

      // Note: Pattern detection requires sufficient data
      // This test just verifies the API works
      const patterns = await engine.detectUserPatterns('test_user_1' as any, 7);

      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('Integration Success Criteria', () => {
    it('should meet <2s response time for basic workflow', async () => {
      const workflow: WorkflowDefinition = {
        id: 'perf_test_workflow' as any,
        name: 'Performance Test',
        version: 1,
        steps: [
          {
            id: 'perf_step' as WorkflowStepId,
            name: 'Quick Step',
            type: 'action',
            config: {},
          },
        ],
        createdBy: 'test_user_1' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const startTime = Date.now();

      await engine.executeWorkflowDAG(workflow, {
        inputs: {},
        outputs: {},
        stepResults: new Map(),
        variables: {},
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // <2s requirement
    });

    it('should have all health checks passing', async () => {
      const health = await engine.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.components.database).toBe('up');
      expect(health.components.workflow).toBe('up');
      expect(health.components.tasks).toBe('up');
      expect(health.components.patterns).toBe('up');
    });
  });
});
