import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { kafkaConfig, env } from '@tide/config';
import { SupabaseConnectionManager } from '@tide/database';
import { ServiceBase, type HealthStatus } from '@tide/base';
import {
  authenticateJWT,
  moderateRateLimit,
  errorHandler,
  notFoundHandler,
} from '@tide/middleware';
import { KafkaEventBus } from './events/kafka-event-bus.js';
import { WorkflowStateMachine } from './core/state-machine.js';
import { DAGExecutor } from './core/dag-executor.js';
import { SupabaseStatePersistence } from './persistence/supabase-state-persistence.js';

/**
 * Workflow Service
 *
 * Intelligent workflow automation and task management service
 * Uses Supabase-first architecture (ADR-001)
 * Extends ServiceBase for graceful shutdown and resource management
 */

// Initialize Supabase repositories and engine components (needed for imports)
import {
  SupabaseTaskRepository,
  SupabaseWorkflowRepository,
  SupabasePatternRepository
} from './supabase-adapter.js';
import { TaskEngine, TaskPrioritizer, TaskDecomposer } from './tasks/task-engine.js';
import { PatternDetector, BehaviorAnalyzer } from './patterns/pattern-detector.js';

class WorkflowService extends ServiceBase {
  private taskRepository!: SupabaseTaskRepository;
  private workflowRepository!: SupabaseWorkflowRepository;
  private patternRepository!: SupabasePatternRepository;
  private taskEngine!: TaskEngine;
  private patternDetector!: PatternDetector;
  private statePersistence!: SupabaseStatePersistence;
  private dagExecutor!: DAGExecutor;
  private eventBus: KafkaEventBus | null = null;

  constructor() {
    super({
      name: 'workflow',
      version: '0.1.0',
      port: env.PORT || 3005,
      shutdownTimeout: 10000, // 10 seconds for graceful shutdown
    });
  }

  /**
   * Initialize service resources
   */
  protected async initialize(): Promise<void> {
    // Database connection - Use SupabaseConnectionManager singleton
    const supabase = SupabaseConnectionManager.getInstance(true);

    // Initialize Supabase repositories
    this.taskRepository = new SupabaseTaskRepository(supabase);
    this.workflowRepository = new SupabaseWorkflowRepository(supabase);
    this.patternRepository = new SupabasePatternRepository(supabase);

    // Initialize workflow engine components
    const prioritizer = new TaskPrioritizer();
    const decomposer = new TaskDecomposer();
    this.taskEngine = new TaskEngine(this.taskRepository as any, prioritizer, decomposer);

    const behaviorAnalyzer = new BehaviorAnalyzer();
    this.patternDetector = new PatternDetector(this.patternRepository as any, behaviorAnalyzer);

    // Initialize workflow execution engines
    this.statePersistence = new SupabaseStatePersistence(supabase);
    this.dagExecutor = new DAGExecutor();

    this.logger.info('Workflow engine initialized with Supabase (State Machine + DAG Executor ready)');

    // Initialize Kafka event bus (only if Kafka is configured AND enabled)
    const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
    if (kafkaConfig && kafkaEnabled) {
      this.eventBus = new KafkaEventBus({
        brokers: kafkaConfig.brokers,
        clientId: 'workflow-service',
        groupId: 'workflow-service-group',
      });
      await this.eventBus.connect();
      this.logger.info('Kafka connected');
    } else if (!kafkaEnabled) {
      this.logger.info('Kafka disabled - event publishing disabled');
    } else {
      this.logger.warn('No KAFKA_BROKERS configured - event publishing disabled');
    }

    // Register cleanup resources
    this.registerResource({
      name: 'database',
      cleanup: async () => {
        await SupabaseConnectionManager.cleanup();
      },
    });

    if (this.eventBus) {
      this.registerResource({
        name: 'kafka',
        cleanup: async () => {
          if (this.eventBus) {
            await this.eventBus.disconnect();
          }
        },
      });
    }

    this.logger.info('Workflow service initialized successfully');
  }

  /**
   * Setup Express routes
   */
  protected setupRoutes(app: express.Application): void {
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(moderateRateLimit);

    // Request logging
    app.use((req, res, next) => {
      this.logger.info({
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
      }, 'Incoming request');
      next();
    });

    // ============================================================================
    // Task Endpoints
    // ============================================================================

    // Create task
    app.post('/tasks', authenticateJWT, async (req, res) => {
      try {
        const user = (req as any).user;
        const { title, description, dueDate, tags, priority, project } = req.body;

        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        const task = await this.taskEngine.createTask({
          userId: user.id,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags,
          project,
        });

        res.status(201).json(task);
      } catch (error) {
        this.logger.error({ error }, 'Failed to create task');
        res.status(500).json({ error: 'Failed to create task' });
      }
    });

    // Get ready tasks
    app.get('/tasks/ready', authenticateJWT, async (req, res) => {
      try {
        const user = (req as any).user;
        const tasks = await this.taskEngine.getReadyTasks(user.id);
        res.json(tasks);
      } catch (error) {
        this.logger.error({ error }, 'Failed to get ready tasks');
        res.status(500).json({ error: 'Failed to get ready tasks' });
      }
    });

    // Get task by ID
    app.get('/tasks/:id', authenticateJWT, async (req, res) => {
      try {
        const task = await this.taskRepository.getTask(req.params.id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Verify ownership
        const user = (req as any).user;
        if (task.userId !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        res.json(task);
      } catch (error) {
        this.logger.error({ error }, 'Failed to get task');
        res.status(500).json({ error: 'Failed to get task' });
      }
    });

    // Update task
    app.put('/tasks/:id', authenticateJWT, async (req, res) => {
      try {
        const task = await this.taskRepository.getTask(req.params.id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Verify ownership
        const user = (req as any).user;
        if (task.userId !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Update task
        const updates = { ...task, ...req.body };
        await this.taskRepository.updateTask(updates);

        const updated = await this.taskRepository.getTask(req.params.id);
        res.json(updated);
      } catch (error) {
        this.logger.error({ error }, 'Failed to update task');
        res.status(500).json({ error: 'Failed to update task' });
      }
    });

    // Delete task
    app.delete('/tasks/:id', authenticateJWT, async (req, res) => {
      try {
        const task = await this.taskRepository.getTask(req.params.id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Verify ownership
        const user = (req as any).user;
        if (task.userId !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        await this.taskRepository.deleteTask(req.params.id);
        res.status(204).send();
      } catch (error) {
        this.logger.error({ error }, 'Failed to delete task');
        res.status(500).json({ error: 'Failed to delete task' });
      }
    });

    // ============================================================================
    // Workflow Endpoints
    // ============================================================================

    // Create workflow
    app.post('/workflows', authenticateJWT, async (req, res) => {
      try {
        const user = (req as any).user;
        const { name, description, steps } = req.body;

        if (!name || !steps || !Array.isArray(steps)) {
          return res.status(400).json({ error: 'Name and steps are required' });
        }

        const workflow = {
          id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          steps,
          version: 1,
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.workflowRepository.saveWorkflow(workflow);
        res.status(201).json(workflow);
      } catch (error) {
        this.logger.error({ error }, 'Failed to create workflow');
        res.status(500).json({ error: 'Failed to create workflow' });
      }
    });

    // Get workflow
    app.get('/workflows/:id', authenticateJWT, async (req, res) => {
      try {
        const workflow = await this.workflowRepository.getWorkflow(req.params.id);
        if (!workflow) {
          return res.status(404).json({ error: 'Workflow not found' });
        }

        // Verify ownership
        const user = (req as any).user;
        if (workflow.createdBy !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        res.json(workflow);
      } catch (error) {
        this.logger.error({ error }, 'Failed to get workflow');
        res.status(500).json({ error: 'Failed to get workflow' });
      }
    });

    // Execute workflow - NOW FULLY FUNCTIONAL with State Machine or DAG Executor!
    app.post('/workflows/:id/execute', authenticateJWT, async (req, res) => {
      try {
        const user = (req as any).user;
        const { strategy = 'state-machine' } = req.body; // 'state-machine' or 'dag'

        const workflow = await this.workflowRepository.getWorkflow(req.params.id);

        if (!workflow) {
          return res.status(404).json({ error: 'Workflow not found' });
        }

        if (workflow.createdBy !== user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        if (strategy === 'dag') {
          // DAG execution for parallel workflows
          this.logger.info({ workflowId: workflow.id, strategy: 'dag' }, 'Executing workflow with DAG executor');

          const dag = this.dagExecutor.buildDAG(workflow);
          const plan = this.dagExecutor.createExecutionPlan(dag);

          const initialContext: any = {
            inputs: req.body.context || {},
            outputs: {},
            stepResults: new Map(),
            variables: { userId: user.id },
          };

          const results = await this.dagExecutor.execute(plan, initialContext);

          // Store execution results
          const execution = await this.workflowRepository.createExecution({
            workflow_id: workflow.id,
            user_id: user.id,
            status: 'completed',
            context: {
              inputs: initialContext.inputs,
              outputs: initialContext.outputs,
              stepResults: Object.fromEntries(results),
            },
            completed_at: new Date().toISOString(),
          });

          return res.json({
            execution,
            results: Object.fromEntries(results),
            strategy: 'dag',
            message: 'Workflow executed successfully with DAG executor',
          });
        } else {
          // State machine execution (default)
          this.logger.info({ workflowId: workflow.id, strategy: 'state-machine' }, 'Executing workflow with state machine');

          const stateMachine = new WorkflowStateMachine(workflow, this.statePersistence);
          const workflowState = await stateMachine.createWorkflow();

          // Set initial context
          workflowState.context.inputs = req.body.context || {};
          workflowState.context.variables = { userId: user.id };

          // Start execution (async - runs in background)
          stateMachine.start(workflowState.id).catch(error => {
            this.logger.error({ error, executionId: workflowState.id }, 'Workflow execution failed');
          });

          return res.json({
            executionId: workflowState.id,
            workflowId: workflow.id,
            status: workflowState.status,
            currentStep: workflowState.currentStep,
            strategy: 'state-machine',
            message: 'Workflow execution started (running asynchronously)',
          });
        }
      } catch (error) {
        this.logger.error({ error }, 'Failed to execute workflow');
        res.status(500).json({ error: 'Failed to execute workflow' });
      }
    });

    // Get execution status
    app.get('/workflows/:workflowId/executions/:executionId', authenticateJWT, async (req, res) => {
      try {
        const state = await this.statePersistence.load(req.params.executionId);

        if (!state) {
          return res.status(404).json({ error: 'Execution not found' });
        }

        res.json({
          id: state.id,
          workflowId: state.workflowId,
          status: state.status,
          currentStep: state.currentStep,
          history: state.history,
          context: {
            inputs: state.context.inputs,
            outputs: state.context.outputs,
            variables: state.context.variables,
          },
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
        });
      } catch (error) {
        this.logger.error({ error }, 'Failed to get execution status');
        res.status(500).json({ error: 'Failed to get execution status' });
      }
    });

    // Pause/Resume/Cancel execution
    app.post('/workflows/:workflowId/executions/:executionId/:action', authenticateJWT, async (req, res) => {
      try {
        const { action } = req.params;
        const state = await this.statePersistence.load(req.params.executionId);

        if (!state) {
          return res.status(404).json({ error: 'Execution not found' });
        }

        const workflow = await this.workflowRepository.getWorkflow(state.workflowId);
        const stateMachine = new WorkflowStateMachine(workflow, this.statePersistence);

        let updatedState;
        switch (action) {
          case 'pause':
            updatedState = await stateMachine.pause(state.id);
            break;
          case 'resume':
            updatedState = await stateMachine.resume(state.id);
            break;
          case 'cancel':
            updatedState = await stateMachine.cancel(state.id);
            break;
          default:
            return res.status(400).json({ error: 'Invalid action. Use: pause, resume, or cancel' });
        }

        res.json({
          id: updatedState.id,
          status: updatedState.status,
          currentStep: updatedState.currentStep,
          message: `Workflow ${action}d successfully`,
        });
      } catch (error) {
        this.logger.error({ error }, 'Failed to control execution');
        res.status(500).json({ error: 'Failed to control execution' });
      }
    });

    // ============================================================================
    // Pattern Detection Endpoints
    // ============================================================================

    // Detect patterns
    app.get('/patterns/detect', authenticateJWT, async (req, res) => {
      try {
        const user = (req as any).user;
        const days = parseInt(req.query.days as string) || 30;

        const patterns = await this.patternDetector.detectPatterns(user.id, days);
        res.json(patterns);
      } catch (error) {
        this.logger.error({ error }, 'Failed to detect patterns');
        res.status(500).json({ error: 'Failed to detect patterns' });
      }
    });

    // 404 handler - must be before error handler
    app.use(notFoundHandler);

    // Error handler - must be last
    app.use(errorHandler);
  }

  /**
   * Custom health checks
   */
  protected async healthCheck(): Promise<Partial<HealthStatus>> {
    const dbStatus = SupabaseConnectionManager.getStatus();

    return {
      checks: {
        database: {
          status: dbStatus.serviceRole ? 'up' : 'down',
          details: dbStatus,
        },
        workflow: {
          status: 'up',
          details: { dagExecutor: 'ready', stateMachine: 'ready' },
        },
        tasks: { status: 'up' },
        patterns: { status: 'up' },
        kafka: {
          status: this.eventBus ? 'up' : 'disabled',
        },
      },
    };
  }
}

// Start the service
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  const service = new WorkflowService();

  service.start(app).catch((error) => {
    console.error('Failed to start workflow service:', error);
    process.exit(1);
  });
}

export { WorkflowService };
