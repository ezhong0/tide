/**
 * Analytics Service Contract
 * Provides insights and analytics on user behavior and system performance
 *
 * Performance Requirements:
 * - Real-time metrics: <50ms
 * - Aggregated analytics: <200ms
 * - Reports: <500ms
 */
import { Result, UUID, UserId, Timestamp } from '@tide/types';
export interface IAnalyticsService {
    /**
     * Track an event
     * @param event Event to track
     * @returns Event ID
     * @performance <30ms
     */
    trackEvent(event: AnalyticsEvent): Promise<Result<string>>;
    /**
     * Track multiple events in batch
     * @param events Array of events
     * @returns Array of event IDs
     * @performance <100ms for 100 events
     */
    trackEventBatch(events: AnalyticsEvent[]): Promise<Result<string[]>>;
    /**
     * Get real-time metrics
     * @param userId User identifier
     * @param metrics Metrics to retrieve
     * @returns Current metric values
     * @performance <50ms
     */
    getMetrics(userId: UserId, metrics: string[]): Promise<Result<MetricValues>>;
    /**
     * Get time series data
     * @param userId User identifier
     * @param metric Metric name
     * @param timeRange Time range
     * @param granularity Data granularity
     * @returns Time series data points
     * @performance <200ms
     */
    getTimeSeries(userId: UserId, metric: string, timeRange: TimeRange, granularity: Granularity): Promise<Result<TimeSeriesData>>;
    /**
     * Get productivity analytics
     * @param userId User identifier
     * @param period Time period
     * @returns Productivity metrics
     * @performance <200ms
     */
    getProductivityAnalytics(userId: UserId, period: TimeRange): Promise<Result<ProductivityAnalytics>>;
    /**
     * Get communication analytics
     * @param userId User identifier
     * @param period Time period
     * @returns Communication metrics
     * @performance <200ms
     */
    getCommunicationAnalytics(userId: UserId, period: TimeRange): Promise<Result<CommunicationAnalytics>>;
    /**
     * Get time usage analytics
     * @param userId User identifier
     * @param period Time period
     * @returns Time usage breakdown
     * @performance <200ms
     */
    getTimeAnalytics(userId: UserId, period: TimeRange): Promise<Result<TimeAnalytics>>;
    /**
     * Get system performance analytics
     * @param period Time period
     * @returns System performance metrics
     * @performance <200ms
     */
    getSystemAnalytics(period: TimeRange): Promise<Result<SystemAnalytics>>;
    /**
     * Generate custom report
     * @param userId User identifier
     * @param config Report configuration
     * @returns Generated report
     * @performance <500ms
     */
    generateReport(userId: UserId, config: ReportConfig): Promise<Result<Report>>;
    /**
     * Schedule recurring report
     * @param userId User identifier
     * @param config Report configuration
     * @param schedule Schedule pattern
     * @returns Schedule ID
     * @performance <100ms
     */
    scheduleReport(userId: UserId, config: ReportConfig, schedule: ReportSchedule): Promise<Result<string>>;
    /**
     * Get insights and recommendations
     * @param userId User identifier
     * @returns AI-generated insights
     * @performance <300ms
     */
    getInsights(userId: UserId): Promise<Result<Insight[]>>;
    /**
     * Get trend analysis
     * @param userId User identifier
     * @param metrics Metrics to analyze
     * @param period Analysis period
     * @returns Trend analysis results
     * @performance <300ms
     */
    analyzeTrends(userId: UserId, metrics: string[], period: TimeRange): Promise<Result<TrendAnalysis[]>>;
    /**
     * Get correlation analysis
     * @param userId User identifier
     * @param metrics Metrics to correlate
     * @returns Correlation matrix
     * @performance <400ms
     */
    analyzeCorrelations(userId: UserId, metrics: string[]): Promise<Result<CorrelationMatrix>>;
    /**
     * Forecast future metrics
     * @param userId User identifier
     * @param metric Metric to forecast
     * @param horizon Forecast horizon in days
     * @returns Forecast data
     * @performance <500ms
     */
    forecast(userId: UserId, metric: string, horizon: number): Promise<Result<ForecastData>>;
    /**
     * Get comparative analytics
     * @param userId User identifier
     * @param compareWith Comparison period or baseline
     * @returns Comparative analysis
     * @performance <300ms
     */
    compare(userId: UserId, compareWith: ComparisonTarget): Promise<Result<ComparativeAnalytics>>;
    /**
     * Create custom dashboard
     * @param userId User identifier
     * @param config Dashboard configuration
     * @returns Dashboard ID
     * @performance <200ms
     */
    createDashboard(userId: UserId, config: DashboardConfig): Promise<Result<string>>;
    /**
     * Get dashboard data
     * @param dashboardId Dashboard identifier
     * @returns Dashboard with current data
     * @performance <300ms
     */
    getDashboard(dashboardId: string): Promise<Result<Dashboard>>;
    /**
     * Export analytics data
     * @param userId User identifier
     * @param config Export configuration
     * @returns Export data
     * @performance <1000ms
     */
    exportData(userId: UserId, config: ExportConfig): Promise<Result<ExportData>>;
    /**
     * Get goal tracking analytics
     * @param userId User identifier
     * @returns Goal tracking metrics
     * @performance <200ms
     */
    getGoalAnalytics(userId: UserId): Promise<Result<GoalAnalytics>>;
    /**
     * Set analytics alert
     * @param userId User identifier
     * @param alert Alert configuration
     * @returns Alert ID
     * @performance <100ms
     */
    setAlert(userId: UserId, alert: AnalyticsAlert): Promise<Result<string>>;
    /**
     * Get active alerts
     * @param userId User identifier
     * @returns Array of active alerts
     * @performance <100ms
     */
    getAlerts(userId: UserId): Promise<Result<AnalyticsAlert[]>>;
    /**
     * Subscribe to analytics updates
     * @param userId User identifier
     * @param metrics Metrics to monitor
     * @param handler Update handler
     * @returns Subscription handle
     * @performance Real-time
     */
    subscribe(userId: UserId, metrics: string[], handler: AnalyticsUpdateHandler): Result<AnalyticsSubscription>;
}
export interface AnalyticsEvent {
    userId: UserId;
    eventType: string;
    eventData: Record<string, unknown>;
    timestamp: Timestamp;
    sessionId?: string;
    metadata?: Record<string, unknown>;
}
export interface MetricValues {
    [metric: string]: number | string;
}
export interface TimeRange {
    start: Timestamp;
    end: Timestamp;
}
export type Granularity = 'minute' | 'hour' | 'day' | 'week' | 'month';
export interface TimeSeriesData {
    metric: string;
    dataPoints: DataPoint[];
    aggregation: 'sum' | 'average' | 'min' | 'max' | 'count';
}
export interface DataPoint {
    timestamp: Timestamp;
    value: number;
}
export interface ProductivityAnalytics {
    productivityScore: number;
    tasksCompleted: number;
    focusTime: number;
    meetingTime: number;
    emailTime: number;
    peakHours: number[];
    distractions: Distraction[];
    achievements: Achievement[];
}
export interface Distraction {
    source: string;
    frequency: number;
    totalTime: number;
    impact: 'low' | 'medium' | 'high';
}
export interface Achievement {
    type: string;
    description: string;
    achievedAt: Timestamp;
}
export interface CommunicationAnalytics {
    emailsSent: number;
    emailsReceived: number;
    averageResponseTime: number;
    meetingsAttended: number;
    meetingHours: number;
    topContacts: ContactMetric[];
    communicationPatterns: Pattern[];
}
export interface ContactMetric {
    email: string;
    interactions: number;
    responseTime: number;
    sentiment: number;
}
export interface Pattern {
    type: string;
    frequency: number;
    confidence: number;
}
export interface TimeAnalytics {
    totalTrackedTime: number;
    breakdown: TimeBreakdown;
    efficiency: number;
    overtime: number;
    undertime: number;
}
export interface TimeBreakdown {
    productive: number;
    meetings: number;
    email: number;
    breaks: number;
    other: number;
}
export interface SystemAnalytics {
    uptime: number;
    responseTime: {
        p50: number;
        p95: number;
        p99: number;
    };
    errorRate: number;
    throughput: number;
    activeUsers: number;
    apiUsage: Record<string, number>;
}
export interface ReportConfig {
    name: string;
    metrics: string[];
    timeRange: TimeRange;
    format: 'pdf' | 'csv' | 'json';
    sections: ReportSection[];
}
export interface ReportSection {
    type: 'summary' | 'chart' | 'table' | 'insights';
    title: string;
    metrics: string[];
}
export interface Report {
    id: string;
    name: string;
    generatedAt: Timestamp;
    data: unknown;
    format: string;
}
export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipients?: string[];
}
export interface Insight {
    type: 'trend' | 'anomaly' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
    suggestedAction?: string;
    confidence: number;
}
export interface TrendAnalysis {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    significance: number;
    projection: number;
}
export interface CorrelationMatrix {
    metrics: string[];
    correlations: number[][];
    significantPairs: CorrelationPair[];
}
export interface CorrelationPair {
    metric1: string;
    metric2: string;
    correlation: number;
    pValue: number;
}
export interface ForecastData {
    metric: string;
    historical: DataPoint[];
    forecast: DataPoint[];
    confidence: {
        lower: DataPoint[];
        upper: DataPoint[];
    };
    accuracy: number;
}
export interface ComparisonTarget {
    type: 'period' | 'baseline' | 'goal';
    period?: TimeRange;
    baseline?: MetricValues;
    goal?: MetricValues;
}
export interface ComparativeAnalytics {
    current: MetricValues;
    comparison: MetricValues;
    changes: Record<string, number>;
    insights: string[];
}
export interface DashboardConfig {
    name: string;
    widgets: WidgetConfig[];
    refreshInterval?: number;
    layout?: string;
}
export interface WidgetConfig {
    type: 'metric' | 'chart' | 'table' | 'text';
    title: string;
    metric?: string;
    metrics?: string[];
    visualization?: string;
}
export interface Dashboard {
    id: string;
    name: string;
    widgets: Widget[];
    lastRefresh: Timestamp;
}
export interface Widget {
    id: string;
    type: string;
    title: string;
    data: unknown;
}
export interface ExportConfig {
    metrics: string[];
    timeRange: TimeRange;
    format: 'csv' | 'json' | 'excel';
    includeRaw?: boolean;
}
export interface ExportData {
    format: string;
    data: unknown;
    metadata: {
        exported: Timestamp;
        rows: number;
        size: number;
    };
}
export interface GoalAnalytics {
    goals: GoalProgress[];
    overallProgress: number;
    onTrack: number;
    atRisk: number;
    completed: number;
}
export interface GoalProgress {
    goalId: UUID;
    name: string;
    target: number;
    current: number;
    progress: number;
    projectedCompletion?: Timestamp;
    status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}
export interface AnalyticsAlert {
    id?: string;
    name: string;
    metric: string;
    condition: AlertCondition;
    action: AlertAction;
    enabled: boolean;
}
export interface AlertCondition {
    type: 'threshold' | 'change' | 'anomaly';
    operator?: '>' | '<' | '=' | '>=' | '<=';
    value?: number;
    changePercent?: number;
    window?: number;
}
export interface AlertAction {
    type: 'notification' | 'email' | 'webhook';
    target?: string;
}
export type AnalyticsUpdateHandler = (update: {
    metric: string;
    value: number;
    timestamp: Timestamp;
}) => void;
export interface AnalyticsSubscription {
    id: string;
    unsubscribe: () => void;
    pause: () => void;
    resume: () => void;
}
//# sourceMappingURL=IAnalyticsService.d.ts.map