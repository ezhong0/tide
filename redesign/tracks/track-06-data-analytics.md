# 📊 SYSTEM PROMPT: TRACK 6 - DATA & ANALYTICS PLATFORM

> **PASTE THIS ENTIRE SECTION INTO CLAUDE CODE TO EXECUTE THIS TRACK**

---

## YOUR MISSION

You're building the multi-tier data platform that powers all intelligence: transactional storage, vector embeddings, real-time analytics, ML pipelines. Support <1ms queries (hot), petabyte-scale analytics (cold), and the learning that makes Tide genius. This is the foundation that enables all AI capabilities.

**Product Context**: Tide is an AI Chief of Staff that learns from every interaction. You provide: multi-tier storage (Redis/Postgres/S3), vector DB (Pinecone), real-time streaming (Kafka), analytics warehouse (ClickHouse), ML pipelines, predictive caching.

**Your Deliverable**: Production data platform in 12 weeks: Redis cluster (hot <1ms), Postgres with pgvector (warm <10ms), S3 data lake (cold), Pinecone vectors (<50ms), Kafka streams, ClickHouse warehouse, ML feature store, intelligent caching.

**Philosophy**: Right data, right tier, right time • Real-time streaming everywhere • Privacy-first (encryption at rest/transit) • Immutable event sourcing • ML-first data model

**Integration**: Foundation for ALL tracks • Provides storage APIs • Streams events via Kafka • Serves ML features • Powers Track 2 AI • Read `/redesign/WEEK-0-FOUNDATION.md` first

**Success Metrics**: <1ms hot queries • <10ms warm queries • Process 1M events/sec • $10/user/month storage at scale • Zero data loss • GDPR compliant

**Start**: Setup Postgres with pgvector, configure Redis cluster, initialize Pinecone, build Kafka streaming pipeline. Track all work with todos. Ship fast, scalable, intelligent data platform.

---

---

# Track 6: Data & Analytics Platform

> Multi-tier data architecture powering real-time analytics, machine learning, and intelligent predictions

## Track Overview

**Owner**: Data Engineering Team (2-3 developers)
**Duration**: 12 weeks
**Dependencies**: None (Foundation for all tracks)
**Priority**: Critical - Data powers intelligence

## Mission

Build a sophisticated data platform that handles everything from transactional storage to vector embeddings, real-time analytics to machine learning pipelines. This platform must support sub-millisecond queries, petabyte-scale analytics, and power the AI intelligence that makes Tide genius.

## Core Architecture

```typescript
class TideDataPlatform {
    // Storage Tiers
    private hotStorage: RedisCluster;           // <1ms - Active data
    private warmStorage: PostgreSQL;            // <10ms - Recent data
    private coldStorage: S3DataLake;            // <100ms - Historical
    private vectorStorage: PineconeDB;          // <50ms - Embeddings

    // Analytics
    private streaming: KafkaStreams;            // Real-time processing
    private warehouse: ClickHouse;              // OLAP analytics
    private ml: MLPipeline;                     // Machine learning

    // Intelligence
    private graph: Neo4jGraph;                  // Relationship data
    private search: ElasticsearchCluster;       // Full-text search
    private timeseries: InfluxDB;              // Metrics & events

    async query(request: DataRequest): Promise<DataResponse> {
        // Route to optimal storage tier
        const tier = this.selectStorageTier(request);

        // Execute with caching
        return await this.executeWithCache(request, tier);
    }
}
```

## Development Timeline

### Weeks 1-3: Storage Foundation

#### Week 1: Multi-Tier Storage

**PostgreSQL Primary Database**:
```typescript
import { Knex } from 'knex';
import { Pool } from 'pg';

class PostgreSQLManager {
    private writePool: Pool;
    private readPools: Pool[];
    private knex: Knex;

    async initialize(): Promise<void> {
        // Master write pool
        this.writePool = new Pool({
            host: process.env.PG_MASTER,
            port: 5432,
            database: 'tide',
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        });

        // Read replicas
        this.readPools = [
            new Pool({ host: process.env.PG_REPLICA_1, ...commonConfig }),
            new Pool({ host: process.env.PG_REPLICA_2, ...commonConfig }),
            new Pool({ host: process.env.PG_REPLICA_3, ...commonConfig })
        ];

        // Knex for query building
        this.knex = Knex({
            client: 'pg',
            connection: this.writePool,
            pool: { min: 2, max: 20 },
            acquireConnectionTimeout: 10000
        });

        // Set up partitioning
        await this.setupPartitioning();
    }

    private async setupPartitioning(): Promise<void> {
        // Partition large tables by time
        await this.knex.raw(`
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                type VARCHAR(50) NOT NULL,
                data JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            ) PARTITION BY RANGE (created_at);

            -- Create monthly partitions
            CREATE TABLE events_2024_01 PARTITION OF events
                FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

            CREATE TABLE events_2024_02 PARTITION OF events
                FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

            -- Create indexes
            CREATE INDEX idx_events_user_created
                ON events(user_id, created_at DESC);

            CREATE INDEX idx_events_type_created
                ON events(type, created_at DESC);

            CREATE INDEX idx_events_data_gin
                ON events USING GIN (data);
        `);

        // Set up automatic partition creation
        await this.setupAutoPartitioning();
    }

    async query<T>(sql: string, bindings?: any[]): Promise<T[]> {
        // Route reads to replicas
        const pool = this.selectReadPool();

        const result = await pool.query(sql, bindings);
        return result.rows;
    }

    private selectReadPool(): Pool {
        // Round-robin selection with health check
        const healthyPools = this.readPools.filter(p => this.isHealthy(p));
        return healthyPools[Math.floor(Math.random() * healthyPools.length)];
    }

    // Connection pooling optimization
    async optimizeConnections(): Promise<void> {
        // Monitor connection usage
        const stats = await this.getPoolStats();

        // Adjust pool sizes based on usage
        if (stats.waitingCount > 0) {
            await this.increasePoolSize();
        } else if (stats.idleCount > stats.totalCount * 0.5) {
            await this.decreasePoolSize();
        }
    }
}

// Redis for hot data
class RedisClusterManager {
    private cluster: Cluster;
    private bloom: RedisBloom;
    private json: RedisJSON;
    private search: RediSearch;
    private timeSeries: RedisTimeSeries;

    constructor() {
        this.cluster = new Cluster([
            { host: 'redis-1', port: 6379 },
            { host: 'redis-2', port: 6379 },
            { host: 'redis-3', port: 6379 },
            { host: 'redis-4', port: 6379 },
            { host: 'redis-5', port: 6379 },
            { host: 'redis-6', port: 6379 }
        ], {
            redisOptions: {
                password: process.env.REDIS_PASSWORD,
                enableReadyCheck: true,
                maxRetriesPerRequest: 3
            },
            clusterRetryStrategy: (times) => Math.min(100 * times, 2000),
            enableOfflineQueue: true
        });

        // Redis modules
        this.bloom = new RedisBloom(this.cluster);
        this.json = new RedisJSON(this.cluster);
        this.search = new RediSearch(this.cluster);
        this.timeSeries = new RedisTimeSeries(this.cluster);
    }

    // Intelligent caching with TTL optimization
    async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
        const ttl = this.calculateOptimalTTL(key, value, options);

        // Use RedisJSON for complex objects
        if (typeof value === 'object') {
            await this.json.set(key, '$', value);
            await this.cluster.expire(key, ttl);
        } else {
            await this.cluster.setex(key, ttl, JSON.stringify(value));
        }

        // Update bloom filter for existence checking
        await this.bloom.add('cache:keys', key);

        // Track access patterns
        await this.trackAccess(key);
    }

    private calculateOptimalTTL(
        key: string,
        value: any,
        options: CacheOptions
    ): number {
        // Base TTL
        let ttl = options.ttl || 3600;

        // Adjust based on data size
        const size = JSON.stringify(value).length;
        if (size > 10000) ttl = Math.min(ttl, 300); // Large objects expire faster

        // Adjust based on key pattern
        if (key.includes(':user:')) ttl = 7200;  // User data cached longer
        if (key.includes(':temp:')) ttl = 60;     // Temporary data expires quickly
        if (key.includes(':static:')) ttl = 86400; // Static data cached for a day

        // Adjust based on memory pressure
        const memoryUsage = await this.getMemoryUsage();
        if (memoryUsage > 0.8) ttl = Math.floor(ttl * 0.5);

        return ttl;
    }

    // Advanced data structures
    async createLeaderboard(name: string): Promise<void> {
        // Use Redis Sorted Sets for leaderboards
        await this.cluster.zadd(
            `leaderboard:${name}`,
            ...scores.flatMap(s => [s.score, s.userId])
        );
    }

    async trackTimeSeries(metric: string, value: number): Promise<void> {
        // Use RedisTimeSeries for metrics
        await this.timeSeries.add(
            `metric:${metric}`,
            Date.now(),
            value,
            {
                retentionTime: 86400000, // 24 hours
                labels: { metric, environment: 'production' }
            }
        );
    }
}
```

#### Week 2: Vector Database

**Pinecone for Embeddings**:
```typescript
import { PineconeClient } from '@pinecone-database/pinecone';

class VectorStorageManager {
    private pinecone: PineconeClient;
    private index: Index;
    private embedder: EmbeddingGenerator;

    async initialize(): Promise<void> {
        this.pinecone = new PineconeClient();

        await this.pinecone.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENV
        });

        // Create or get index
        const indexName = 'tide-embeddings';
        const indexes = await this.pinecone.listIndexes();

        if (!indexes.includes(indexName)) {
            await this.pinecone.createIndex({
                name: indexName,
                dimension: 1536, // OpenAI embeddings
                metric: 'cosine',
                pods: 4,
                replicas: 2,
                pod_type: 'p2.x1'
            });
        }

        this.index = this.pinecone.Index(indexName);

        // Initialize embedding generator
        this.embedder = new EmbeddingGenerator({
            model: 'text-embedding-3-large'
        });
    }

    async store(
        id: string,
        text: string,
        metadata: any
    ): Promise<void> {
        // Generate embedding
        const embedding = await this.embedder.embed(text);

        // Store in Pinecone
        await this.index.upsert({
            vectors: [{
                id,
                values: embedding,
                metadata: {
                    ...metadata,
                    text: text.substring(0, 1000), // Store snippet
                    timestamp: Date.now()
                }
            }]
        });

        // Update namespace if needed
        if (metadata.namespace) {
            await this.index.namespace(metadata.namespace).upsert({
                vectors: [{ id, values: embedding, metadata }]
            });
        }
    }

    async search(
        query: string,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        // Generate query embedding
        const queryEmbedding = await this.embedder.embed(query);

        // Search with filters
        const results = await this.index.query({
            vector: queryEmbedding,
            topK: options.topK || 10,
            filter: options.filter,
            includeMetadata: true,
            includeValues: false
        });

        // Rerank results if needed
        if (options.rerank) {
            return await this.rerankResults(results.matches, query);
        }

        return results.matches.map(match => ({
            id: match.id,
            score: match.score,
            metadata: match.metadata
        }));
    }

    // Hybrid search combining vector and keyword
    async hybridSearch(
        query: string,
        options: HybridSearchOptions
    ): Promise<SearchResult[]> {
        // Vector search
        const vectorResults = await this.search(query, {
            topK: options.topK * 2
        });

        // Keyword search (from another source)
        const keywordResults = await this.keywordSearch(query, options);

        // Combine and rerank
        return this.fuseResults(vectorResults, keywordResults, options.weights);
    }

    // Clustering for similar items
    async cluster(namespace: string): Promise<Cluster[]> {
        // Fetch all vectors
        const vectors = await this.index.namespace(namespace).fetch({
            limit: 10000
        });

        // Perform clustering (using external service or library)
        const clusters = await this.performClustering(vectors);

        // Store cluster assignments
        for (const cluster of clusters) {
            for (const id of cluster.members) {
                await this.index.update({
                    id,
                    metadata: { cluster: cluster.id }
                });
            }
        }

        return clusters;
    }
}
```

#### Week 3: Analytics Data Warehouse

**ClickHouse for OLAP**:
```typescript
import { ClickHouse } from 'clickhouse';

class AnalyticsWarehouse {
    private clickhouse: ClickHouse;
    private materializedViews: Map<string, string> = new Map();

    constructor() {
        this.clickhouse = new ClickHouse({
            url: process.env.CLICKHOUSE_URL,
            database: 'tide_analytics',
            username: process.env.CLICKHOUSE_USER,
            password: process.env.CLICKHOUSE_PASSWORD,
            readonly: false,
            format: 'json'
        });
    }

    async initialize(): Promise<void> {
        // Create distributed tables
        await this.createTables();

        // Set up materialized views
        await this.createMaterializedViews();

        // Set up data retention policies
        await this.setupRetentionPolicies();
    }

    private async createTables(): Promise<void> {
        // Events table with partitioning
        await this.clickhouse.query(`
            CREATE TABLE IF NOT EXISTS events ON CLUSTER tide_cluster
            (
                event_id UUID,
                user_id UUID,
                session_id UUID,
                event_type String,
                event_data String,
                timestamp DateTime64(3),
                date Date MATERIALIZED toDate(timestamp),
                hour UInt8 MATERIALIZED toHour(timestamp)
            )
            ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/events', '{replica}')
            PARTITION BY toYYYYMM(date)
            ORDER BY (user_id, timestamp)
            TTL date + INTERVAL 90 DAY
            SETTINGS index_granularity = 8192
        `);

        // Distributed table for queries
        await this.clickhouse.query(`
            CREATE TABLE IF NOT EXISTS events_distributed ON CLUSTER tide_cluster
            AS events
            ENGINE = Distributed(tide_cluster, default, events, cityHash64(user_id))
        `);

        // User aggregations table
        await this.clickhouse.query(`
            CREATE TABLE IF NOT EXISTS user_metrics ON CLUSTER tide_cluster
            (
                user_id UUID,
                date Date,
                total_events UInt64,
                unique_sessions UInt32,
                active_minutes UInt32,
                emails_processed UInt32,
                calendar_events UInt32,
                tasks_completed UInt32,
                workflows_executed UInt32
            )
            ENGINE = ReplicatedSummingMergeTree('/clickhouse/tables/{shard}/user_metrics', '{replica}')
            PARTITION BY toYYYYMM(date)
            ORDER BY (user_id, date)
        `);
    }

    private async createMaterializedViews(): Promise<void> {
        // Real-time user activity aggregation
        await this.clickhouse.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_mv
            TO user_metrics
            AS
            SELECT
                user_id,
                toDate(timestamp) as date,
                count() as total_events,
                uniq(session_id) as unique_sessions,
                sum(event_type = 'email_processed') as emails_processed,
                sum(event_type = 'calendar_event') as calendar_events,
                sum(event_type = 'task_completed') as tasks_completed,
                sum(event_type = 'workflow_executed') as workflows_executed
            FROM events
            GROUP BY user_id, date
        `);

        // Hourly aggregations for dashboard
        await this.clickhouse.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_stats_mv
            ENGINE = ReplicatedAggregatingMergeTree('/clickhouse/tables/{shard}/hourly_stats', '{replica}')
            PARTITION BY toYYYYMM(date)
            ORDER BY (date, hour)
            AS
            SELECT
                toDate(timestamp) as date,
                toHour(timestamp) as hour,
                count() as events_count,
                uniq(user_id) as unique_users,
                avg(processingTime) as avg_processing_time,
                quantile(0.95)(processingTime) as p95_processing_time
            FROM events
            GROUP BY date, hour
        `);
    }

    // Optimized analytics queries
    async getUserMetrics(
        userId: string,
        dateRange: DateRange
    ): Promise<UserMetrics> {
        const query = `
            SELECT
                sum(total_events) as total_events,
                sum(unique_sessions) as total_sessions,
                sum(emails_processed) as emails_processed,
                sum(calendar_events) as calendar_events,
                sum(tasks_completed) as tasks_completed,
                sum(workflows_executed) as workflows_executed,
                avg(active_minutes) as avg_daily_minutes
            FROM user_metrics
            WHERE user_id = '${userId}'
                AND date >= '${dateRange.start}'
                AND date <= '${dateRange.end}'
        `;

        const result = await this.clickhouse.query(query);
        return result[0];
    }

    // Real-time analytics streaming
    async streamAnalytics(
        query: string,
        callback: (data: any) => void
    ): Promise<void> {
        const stream = this.clickhouse.stream(query);

        stream.on('data', callback);
        stream.on('error', (err) => {
            console.error('Stream error:', err);
        });
    }
}
```

### Weeks 4-6: Stream Processing

#### Week 4: Kafka Streams

**Real-time Event Processing**:
```typescript
import { Kafka, EachMessagePayload } from 'kafkajs';
import { KafkaStreams } from 'kafka-streams';

class StreamProcessingPipeline {
    private kafkaStreams: KafkaStreams;
    private processors: Map<string, StreamProcessor> = new Map();

    async initialize(): Promise<void> {
        const config = {
            noptions: {
                'metadata.broker.list': process.env.KAFKA_BROKERS,
                'group.id': 'tide-stream-processor',
                'enable.auto.commit': false,
                'socket.keepalive.enable': true
            }
        };

        this.kafkaStreams = new KafkaStreams(config);

        // Set up stream topologies
        await this.setupStreamTopologies();
    }

    private async setupStreamTopologies(): Promise<void> {
        // User activity stream
        const activityStream = this.kafkaStreams
            .getKStream('user-activities')
            .mapJSONConvenience()
            .filter((event) => event.userId != null)
            .window(60000, 5000) // 1 minute window, 5 second slide
            .aggregate(
                () => ({
                    count: 0,
                    events: [],
                    lastActivity: null
                }),
                (oldVal, event) => ({
                    count: oldVal.count + 1,
                    events: [...oldVal.events, event.type].slice(-100),
                    lastActivity: event.timestamp
                }),
                'user-activity-aggregates'
            );

        // Pattern detection stream
        const patternStream = activityStream
            .map((key, value) => {
                const patterns = this.detectPatterns(value.events);
                return {
                    key,
                    value: {
                        userId: key,
                        patterns,
                        timestamp: Date.now()
                    }
                };
            })
            .filter((record) => record.value.patterns.length > 0)
            .to('detected-patterns');

        // Email processing stream
        const emailStream = this.kafkaStreams
            .getKStream('email-events')
            .mapJSONConvenience()
            .branch([
                (event) => event.type === 'received',
                (event) => event.type === 'sent',
                (event) => event.type === 'drafted'
            ]);

        // Process each branch
        emailStream[0] // Received emails
            .map((key, email) => this.processReceivedEmail(email))
            .to('processed-emails');

        emailStream[1] // Sent emails
            .map((key, email) => this.processSentEmail(email))
            .to('email-analytics');

        // Start all streams
        await activityStream.start();
        await emailStream[0].start();
        await emailStream[1].start();
    }

    // Complex event processing
    private detectPatterns(events: string[]): Pattern[] {
        const patterns: Pattern[] = [];

        // Sequential pattern detection
        const sequences = this.findSequences(events);
        sequences.forEach(seq => {
            if (seq.count >= 3) {
                patterns.push({
                    type: 'sequence',
                    pattern: seq.pattern,
                    confidence: seq.count / events.length
                });
            }
        });

        // Temporal pattern detection
        const temporal = this.findTemporalPatterns(events);
        patterns.push(...temporal);

        return patterns;
    }

    // Windowed aggregations
    async createWindowedAggregation(
        streamName: string,
        windowSize: number,
        aggregator: Aggregator
    ): Promise<void> {
        const stream = this.kafkaStreams
            .getKStream(streamName)
            .mapJSONConvenience()
            .groupByKey()
            .window(windowSize)
            .aggregate(
                aggregator.init,
                aggregator.add,
                aggregator.remove
            )
            .map((key, value) => ({
                key: key.key,
                window: key.window,
                value: aggregator.compute(value)
            }))
            .to(`${streamName}-windowed`);

        await stream.start();
    }
}

// Stateful stream processing
class StatefulProcessor {
    private stateStore: StateStore;
    private checkpointer: Checkpointer;

    async processWithState(
        event: Event,
        context: ProcessorContext
    ): Promise<ProcessedEvent> {
        // Load state
        const state = await this.stateStore.get(event.key);

        // Process event with state
        const newState = await this.processEvent(event, state);

        // Update state
        await this.stateStore.put(event.key, newState);

        // Checkpoint progress
        await this.checkpointer.checkpoint(context.offset);

        return {
            event,
            state: newState,
            timestamp: Date.now()
        };
    }

    // Exactly-once semantics
    async processExactlyOnce(
        batch: Event[],
        context: ProcessorContext
    ): Promise<void> {
        const transaction = await this.beginTransaction();

        try {
            for (const event of batch) {
                await this.processWithState(event, context);
            }

            // Commit transaction
            await transaction.commit();

        } catch (error) {
            // Rollback on failure
            await transaction.rollback();
            throw error;
        }
    }
}
```

#### Week 5: Machine Learning Pipeline

**ML Infrastructure**:
```typescript
import * as tf from '@tensorflow/tfjs-node';
import { Pipeline } from 'apache-arrow';

class MLPipeline {
    private featureStore: FeatureStore;
    private modelRegistry: ModelRegistry;
    private trainer: ModelTrainer;
    private predictor: ModelPredictor;

    async initialize(): Promise<void> {
        // Initialize feature store
        await this.featureStore.initialize();

        // Load models from registry
        await this.modelRegistry.loadModels();

        // Set up training pipeline
        await this.setupTrainingPipeline();
    }

    // Feature engineering pipeline
    async createFeatures(rawData: RawData): Promise<Features> {
        const features = new Features();

        // User behavior features
        features.add('email_response_time', await this.calculateResponseTime(rawData));
        features.add('meeting_attendance_rate', await this.calculateAttendance(rawData));
        features.add('task_completion_rate', await this.calculateCompletion(rawData));

        // Temporal features
        features.add('hour_of_day', this.extractHour(rawData.timestamp));
        features.add('day_of_week', this.extractDayOfWeek(rawData.timestamp));
        features.add('is_weekend', this.isWeekend(rawData.timestamp));

        // Aggregated features
        features.add('rolling_7d_activity', await this.calculate7DayActivity(rawData.userId));
        features.add('rolling_30d_patterns', await this.calculate30DayPatterns(rawData.userId));

        // Store features
        await this.featureStore.store(rawData.userId, features);

        return features;
    }

    // Online learning for personalization
    async onlineLearn(
        userId: string,
        interaction: Interaction
    ): Promise<void> {
        // Get user's model
        let model = await this.modelRegistry.getUserModel(userId);

        if (!model) {
            // Initialize from base model
            model = await this.modelRegistry.getBaseModel('personalization');
        }

        // Prepare training data
        const features = await this.createFeatures(interaction);
        const label = interaction.outcome;

        // Online update
        await model.fit(features, label, {
            epochs: 1,
            batchSize: 1,
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    await this.trackTraining(userId, logs);
                }
            }
        });

        // Save updated model
        await this.modelRegistry.saveUserModel(userId, model);
    }

    // Batch training pipeline
    async trainBatchModel(
        modelType: string,
        dataset: Dataset
    ): Promise<TrainedModel> {
        // Prepare data
        const { features, labels } = await this.prepareDataset(dataset);

        // Split data
        const { train, validation, test } = this.splitDataset(features, labels);

        // Create model architecture
        const model = this.createModelArchitecture(modelType);

        // Train model
        const history = await model.fit(train.features, train.labels, {
            epochs: 100,
            batchSize: 32,
            validationData: [validation.features, validation.labels],
            callbacks: {
                earlyStopping: tf.callbacks.earlyStopping({
                    monitor: 'val_loss',
                    patience: 10
                }),
                modelCheckpoint: this.createCheckpoint(modelType)
            }
        });

        // Evaluate on test set
        const evaluation = await model.evaluate(test.features, test.labels);

        // Register model
        await this.modelRegistry.register({
            type: modelType,
            version: this.generateVersion(),
            metrics: evaluation,
            history,
            model
        });

        return { model, metrics: evaluation };
    }

    // Real-time prediction serving
    async predict(
        modelType: string,
        features: Features
    ): Promise<Prediction> {
        // Get model from cache or registry
        const model = await this.predictor.getModel(modelType);

        // Prepare features
        const tensor = this.featuresToTensor(features);

        // Make prediction
        const prediction = await model.predict(tensor);

        // Post-process
        const processed = await this.postProcess(prediction, modelType);

        // Track prediction
        await this.trackPrediction(modelType, features, processed);

        return processed;
    }

    // A/B testing for models
    async abTestPrediction(
        userId: string,
        features: Features
    ): Promise<ABTestPrediction> {
        // Determine experiment group
        const group = await this.experimentManager.getGroup(userId);

        let model: Model;
        if (group === 'control') {
            model = await this.modelRegistry.getModel('v1');
        } else {
            model = await this.modelRegistry.getModel('v2');
        }

        // Make prediction
        const prediction = await model.predict(features);

        // Track for experiment
        await this.experimentManager.track(userId, group, prediction);

        return {
            prediction,
            group,
            modelVersion: model.version
        };
    }
}

// Feature store for ML
class FeatureStore {
    private online: RedisClient;  // Fast serving
    private offline: S3Client;    // Historical data

    async getFeatures(
        entityId: string,
        featureNames: string[]
    ): Promise<FeatureVector> {
        // Try online store first
        const cached = await this.online.hmget(
            `features:${entityId}`,
            featureNames
        );

        if (cached.every(v => v !== null)) {
            return new FeatureVector(cached);
        }

        // Fallback to offline store
        const historical = await this.offline.getObject({
            Bucket: 'feature-store',
            Key: `${entityId}/features.parquet`
        });

        // Parse and extract features
        const features = await this.parseParquet(historical.Body);

        // Update online store
        await this.online.hmset(
            `features:${entityId}`,
            features
        );

        return new FeatureVector(features);
    }
}
```

#### Week 6: Search & Graph

**Elasticsearch for Full-Text Search**:
```typescript
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

class SearchPlatform {
    private client: ElasticsearchClient;
    private indexManager: IndexManager;

    constructor() {
        this.client = new ElasticsearchClient({
            nodes: process.env.ELASTICSEARCH_NODES?.split(','),
            auth: {
                username: process.env.ES_USER,
                password: process.env.ES_PASSWORD
            }
        });
    }

    async initialize(): Promise<void> {
        // Create indexes with optimized mappings
        await this.createIndexes();

        // Set up index templates
        await this.setupTemplates();

        // Configure analyzers
        await this.configureAnalyzers();
    }

    private async createIndexes(): Promise<void> {
        // Emails index
        await this.client.indices.create({
            index: 'emails',
            body: {
                settings: {
                    number_of_shards: 5,
                    number_of_replicas: 2,
                    'index.refresh_interval': '1s',
                    'analysis': {
                        'analyzer': {
                            'email_analyzer': {
                                'tokenizer': 'standard',
                                'filter': ['lowercase', 'stop', 'porter_stem']
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        user_id: { type: 'keyword' },
                        from: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        to: { type: 'text' },
                        subject: {
                            type: 'text',
                            analyzer: 'email_analyzer'
                        },
                        body: {
                            type: 'text',
                            analyzer: 'email_analyzer'
                        },
                        timestamp: { type: 'date' },
                        attachments: { type: 'nested' },
                        vector: {
                            type: 'dense_vector',
                            dims: 768  // For semantic search
                        }
                    }
                }
            }
        });

        // Documents index
        await this.createDocumentsIndex();

        // Tasks index
        await this.createTasksIndex();
    }

    // Hybrid search (keyword + vector)
    async search(query: SearchQuery): Promise<SearchResults> {
        // Build compound query
        const body = {
            query: {
                bool: {
                    should: [
                        // Keyword search
                        {
                            multi_match: {
                                query: query.text,
                                fields: ['subject^2', 'body', 'from'],
                                type: 'best_fields',
                                fuzziness: 'AUTO'
                            }
                        },
                        // Vector similarity search
                        {
                            script_score: {
                                query: { match_all: {} },
                                script: {
                                    source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
                                    params: {
                                        query_vector: await this.getQueryVector(query.text)
                                    }
                                }
                            }
                        }
                    ],
                    filter: query.filters || []
                }
            },
            aggs: {
                by_sender: {
                    terms: { field: 'from.keyword' }
                },
                by_date: {
                    date_histogram: {
                        field: 'timestamp',
                        calendar_interval: 'day'
                    }
                }
            },
            highlight: {
                fields: {
                    subject: {},
                    body: { fragment_size: 150 }
                }
            }
        };

        const results = await this.client.search({
            index: query.index || 'emails',
            body,
            size: query.size || 10
        });

        return this.formatResults(results);
    }

    // Percolator for real-time alerting
    async setupPercolator(): Promise<void> {
        // Store queries to match against new documents
        await this.client.index({
            index: 'percolator-queries',
            id: 'urgent-email',
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { subject: 'urgent' }},
                            { match: { from: 'ceo@company.com' }}
                        ]
                    }
                },
                alert: {
                    type: 'high_priority',
                    notify: ['user', 'assistant']
                }
            }
        });
    }

    async percolate(document: any): Promise<Alert[]> {
        const response = await this.client.search({
            index: 'percolator-queries',
            body: {
                query: {
                    percolate: {
                        field: 'query',
                        document
                    }
                }
            }
        });

        return response.body.hits.hits.map(hit => hit._source.alert);
    }
}

// Neo4j for relationship graphs
class GraphDatabase {
    private driver: Driver;
    private session: Session;

    async initialize(): Promise<void> {
        this.driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(
                process.env.NEO4J_USER,
                process.env.NEO4J_PASSWORD
            )
        );

        // Create constraints and indexes
        await this.setupSchema();
    }

    private async setupSchema(): Promise<void> {
        const session = this.driver.session();

        try {
            // User nodes
            await session.run(`
                CREATE CONSTRAINT user_id IF NOT EXISTS
                ON (u:User) ASSERT u.id IS UNIQUE
            `);

            // Email relationships
            await session.run(`
                CREATE INDEX email_sent IF NOT EXISTS
                FOR ()-[r:SENT_EMAIL]->()
                ON (r.timestamp)
            `);

            // Meeting relationships
            await session.run(`
                CREATE INDEX meeting_attended IF NOT EXISTS
                FOR ()-[r:ATTENDED_MEETING]->()
                ON (r.date)
            `);

        } finally {
            await session.close();
        }
    }

    // Find important relationships
    async findImportantContacts(userId: string): Promise<Contact[]> {
        const session = this.driver.session();

        try {
            const result = await session.run(`
                MATCH (u:User {id: $userId})-[r:SENT_EMAIL|RECEIVED_EMAIL|ATTENDED_MEETING]-(c:Contact)
                WITH c,
                     count(r) as interactions,
                     max(r.timestamp) as last_interaction,
                     collect(distinct type(r)) as interaction_types
                WHERE interactions > 5
                RETURN c.id as id,
                       c.name as name,
                       c.email as email,
                       interactions,
                       last_interaction,
                       interaction_types
                ORDER BY interactions DESC
                LIMIT 20
            `, { userId });

            return result.records.map(record => ({
                id: record.get('id'),
                name: record.get('name'),
                email: record.get('email'),
                interactions: record.get('interactions'),
                lastInteraction: record.get('last_interaction'),
                types: record.get('interaction_types')
            }));

        } finally {
            await session.close();
        }
    }

    // PageRank for influence scoring
    async calculateInfluence(): Promise<void> {
        const session = this.driver.session();

        try {
            await session.run(`
                CALL gds.graph.project(
                    'email-network',
                    'User',
                    'SENT_EMAIL',
                    { relationshipProperties: 'weight' }
                )
            `);

            await session.run(`
                CALL gds.pageRank.write('email-network', {
                    maxIterations: 20,
                    dampingFactor: 0.85,
                    writeProperty: 'influence'
                })
            `);

        } finally {
            await session.close();
        }
    }
}
```

### Weeks 7-9: Advanced Analytics

#### Week 7: Real-time Analytics

**Complex Analytics Queries**:
```typescript
class RealtimeAnalytics {
    private druid: DruidClient;
    private timestream: TimestreamClient;

    // Real-time dashboard queries
    async getDashboardMetrics(): Promise<DashboardData> {
        const [
            activeUsers,
            requestRate,
            errorRate,
            latencyMetrics,
            topActions
        ] = await Promise.all([
            this.getActiveUsers(),
            this.getRequestRate(),
            this.getErrorRate(),
            this.getLatencyMetrics(),
            this.getTopActions()
        ]);

        return {
            activeUsers,
            requestRate,
            errorRate,
            latencyMetrics,
            topActions,
            timestamp: Date.now()
        };
    }

    private async getActiveUsers(): Promise<number> {
        const query = {
            queryType: 'timeBoundary',
            dataSource: 'user-activities',
            bound: 'maxTime'
        };

        const result = await this.druid.query(query);
        return result.activeUsers;
    }

    // Funnel analysis
    async analyzeFunnel(steps: FunnelStep[]): Promise<FunnelAnalysis> {
        const query = `
            WITH funnel AS (
                SELECT
                    user_id,
                    MAX(CASE WHEN event = '${steps[0].event}' THEN 1 ELSE 0 END) as step1,
                    MAX(CASE WHEN event = '${steps[1].event}' THEN 1 ELSE 0 END) as step2,
                    MAX(CASE WHEN event = '${steps[2].event}' THEN 1 ELSE 0 END) as step3
                FROM events
                WHERE timestamp >= NOW() - INTERVAL 7 DAY
                GROUP BY user_id
            )
            SELECT
                COUNT(*) as total_users,
                SUM(step1) as completed_step1,
                SUM(step1 * step2) as completed_step2,
                SUM(step1 * step2 * step3) as completed_step3
            FROM funnel
        `;

        const results = await this.clickhouse.query(query);

        return {
            steps: steps.map((step, i) => ({
                ...step,
                users: results[`completed_step${i + 1}`],
                conversion: i === 0
                    ? 100
                    : (results[`completed_step${i + 1}`] / results[`completed_step${i}`]) * 100
            })),
            overallConversion: (results.completed_step3 / results.total_users) * 100
        };
    }

    // Cohort analysis
    async analyzeCohort(cohortDate: Date): Promise<CohortAnalysis> {
        const query = `
            SELECT
                DATE_DIFF('week', cohort_week, activity_week) as weeks_since_signup,
                COUNT(DISTINCT user_id) as active_users,
                COUNT(DISTINCT user_id) * 100.0 / cohort_size as retention_rate
            FROM (
                SELECT
                    u.user_id,
                    DATE_TRUNC('week', u.signup_date) as cohort_week,
                    DATE_TRUNC('week', e.timestamp) as activity_week,
                    COUNT(DISTINCT u.user_id) OVER (PARTITION BY DATE_TRUNC('week', u.signup_date)) as cohort_size
                FROM users u
                JOIN events e ON u.user_id = e.user_id
                WHERE u.signup_date >= '${cohortDate}'
            )
            GROUP BY weeks_since_signup, cohort_size
            ORDER BY weeks_since_signup
        `;

        return await this.executeAnalyticsQuery(query);
    }
}
```

#### Week 8: Predictive Analytics

**Forecasting & Predictions**:
```typescript
class PredictiveAnalytics {
    private prophet: ProphetForecaster;
    private arima: ARIMAModel;
    private lstm: LSTMNetwork;

    // Time series forecasting
    async forecastMetric(
        metric: string,
        horizon: number
    ): Promise<Forecast> {
        // Get historical data
        const historical = await this.getHistoricalData(metric);

        // Choose model based on data characteristics
        const model = this.selectForecastModel(historical);

        // Train and forecast
        const forecast = await model.forecast(historical, horizon);

        // Calculate confidence intervals
        const confidence = await this.calculateConfidence(forecast);

        return {
            metric,
            forecast: forecast.predictions,
            confidence,
            model: model.name
        };
    }

    // Churn prediction
    async predictChurn(userId: string): Promise<ChurnPrediction> {
        // Get user features
        const features = await this.getUserChurnFeatures(userId);

        // Score with model
        const score = await this.churnModel.predict(features);

        // Get explanation
        const explanation = await this.explainChurnRisk(features, score);

        return {
            userId,
            churnRisk: score,
            riskLevel: this.categorizeRisk(score),
            reasons: explanation.topFactors,
            recommendations: await this.getRetentionActions(score, explanation)
        };
    }

    private async getUserChurnFeatures(userId: string): Promise<Features> {
        const features = new Features();

        // Activity features
        const activity = await this.getActivityMetrics(userId, 30);
        features.add('days_active_last_30', activity.daysActive);
        features.add('actions_per_day', activity.avgActions);
        features.add('decreasing_activity', activity.trend < 0);

        // Engagement features
        const engagement = await this.getEngagementMetrics(userId);
        features.add('feature_adoption', engagement.featuresUsed / engagement.totalFeatures);
        features.add('workflow_complexity', engagement.avgWorkflowSteps);

        // Value features
        const value = await this.getValueMetrics(userId);
        features.add('time_saved_hours', value.timeSaved);
        features.add('automations_created', value.automations);

        return features;
    }

    // Anomaly detection
    async detectAnomalies(
        metric: string,
        data: TimeSeriesData
    ): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        // Statistical detection (Z-score)
        const statistical = await this.statisticalAnomalyDetection(data);
        anomalies.push(...statistical);

        // Machine learning detection (Isolation Forest)
        const mlAnomalies = await this.mlAnomalyDetection(data);
        anomalies.push(...mlAnomalies);

        // Pattern-based detection
        const patternAnomalies = await this.patternAnomalyDetection(data);
        anomalies.push(...patternAnomalies);

        // Combine and rank
        return this.rankAnomalies(anomalies);
    }
}
```

#### Week 9: Data Quality & Governance

**Data Quality Management**:
```typescript
class DataQualityManager {
    private validator: DataValidator;
    private profiler: DataProfiler;
    private lineage: DataLineage;

    // Data validation pipelines
    async validateDataPipeline(
        pipeline: string,
        data: any[]
    ): Promise<ValidationResult> {
        const schema = await this.getSchema(pipeline);

        const results = {
            total: data.length,
            valid: 0,
            invalid: 0,
            errors: []
        };

        for (const record of data) {
            const validation = await this.validator.validate(record, schema);

            if (validation.valid) {
                results.valid++;
            } else {
                results.invalid++;
                results.errors.push({
                    record: record.id,
                    errors: validation.errors
                });
            }
        }

        // Check data quality rules
        const quality = await this.checkQualityRules(data, pipeline);

        return {
            ...results,
            quality
        };
    }

    // Data profiling
    async profileDataset(dataset: string): Promise<DataProfile> {
        const data = await this.loadDataset(dataset);

        return {
            rowCount: data.length,
            columns: await this.profileColumns(data),
            nullability: await this.analyzeNullability(data),
            uniqueness: await this.analyzeUniqueness(data),
            distributions: await this.analyzeDistributions(data),
            correlations: await this.analyzeCorrelations(data),
            anomalies: await this.findDataAnomalies(data)
        };
    }

    // Data lineage tracking
    async trackLineage(
        sourceTable: string,
        transformation: string,
        targetTable: string
    ): Promise<void> {
        await this.lineage.record({
            source: sourceTable,
            transformation,
            target: targetTable,
            timestamp: Date.now(),
            version: await this.getVersion(transformation)
        });

        // Update dependency graph
        await this.updateDependencyGraph(sourceTable, targetTable);
    }

    // GDPR compliance
    async handleGDPRRequest(
        userId: string,
        requestType: 'access' | 'deletion' | 'portability'
    ): Promise<GDPRResponse> {
        switch (requestType) {
            case 'access':
                return await this.exportUserData(userId);

            case 'deletion':
                return await this.deleteUserData(userId);

            case 'portability':
                return await this.exportPortableData(userId);
        }
    }

    private async deleteUserData(userId: string): Promise<GDPRResponse> {
        const tables = await this.lineage.getTablesWithUserData();

        const results = [];

        for (const table of tables) {
            // Soft delete with audit trail
            const result = await this.softDelete(table, userId);
            results.push(result);

            // Schedule hard delete after retention period
            await this.scheduleHardDelete(table, userId, 30);
        }

        return {
            request: 'deletion',
            userId,
            tablesAffected: results.length,
            status: 'completed',
            auditLog: await this.createAuditLog('gdpr_deletion', userId)
        };
    }
}
```

### Weeks 10-12: Production Excellence

#### Week 10: Performance Optimization

**Query Optimization**:
```typescript
class QueryOptimizer {
    private queryPlanner: QueryPlanner;
    private indexAdvisor: IndexAdvisor;
    private cacheStrategy: CacheStrategy;

    async optimizeQuery(query: string): Promise<OptimizedQuery> {
        // Parse and analyze query
        const parsed = await this.queryPlanner.parse(query);

        // Get query plan
        const plan = await this.queryPlanner.explain(parsed);

        // Identify optimization opportunities
        const optimizations = await this.identifyOptimizations(plan);

        // Apply optimizations
        let optimized = query;
        for (const opt of optimizations) {
            optimized = await this.applyOptimization(optimized, opt);
        }

        // Suggest indexes
        const indexSuggestions = await this.indexAdvisor.suggest(parsed);

        // Determine caching strategy
        const cacheStrategy = await this.cacheStrategy.determine(parsed);

        return {
            original: query,
            optimized,
            plan,
            optimizations,
            indexSuggestions,
            cacheStrategy,
            expectedImprovement: await this.estimateImprovement(query, optimized)
        };
    }

    // Automatic index management
    async manageIndexes(): Promise<void> {
        // Analyze query patterns
        const patterns = await this.analyzeQueryPatterns();

        // Identify missing indexes
        const missing = await this.identifyMissingIndexes(patterns);

        // Identify unused indexes
        const unused = await this.identifyUnusedIndexes();

        // Create beneficial indexes
        for (const index of missing) {
            if (index.benefitScore > 0.8) {
                await this.createIndex(index);
            }
        }

        // Drop unused indexes
        for (const index of unused) {
            if (index.usageCount < 10 && index.ageDay > 30) {
                await this.dropIndex(index);
            }
        }
    }
}
```

#### Week 11: Monitoring & Alerting

**Data Platform Monitoring**:
```typescript
class DataMonitoring {
    private metrics: MetricsCollector;
    private healthChecker: HealthChecker;
    private alertManager: AlertManager;

    async monitorDataPipeline(): Promise<void> {
        // Monitor data freshness
        await this.monitorFreshness();

        // Monitor data quality
        await this.monitorQuality();

        // Monitor performance
        await this.monitorPerformance();

        // Monitor costs
        await this.monitorCosts();
    }

    private async monitorFreshness(): Promise<void> {
        const tables = await this.getMonitoredTables();

        for (const table of tables) {
            const lastUpdate = await this.getLastUpdate(table);
            const expectedUpdate = await this.getExpectedUpdate(table);

            if (lastUpdate < expectedUpdate) {
                await this.alert({
                    type: 'data_staleness',
                    table,
                    lastUpdate,
                    expectedUpdate,
                    severity: this.calculateSeverity(table, lastUpdate)
                });
            }
        }
    }

    // SLA monitoring
    async monitorSLA(): Promise<SLAReport> {
        const slas = await this.getSLAs();
        const report = new SLAReport();

        for (const sla of slas) {
            const metrics = await this.measureSLA(sla);

            report.add({
                sla: sla.name,
                target: sla.target,
                actual: metrics.value,
                compliance: metrics.value >= sla.target,
                period: sla.period
            });

            if (metrics.value < sla.target) {
                await this.escalate(sla, metrics);
            }
        }

        return report;
    }
}
```

#### Week 12: Launch & Scale

**Production Data Platform**:
```yaml
Storage Systems:
  PostgreSQL:
    - 3 masters (write)
    - 9 replicas (read)
    - 100TB storage
    - <10ms query time

  Redis Cluster:
    - 6 nodes
    - 500GB memory
    - <1ms response
    - 1M ops/second

  ClickHouse:
    - 4 shards
    - 3 replicas per shard
    - 1PB storage
    - 100K queries/second

  Pinecone:
    - 4 pods
    - 100M vectors
    - <50ms similarity search
    - 10K queries/second

Analytics:
  Stream Processing:
    - 1M events/second
    - <100ms latency
    - Exactly-once semantics

  ML Pipeline:
    - 100+ models in production
    - <100ms inference
    - Online learning enabled
    - A/B testing platform

  Search:
    - 10TB indexed data
    - <50ms search latency
    - 99.99% availability

Performance:
  Query Latency:
    - P50: <10ms
    - P95: <50ms
    - P99: <200ms

  Throughput:
    - Writes: 100K/second
    - Reads: 1M/second
    - Analytics: 10K queries/second

  Scale:
    - 100TB active data
    - 1PB total storage
    - 100M daily events
    - 10K concurrent users
```

## Testing Strategy

```typescript
describe('Data Platform', () => {
    describe('Multi-tier Storage', () => {
        it('should route queries to optimal tier', async () => {
            const platform = new TideDataPlatform();

            // Hot data query
            const hotQuery = { key: 'user:active:123', type: 'hot' };
            const hotResult = await platform.query(hotQuery);
            expect(hotResult.latency).toBeLessThan(1);

            // Analytics query
            const analyticsQuery = { type: 'analytics', range: '30d' };
            const analyticsResult = await platform.query(analyticsQuery);
            expect(analyticsResult.source).toBe('clickhouse');
        });
    });

    describe('Stream Processing', () => {
        it('should detect patterns in real-time', async () => {
            const processor = new StreamProcessor();

            const events = generateTestEvents(1000);
            const patterns = await processor.process(events);

            expect(patterns).toContainEqual(
                expect.objectContaining({
                    type: 'sequence',
                    confidence: expect.toBeGreaterThan(0.8)
                })
            );
        });
    });
});
```

## Success Metrics

**Week 3**:
- All storage tiers operational ✓
- Basic queries working ✓
- Vector search functional ✓

**Week 6**:
- Stream processing live ✓
- ML pipeline training models ✓
- Search indexing complete ✓

**Week 9**:
- Advanced analytics working ✓
- Predictions accurate >80% ✓
- Data quality monitored ✓

**Week 12**:
- Production deployed ✓
- 1M events/second processed ✓
- <50ms P95 query latency ✓
- 100TB data managed ✓

This Data & Analytics Platform provides the sophisticated data infrastructure that powers Tide's intelligence at massive scale.