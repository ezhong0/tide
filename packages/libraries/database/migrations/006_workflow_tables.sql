-- Migration: 006_workflow_tables.sql
-- Description: Create tables for workflow management system
-- Date: 2025-10-06

-- ============================================================================
-- Workflow Definitions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,

    -- Workflow definition (JSON)
    definition JSONB NOT NULL,

    -- Ownership
    created_by UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'inactive', 'archived')),

    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    category VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Indexes
    CONSTRAINT workflow_name_version_unique UNIQUE (name, version, created_by)
);

CREATE INDEX idx_workflows_created_by ON tide.workflows(created_by);
CREATE INDEX idx_workflows_status ON tide.workflows(status);
CREATE INDEX idx_workflows_tags ON tide.workflows USING GIN(tags);
CREATE INDEX idx_workflows_created_at ON tide.workflows(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON tide.workflows
    FOR EACH ROW
    EXECUTE FUNCTION tide.update_updated_at_column();

COMMENT ON TABLE tide.workflows IS 'Workflow definitions';
COMMENT ON COLUMN tide.workflows.definition IS 'JSONB workflow definition with steps, triggers, etc.';

-- ============================================================================
-- Workflow Executions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES tide.workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tide.users(id) ON DELETE CASCADE,

    -- State
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    current_step VARCHAR(255),

    -- Context (execution state)
    context JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Execution history
    history JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- Error handling
    error_code VARCHAR(100),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,

    -- Metadata
    trigger_type VARCHAR(50),
    trigger_data JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_executions_workflow_id ON tide.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON tide.workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON tide.workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON tide.workflow_executions(created_at DESC);
CREATE INDEX idx_workflow_executions_current_step ON tide.workflow_executions(current_step);

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_executions_updated_at
    BEFORE UPDATE ON tide.workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION tide.update_updated_at_column();

COMMENT ON TABLE tide.workflow_executions IS 'Workflow execution instances and state';
COMMENT ON COLUMN tide.workflow_executions.context IS 'Execution context with variables, inputs, outputs';
COMMENT ON COLUMN tide.workflow_executions.history IS 'Array of execution history entries';

-- ============================================================================
-- Workflow Transactions Table (for Saga pattern)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.workflow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES tide.workflow_executions(id) ON DELETE CASCADE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'committed', 'rolled_back')),

    -- Transaction steps
    steps JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_workflow_transactions_execution_id ON tide.workflow_transactions(execution_id);
CREATE INDEX idx_workflow_transactions_status ON tide.workflow_transactions(status);

COMMENT ON TABLE tide.workflow_transactions IS 'Transaction log for Saga pattern with compensation';
COMMENT ON COLUMN tide.workflow_transactions.steps IS 'Array of transaction steps with execution and compensation results';

-- ============================================================================
-- Workflow Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.workflow_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES tide.workflows(id) ON DELETE CASCADE,

    -- Counts
    execution_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,

    -- Durations (milliseconds)
    avg_duration_ms INTEGER,
    p50_duration_ms INTEGER,
    p95_duration_ms INTEGER,
    p99_duration_ms INTEGER,
    min_duration_ms INTEGER,
    max_duration_ms INTEGER,

    -- Timing
    last_executed_at TIMESTAMP WITH TIME ZONE,

    -- Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT workflow_metrics_period_unique UNIQUE (workflow_id, period_start, period_end)
);

CREATE INDEX idx_workflow_metrics_workflow_id ON tide.workflow_metrics(workflow_id);
CREATE INDEX idx_workflow_metrics_period ON tide.workflow_metrics(period_start, period_end);

COMMENT ON TABLE tide.workflow_metrics IS 'Aggregated workflow execution metrics';

-- ============================================================================
-- Step Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tide.step_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES tide.workflows(id) ON DELETE CASCADE,
    step_id VARCHAR(255) NOT NULL,

    -- Counts
    execution_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,

    -- Rates
    success_rate DECIMAL(5,2),
    failure_rate DECIMAL(5,2),

    -- Durations (milliseconds)
    avg_duration_ms INTEGER,

    -- Common errors
    common_errors JSONB DEFAULT '{}'::JSONB,

    -- Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT step_metrics_period_unique UNIQUE (workflow_id, step_id, period_start, period_end)
);

CREATE INDEX idx_step_metrics_workflow_id ON tide.step_metrics(workflow_id);
CREATE INDEX idx_step_metrics_step_id ON tide.step_metrics(step_id);

COMMENT ON TABLE tide.step_metrics IS 'Per-step execution metrics';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON tide.workflows TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.workflow_executions TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.workflow_transactions TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.workflow_metrics TO tide;
GRANT SELECT, INSERT, UPDATE, DELETE ON tide.step_metrics TO tide;
