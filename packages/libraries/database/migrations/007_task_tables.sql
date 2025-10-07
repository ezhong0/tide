-- Migration: 007_task_tables.sql
-- Description: Create tables for intelligent task management system
-- Date: 2025-10-06

-- ============================================================================
-- Tasks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Scheduling
    priority DECIMAL(3,2) NOT NULL DEFAULT 0.50
        CHECK (priority >= 0.00 AND priority <= 1.00),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER,

    -- Assignment
    assignee UUID REFERENCES tide.users(id) ON DELETE SET NULL,

    -- Organization
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    project VARCHAR(255),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'blocked', 'completed', 'cancelled', 'deferred')),
    progress INTEGER NOT NULL DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),

    -- Parent-child relationship
    parent_task_id UUID REFERENCES tide.tasks(id) ON DELETE CASCADE,

    -- Metadata
    complexity DECIMAL(3,2)
        CHECK (complexity >= 0.00 AND complexity <= 1.00),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tasks_user_id ON tide.tasks(user_id);
CREATE INDEX idx_tasks_assignee ON tide.tasks(assignee);
CREATE INDEX idx_tasks_status ON tide.tasks(status);
CREATE INDEX idx_tasks_priority ON tide.tasks(priority DESC);
CREATE INDEX idx_tasks_due_date ON tide.tasks(due_date);
CREATE INDEX idx_tasks_tags ON tide.tasks USING GIN(tags);
CREATE INDEX idx_tasks_project ON tide.tasks(project);
CREATE INDEX idx_tasks_parent_task_id ON tide.tasks(parent_task_id);
CREATE INDEX idx_tasks_created_at ON tide.tasks(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tide.tasks
    FOR EACH ROW
    EXECUTE FUNCTION tide.update_updated_at_column();

COMMENT ON TABLE tide.tasks IS 'Intelligent task management with smart prioritization';
COMMENT ON COLUMN tide.tasks.priority IS 'Dynamic priority score (0.0-1.0) calculated by AI';
COMMENT ON COLUMN tide.tasks.complexity IS 'Estimated task complexity (0.0-1.0)';
COMMENT ON COLUMN tide.tasks.metadata IS 'Additional metadata including source, pattern info, etc.';

-- ============================================================================
-- Subtasks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES tide.tasks(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Order
    order_index INTEGER NOT NULL,

    -- Estimation
    estimated_time_minutes INTEGER,

    -- Assignment
    assignee UUID REFERENCES tide.users(id) ON DELETE SET NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'blocked', 'completed', 'cancelled')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT subtask_order_unique UNIQUE (parent_id, order_index)
);

CREATE INDEX idx_subtasks_parent_id ON tide.subtasks(parent_id);
CREATE INDEX idx_subtasks_status ON tide.subtasks(status);
CREATE INDEX idx_subtasks_assignee ON tide.subtasks(assignee);

CREATE TRIGGER update_subtasks_updated_at
    BEFORE UPDATE ON tide.subtasks
    FOR EACH ROW
    EXECUTE FUNCTION tide.update_updated_at_column();

COMMENT ON TABLE tide.subtasks IS 'Auto-decomposed subtasks from complex parent tasks';

-- ============================================================================
-- Task Dependencies Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tide.tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tide.tasks(id) ON DELETE CASCADE,

    -- Dependency type
    dependency_type VARCHAR(50) NOT NULL DEFAULT 'blocks'
        CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT task_dependency_unique UNIQUE (task_id, depends_on_task_id),
    CONSTRAINT task_dependency_no_self CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task_id ON tide.task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON tide.task_dependencies(depends_on_task_id);

COMMENT ON TABLE tide.task_dependencies IS 'Task dependency relationships for intelligent scheduling';

-- ============================================================================
-- Subtask Dependencies Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.subtask_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subtask_id UUID NOT NULL REFERENCES tide.subtasks(id) ON DELETE CASCADE,
    depends_on_subtask_id UUID NOT NULL REFERENCES tide.subtasks(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT subtask_dependency_unique UNIQUE (subtask_id, depends_on_subtask_id),
    CONSTRAINT subtask_dependency_no_self CHECK (subtask_id != depends_on_subtask_id)
);

CREATE INDEX idx_subtask_dependencies_subtask_id ON tide.subtask_dependencies(subtask_id);
CREATE INDEX idx_subtask_dependencies_depends_on ON tide.subtask_dependencies(depends_on_subtask_id);

COMMENT ON TABLE tide.subtask_dependencies IS 'Subtask dependency relationships';

-- ============================================================================
-- Task Execution History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.task_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tide.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Result
    success BOOLEAN NOT NULL,
    output JSONB,
    error TEXT,

    -- Timing
    duration_ms INTEGER NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Context
    context JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_task_executions_task_id ON tide.task_executions(task_id);
CREATE INDEX idx_task_executions_user_id ON tide.task_executions(user_id);
CREATE INDEX idx_task_executions_executed_at ON tide.task_executions(executed_at DESC);

COMMENT ON TABLE tide.task_executions IS 'Task execution history for learning and optimization';

-- ============================================================================
-- Task Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.task_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Completion metrics
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5,2),

    -- Time metrics
    avg_completion_time_minutes INTEGER,
    total_time_spent_minutes INTEGER,

    -- Priority metrics
    avg_priority DECIMAL(3,2),
    high_priority_completed INTEGER NOT NULL DEFAULT 0,

    -- Accuracy metrics
    estimation_accuracy DECIMAL(5,2),
    on_time_rate DECIMAL(5,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT task_metrics_period_unique UNIQUE (user_id, period_start, period_end)
);

CREATE INDEX idx_task_metrics_user_id ON tide.task_metrics(user_id);
CREATE INDEX idx_task_metrics_period ON tide.task_metrics(period_start, period_end);

COMMENT ON TABLE tide.task_metrics IS 'Aggregated task metrics for analytics and insights';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON tide.tasks TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.subtasks TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.task_dependencies TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.subtask_dependencies TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.task_executions TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.task_metrics TO tide;
