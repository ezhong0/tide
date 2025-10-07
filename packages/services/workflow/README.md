# @tide/workflow-service

Intelligent workflow automation and task management service for the Tide platform.

## Features

### Week 1-3: Foundation
- ✅ **Workflow State Machine**: DAG-based workflow execution with compensation
- ✅ **Task Management**: Smart prioritization, dependency management, auto-decomposition
- ✅ **Pattern Detection**: Temporal, sequential, conditional pattern recognition

### Week 4-6: Advanced Automation
- 🔨 **Complex Orchestration**: Multi-step workflows, Saga pattern, parallel execution
- 🔨 **Automation Intelligence**: Pattern-based workflow generation
- 🔨 **Learning System**: Execution analysis and optimization

### Week 7-9: Enterprise Features
- 🔨 **Team Workflows**: Role assignment, handoffs, approvals
- 🔨 **Integration Platform**: External service connectors (Zapier-like)
- 🔨 **Process Mining**: Workflow variant analysis and optimization

### Week 10-12: Production Excellence
- 🔨 **Fault Tolerance**: Checkpointing, circuit breakers, retry management
- 🔨 **Analytics**: Metrics, dashboards, alerting
- 🔨 **Production**: 10k workflows/sec, 99.99% uptime

## Architecture

```
workflow/
├── core/           # Core workflow engine
│   ├── state-machine.ts      # State management
│   ├── dag-executor.ts       # DAG execution
│   └── compensation.ts       # Rollback handlers
├── engine/         # Workflow orchestration
│   ├── orchestrator.ts       # Main orchestrator
│   ├── executor.ts           # Step executor
│   └── saga.ts              # Saga pattern
├── tasks/          # Task management
│   ├── manager.ts           # Task manager
│   ├── prioritizer.ts       # Smart prioritization
│   └── dependencies.ts      # Dependency graph
├── patterns/       # Pattern detection
│   ├── detector.ts          # Pattern detector
│   ├── temporal.ts          # Temporal patterns
│   └── sequential.ts        # Sequential patterns
├── integrations/   # External integrations
│   ├── platform.ts          # Integration platform
│   └── builder.ts           # Integration builder
└── analytics/      # Analytics & monitoring
    ├── metrics.ts           # Metrics collection
    └── dashboard.ts         # Dashboard builder
```

## Installation

```bash
pnpm install
```

## Development

```bash
# Run in development mode
pnpm dev

# Build
pnpm build

# Test
pnpm test
```

## Usage

```typescript
import { WorkflowEngine } from '@tide/workflow-service';

const engine = new WorkflowEngine();

// Create and execute workflow
const workflow = await engine.createWorkflow({
  name: 'Quarterly Board Meeting Prep',
  steps: [
    { id: 'gather_metrics', type: 'data_collection' },
    { id: 'create_slides', type: 'document_generation' },
    { id: 'review_approval', type: 'approval' },
    { id: 'schedule_meeting', type: 'calendar' }
  ]
});

await workflow.start();
```

## API Endpoints

### Workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow status
- `POST /api/workflows/:id/start` - Start workflow
- `POST /api/workflows/:id/pause` - Pause workflow
- `DELETE /api/workflows/:id` - Cancel workflow

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Patterns
- `GET /api/patterns/detect` - Detect patterns for user
- `GET /api/patterns/suggestions` - Get automation suggestions

## Event Types

### Published Events
- `workflow.created` - Workflow created
- `workflow.started` - Workflow started
- `workflow.completed` - Workflow completed
- `workflow.failed` - Workflow failed
- `task.created` - Task created
- `task.completed` - Task completed
- `pattern.detected` - Pattern detected

### Consumed Events
- `email.received` - Email events from Track 3
- `calendar.event_created` - Calendar events from Track 3
- `ai.intent_detected` - AI events from Track 2

## Database Schema

```sql
-- Workflows
CREATE TABLE tide.workflows (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES tide.users(id),
  name VARCHAR(255) NOT NULL,
  definition JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions
CREATE TABLE tide.workflow_executions (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES tide.workflows(id),
  state JSONB NOT NULL,
  current_step VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Tasks
CREATE TABLE tide.tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES tide.users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority DECIMAL(3,2),
  due_date TIMESTAMP,
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Success Metrics

- ✅ Detect patterns in 3 interactions
- ✅ Execute 10+ step workflows
- ✅ >98% completion rate
- ✅ <5min avg execution time
- ✅ Suggest 5+ automations/user/week

## License

MIT
