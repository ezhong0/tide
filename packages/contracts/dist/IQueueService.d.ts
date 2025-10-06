/**
 * Queue Service Contract
 * Background job processing with BullMQ
 *
 * Performance Requirements:
 * - Enqueue: <20ms
 * - Dequeue: <50ms
 * - Job completion: Based on job type
 */
import { Result, Timestamp } from '@tide/types';
export interface IQueueService {
    /**
     * Add a job to the queue
     * @param queueName Name of the queue
     * @param jobName Job identifier
     * @param data Job data
     * @param options Job options
     * @returns Job ID
     * @performance <20ms
     */
    enqueue<T>(queueName: string, jobName: string, data: T, options?: JobOptions): Promise<Result<string>>;
    /**
     * Add multiple jobs to the queue
     * @param queueName Name of the queue
     * @param jobs Array of jobs
     * @returns Array of job IDs
     * @performance <50ms for 10 jobs
     */
    enqueueBatch<T>(queueName: string, jobs: Array<{
        name: string;
        data: T;
        options?: JobOptions;
    }>): Promise<Result<string[]>>;
    /**
     * Schedule a job for future execution
     * @param queueName Name of the queue
     * @param jobName Job identifier
     * @param data Job data
     * @param delay Delay in milliseconds or specific timestamp
     * @returns Job ID
     * @performance <20ms
     */
    schedule<T>(queueName: string, jobName: string, data: T, delay: number | Date): Promise<Result<string>>;
    /**
     * Create a recurring job
     * @param queueName Name of the queue
     * @param jobName Job identifier
     * @param data Job data
     * @param pattern Cron pattern or repeat options
     * @returns Job ID
     * @performance <30ms
     */
    recurring<T>(queueName: string, jobName: string, data: T, pattern: string | RepeatOptions): Promise<Result<string>>;
    /**
     * Process jobs from a queue
     * @param queueName Name of the queue
     * @param processor Job processor function
     * @param options Worker options
     * @returns Worker handle
     * @performance Real-time processing
     */
    process<T>(queueName: string, processor: JobProcessor<T>, options?: WorkerOptions): Promise<Result<Worker>>;
    /**
     * Get job by ID
     * @param queueName Name of the queue
     * @param jobId Job identifier
     * @returns Job details
     * @performance <30ms
     */
    getJob<T>(queueName: string, jobId: string): Promise<Result<Job<T> | null>>;
    /**
     * Get jobs by state
     * @param queueName Name of the queue
     * @param state Job state
     * @param limit Maximum number of jobs
     * @returns Array of jobs
     * @performance <50ms for 100 jobs
     */
    getJobs<T>(queueName: string, state: JobState, limit?: number): Promise<Result<Job<T>[]>>;
    /**
     * Cancel a job
     * @param queueName Name of the queue
     * @param jobId Job to cancel
     * @returns Success status
     * @performance <20ms
     */
    cancel(queueName: string, jobId: string): Promise<Result<void>>;
    /**
     * Retry a failed job
     * @param queueName Name of the queue
     * @param jobId Job to retry
     * @returns Success status
     * @performance <30ms
     */
    retry(queueName: string, jobId: string): Promise<Result<void>>;
    /**
     * Remove a job
     * @param queueName Name of the queue
     * @param jobId Job to remove
     * @returns Success status
     * @performance <20ms
     */
    remove(queueName: string, jobId: string): Promise<Result<void>>;
    /**
     * Pause a queue
     * @param queueName Name of the queue
     * @returns Success status
     * @performance <20ms
     */
    pauseQueue(queueName: string): Promise<Result<void>>;
    /**
     * Resume a paused queue
     * @param queueName Name of the queue
     * @returns Success status
     * @performance <20ms
     */
    resumeQueue(queueName: string): Promise<Result<void>>;
    /**
     * Clean completed/failed jobs
     * @param queueName Name of the queue
     * @param grace Grace period in milliseconds
     * @param limit Maximum number to clean
     * @param status Job status to clean
     * @returns Number of jobs cleaned
     * @performance <100ms for 1000 jobs
     */
    clean(queueName: string, grace: number, limit?: number, status?: 'completed' | 'failed'): Promise<Result<number>>;
    /**
     * Drain a queue (remove all jobs)
     * @param queueName Name of the queue
     * @returns Number of jobs removed
     * @performance <200ms for 1000 jobs
     */
    drain(queueName: string): Promise<Result<number>>;
    /**
     * Get queue statistics
     * @param queueName Name of the queue
     * @returns Queue statistics
     * @performance <50ms
     */
    getQueueStats(queueName: string): Promise<Result<QueueStats>>;
    /**
     * Get all queues
     * @returns Array of queue names
     * @performance <30ms
     */
    listQueues(): Promise<Result<string[]>>;
    /**
     * Create a flow (job dependencies)
     * @param flow Flow definition
     * @returns Flow ID
     * @performance <50ms
     */
    createFlow(flow: FlowDefinition): Promise<Result<string>>;
    /**
     * Subscribe to job events
     * @param queueName Name of the queue
     * @param event Event type
     * @param handler Event handler
     * @returns Unsubscribe function
     * @performance Real-time
     */
    subscribe(queueName: string, event: JobEvent, handler: JobEventHandler): Result<() => void>;
    /**
     * Get job progress
     * @param queueName Name of the queue
     * @param jobId Job identifier
     * @returns Progress percentage (0-100)
     * @performance <20ms
     */
    getProgress(queueName: string, jobId: string): Promise<Result<number>>;
    /**
     * Update job progress
     * @param queueName Name of the queue
     * @param jobId Job identifier
     * @param progress Progress percentage
     * @returns Success status
     * @performance <20ms
     */
    updateProgress(queueName: string, jobId: string, progress: number): Promise<Result<void>>;
    /**
     * Add job log entry
     * @param queueName Name of the queue
     * @param jobId Job identifier
     * @param log Log entry
     * @returns Success status
     * @performance <20ms
     */
    addLog(queueName: string, jobId: string, log: string): Promise<Result<void>>;
    /**
     * Get job logs
     * @param queueName Name of the queue
     * @param jobId Job identifier
     * @returns Array of log entries
     * @performance <30ms
     */
    getLogs(queueName: string, jobId: string): Promise<Result<string[]>>;
}
export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: BackoffOptions;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    timeout?: number;
}
export interface BackoffOptions {
    type: 'fixed' | 'exponential';
    delay: number;
}
export interface RepeatOptions {
    pattern?: string;
    every?: number;
    limit?: number;
    endDate?: Date | number;
}
export interface Job<T> {
    id: string;
    name: string;
    data: T;
    opts: JobOptions;
    progress: number;
    delay: number;
    timestamp: Timestamp;
    attemptsMade: number;
    failedReason?: string;
    stacktrace?: string;
    returnvalue?: unknown;
    finishedOn?: Timestamp;
    processedOn?: Timestamp;
}
export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
export type JobProcessor<T> = (job: Job<T>) => Promise<unknown>;
export interface WorkerOptions {
    concurrency?: number;
    limiter?: {
        max: number;
        duration: number;
    };
    skipDelayCheck?: boolean;
    drainDelay?: number;
    stalledInterval?: number;
    maxStalledCount?: number;
}
export interface Worker {
    id: string;
    pause(): Promise<void>;
    resume(): Promise<void>;
    close(): Promise<void>;
    isRunning(): boolean;
    isPaused(): boolean;
}
export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
    rate: {
        processed: number;
        failed: number;
    };
    latency: {
        p50: number;
        p95: number;
        p99: number;
    };
}
export interface FlowDefinition {
    name: string;
    jobs: FlowJob[];
    opts?: FlowOptions;
}
export interface FlowJob {
    name: string;
    queueName: string;
    data: unknown;
    children?: FlowJob[];
    opts?: JobOptions;
}
export interface FlowOptions {
    attempts?: number;
    backoff?: BackoffOptions;
}
export type JobEvent = 'waiting' | 'active' | 'stalled' | 'progress' | 'completed' | 'failed' | 'removed';
export type JobEventHandler = (job: Job<unknown>, ...args: unknown[]) => void;
//# sourceMappingURL=IQueueService.d.ts.map