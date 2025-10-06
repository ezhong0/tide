# Module 06: Mobile App (React Native)

## 🤖 Claude Instance Prompt

```
You are Claude Instance #6, the Mobile App Architect for Tide.

Your mission: Build an offline-first React Native app with voice input that works seamlessly even without internet, using Gemini Nano for on-device AI.

Core responsibilities:
1. Implement voice input with real-time waveform
2. Build offline-first architecture with sync
3. Integrate Gemini Nano for on-device AI
4. Create smooth animations and transitions
5. Handle background sync and push notifications

Make it feel instant and magical, even offline.
```

## 📋 Module Overview

**Duration**: 4 weeks
**Dependencies**: Mock API endpoints from Module 00

## 🎯 Success Criteria

```typescript
const successCriteria = {
  offline: "80% features work offline",
  performance: "App start <1s, interactions <100ms",
  voice: "STT accuracy >95%",
  sync: "Seamless background sync"
};
```

## 🏗️ Core Architecture

### Offline-First Architecture

```typescript
class OfflineManager {
  private db: WatermelonDB;
  private syncQueue: Queue<SyncOperation>;

  async executeCommand(command: Command): Promise<Result> {
    if (this.isOnline()) {
      return this.executeOnline(command);
    }

    // Check offline capability
    if (this.canExecuteOffline(command.type)) {
      const result = await this.executeOffline(command);
      await this.queueForSync(command, result);
      return result;
    }

    // Queue for later
    await this.queueForLater(command);
    return { status: 'queued', message: 'Will execute when online' };
  }

  private offlineCapabilities = {
    'check_calendar': true,     // Synced locally
    'search_emails': true,       // Local search
    'draft_email': true,         // Save draft locally
    'send_email': false,         // Needs network
    'schedule_meeting': 'partial' // Check availability offline
  };
}
```

### Voice Input with Gemini Nano

```typescript
class VoiceInput {
  private recorder: AudioRecorder;
  private geminiNano: GeminiNano;

  async startRecording(): Promise<void> {
    // Start recording with waveform visualization
    this.recorder.start({
      onAudioData: (data) => this.updateWaveform(data),
      onSilenceDetected: () => this.autoStop()
    });
  }

  async processVoice(audioBuffer: ArrayBuffer): Promise<string> {
    // Try on-device first (instant)
    const transcript = await this.geminiNano.transcribe(audioBuffer);

    if (transcript.confidence > 0.9) {
      return transcript.text;
    }

    // Fall back to server if needed
    if (this.isOnline()) {
      return this.serverTranscribe(audioBuffer);
    }

    return transcript.text; // Use local even if lower confidence
  }
}
```

### App Structure

```typescript
// src/screens/
├── HomeScreen.tsx         // Voice input + recent commands
├── DraftReviewScreen.tsx  // Review and edit AI drafts
├── CommandHistoryScreen.tsx
└── SettingsScreen.tsx

// src/components/
├── VoiceButton.tsx        // Animated voice input
├── WaveformVisualizer.tsx // Real-time audio visualization
├── CommandCard.tsx        // Display command results
└── OfflineIndicator.tsx   // Show sync status

// src/services/
├── OfflineEngine.ts       // Offline execution
├── SyncEngine.ts          // Background sync
├── LocalAI.ts             // Gemini Nano integration
└── PushNotifications.ts   // Handle notifications

// src/store/
└── store.ts               // Zustand state management
```

### Key Components

```typescript
// Voice input with haptic feedback
const VoiceButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const animation = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(!isRecording);

    // Pulse animation while recording
    animation.value = withRepeat(
      withSpring(1.2),
      -1,
      true
    );
  };

  return (
    <Animated.Pressable
      onPress={handlePress}
      style={[styles.button, animatedStyle]}
    >
      <MicrophoneIcon />
    </Animated.Pressable>
  );
};
```

## 🔄 Sync Conflict Resolution

```typescript
// Comprehensive sync conflict resolution
class SyncConflictResolver {
  private conflictStrategies = new Map<ConflictType, ResolutionStrategy>();

  constructor() {
    this.registerStrategies();
  }

  private registerStrategies() {
    // Last-write-wins for simple fields
    this.conflictStrategies.set('simple_field', {
      resolve: (local, remote) => {
        return local.updatedAt > remote.updatedAt ? local : remote;
      }
    });

    // Merge for arrays (union)
    this.conflictStrategies.set('array_merge', {
      resolve: (local, remote) => {
        const merged = [...new Set([...local.value, ...remote.value])];
        return { value: merged, updatedAt: Math.max(local.updatedAt, remote.updatedAt) };
      }
    });

    // Three-way merge for text
    this.conflictStrategies.set('text_merge', {
      resolve: async (local, remote, base) => {
        const patches = diff3.merge(base.text, local.text, remote.text);
        if (patches.conflict) {
          // Manual resolution needed
          return { needsManualResolution: true, conflicts: patches.conflicts };
        }
        return { text: patches.result, updatedAt: Date.now() };
      }
    });

    // Custom resolution for calendar conflicts
    this.conflictStrategies.set('calendar_event', {
      resolve: (local, remote) => {
        // If both modified, create duplicate and let user resolve
        if (local.modified && remote.modified) {
          return {
            action: 'duplicate',
            events: [
              { ...local, title: `${local.title} (local)` },
              { ...remote, title: `${remote.title} (cloud)` }
            ]
          };
        }
        // Otherwise, take the modified one
        return local.modified ? local : remote;
      }
    });
  }

  async resolveConflict(conflict: SyncConflict): Promise<Resolution> {
    const strategy = this.conflictStrategies.get(conflict.type);

    if (!strategy) {
      // Default: prompt user
      return this.promptUserResolution(conflict);
    }

    try {
      const resolution = await strategy.resolve(
        conflict.local,
        conflict.remote,
        conflict.base
      );

      // Log resolution for analytics
      await this.logResolution(conflict, resolution);

      return resolution;
    } catch (error) {
      // Fallback to manual resolution
      return this.promptUserResolution(conflict);
    }
  }

  async resolveBatch(conflicts: SyncConflict[]): Promise<Resolution[]> {
    // Group by type for efficient resolution
    const grouped = this.groupConflictsByType(conflicts);

    const resolutions = await Promise.all(
      Object.entries(grouped).map(async ([type, conflicts]) => {
        if (type === 'auto_resolvable') {
          return this.autoResolveMultiple(conflicts);
        }
        return this.resolveMultiple(conflicts);
      })
    );

    return resolutions.flat();
  }
}

// Offline queue with conflict detection
class OfflineQueueWithConflictDetection {
  private queue: OfflineOperation[] = [];
  private conflictDetector = new ConflictDetector();

  async addOperation(operation: OfflineOperation): Promise<void> {
    // Check for potential conflicts with existing queue
    const conflicts = await this.detectConflicts(operation);

    if (conflicts.length > 0) {
      // Merge or reorder operations to minimize conflicts
      operation = await this.mergeOperations(operation, conflicts);
    }

    this.queue.push(operation);
    await this.persistQueue();
  }

  private async detectConflicts(newOp: OfflineOperation): Promise<OfflineOperation[]> {
    return this.queue.filter(existingOp => {
      // Same resource and overlapping fields
      if (existingOp.resourceId === newOp.resourceId) {
        const fieldsOverlap = this.fieldsOverlap(
          existingOp.modifiedFields,
          newOp.modifiedFields
        );
        return fieldsOverlap;
      }
      return false;
    });
  }

  private async mergeOperations(
    newOp: OfflineOperation,
    conflicts: OfflineOperation[]
  ): Promise<OfflineOperation> {
    // Combine operations on same resource
    const merged = conflicts.reduce((acc, conflict) => {
      if (conflict.type === 'update' && acc.type === 'update') {
        // Merge updates
        return {
          ...acc,
          data: { ...conflict.data, ...acc.data },
          modifiedFields: [...conflict.modifiedFields, ...acc.modifiedFields]
        };
      }
      // Delete supersedes updates
      if (conflict.type === 'delete' || acc.type === 'delete') {
        return acc.type === 'delete' ? acc : conflict;
      }
      return acc;
    }, newOp);

    // Remove merged operations from queue
    this.queue = this.queue.filter(op => !conflicts.includes(op));

    return merged;
  }

  async sync(): Promise<SyncResult> {
    const results: SyncResult = {
      successful: [],
      failed: [],
      conflicts: []
    };

    // Process queue in order
    for (const operation of this.queue) {
      try {
        // Check server state before applying
        const serverState = await this.getServerState(operation.resourceId);
        const conflict = this.detectConflict(operation, serverState);

        if (conflict) {
          const resolution = await this.conflictResolver.resolve(conflict);

          if (resolution.action === 'retry') {
            operation.data = resolution.data;
          } else if (resolution.action === 'skip') {
            continue;
          }
        }

        // Apply operation
        const result = await this.applyOperation(operation);
        results.successful.push(result);

        // Remove from queue
        this.queue = this.queue.filter(op => op.id !== operation.id);

      } catch (error) {
        if (error.retryable) {
          // Keep in queue for retry
          operation.retryCount = (operation.retryCount || 0) + 1;
        } else {
          results.failed.push({ operation, error });
          this.queue = this.queue.filter(op => op.id !== operation.id);
        }
      }
    }

    await this.persistQueue();
    return results;
  }
}
```

## 📱 Offline-First Implementation

```typescript
// Complete offline-first architecture
class OfflineFirstManager {
  private db = new WatermelonDB();
  private syncEngine = new SyncEngine();
  private conflictResolver = new SyncConflictResolver();

  async executeCommand(command: Command): Promise<Result> {
    // Check network status
    const isOnline = await NetInfo.fetch().then(state => state.isConnected);

    if (isOnline) {
      try {
        // Try online execution with timeout
        const result = await Promise.race([
          this.executeOnline(command),
          this.timeout(3000) // 3 second timeout
        ]);

        // Update local database
        await this.updateLocalDatabase(result);
        return result;

      } catch (error) {
        // Fall through to offline
        console.warn('Online execution failed, falling back to offline', error);
      }
    }

    // Execute offline
    return this.executeOffline(command);
  }

  private async executeOffline(command: Command): Promise<Result> {
    // Check if command can be executed offline
    const capability = this.getOfflineCapability(command.type);

    switch (capability) {
      case 'full':
        // Full offline support
        return this.executeOfflineWithFullSupport(command);

      case 'partial':
        // Partial support (e.g., can check but not modify)
        return this.executeOfflineWithPartialSupport(command);

      case 'queue':
        // Queue for later execution
        await this.queueForSync(command);
        return {
          success: true,
          offline: true,
          message: 'Command queued and will execute when online'
        };

      default:
        throw new Error('This command requires an internet connection');
    }
  }

  private getOfflineCapability(commandType: string): OfflineCapability {
    const capabilities = {
      // Full offline support
      'view_calendar': 'full',
      'search_emails': 'full',
      'view_contacts': 'full',
      'create_draft': 'full',

      // Partial offline support
      'check_availability': 'partial',
      'schedule_meeting': 'partial',

      // Must queue
      'send_email': 'queue',
      'update_calendar': 'queue'
    };

    return capabilities[commandType] || 'none';
  }

  // Background sync
  async startBackgroundSync() {
    BackgroundFetch.configure({
      minimumFetchInterval: 15, // minutes
      stopOnTerminate: false,
      startOnBoot: true
    }, async (taskId) => {
      try {
        const syncResult = await this.sync();

        // Notify user of important updates
        if (syncResult.hasImportantUpdates) {
          await this.notifyUser(syncResult.updates);
        }

        BackgroundFetch.finish(taskId);
      } catch (error) {
        console.error('Background sync failed', error);
        BackgroundFetch.finish(taskId);
      }
    });
  }

  private async sync(): Promise<SyncResult> {
    // Get local changes
    const localChanges = await this.db.getUnsyncedChanges();

    // Get remote changes
    const remoteChanges = await this.api.getChanges(this.lastSyncToken);

    // Detect conflicts
    const conflicts = this.detectConflicts(localChanges, remoteChanges);

    // Resolve conflicts
    const resolutions = await Promise.all(
      conflicts.map(c => this.conflictResolver.resolveConflict(c))
    );

    // Apply resolutions
    await this.applyResolutions(resolutions);

    // Update sync token
    this.lastSyncToken = remoteChanges.syncToken;

    return {
      synced: localChanges.length + remoteChanges.length,
      conflicts: conflicts.length,
      hasImportantUpdates: this.hasImportantUpdates(remoteChanges)
    };
  }
}
```

## 🎯 Performance Optimization

```typescript
// React Native performance optimizations
class PerformanceOptimizedApp {
  // Lazy load heavy components
  const HeavyComponent = lazy(() => import('./HeavyComponent'));

  // Memoize expensive computations
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
  }, [data]);

  // Use InteractionManager for heavy operations
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Heavy operation that won't block animations
      performHeavyOperation();
    });
  }, []);

  // Optimize list rendering
  const renderItem = useCallback(({ item }) => (
    <MemoizedItem item={item} />
  ), []);

  // Use native driver for animations
  const animatedValue = useRef(new Animated.Value(0)).current;

  Animated.timing(animatedValue, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true // Important!
  }).start();

  // Optimize images
  <FastImage
    source={{ uri: imageUrl }}
    style={styles.image}
    resizeMode={FastImage.resizeMode.cover}
    priority={FastImage.priority.normal}
  />
}
```

## 🧪 Testing Strategy

```typescript
describe('Sync Conflict Resolution', () => {
  it('should resolve simple conflicts automatically', async () => {
    const resolver = new SyncConflictResolver();

    const conflict = {
      type: 'simple_field',
      local: { value: 'A', updatedAt: 1000 },
      remote: { value: 'B', updatedAt: 2000 }
    };

    const resolution = await resolver.resolveConflict(conflict);

    expect(resolution.value).toBe('B'); // Remote is newer
  });

  it('should handle complex three-way merges', async () => {
    const conflict = {
      type: 'text_merge',
      base: { text: 'Hello world' },
      local: { text: 'Hello beautiful world' },
      remote: { text: 'Hello world today' }
    };

    const resolution = await resolver.resolveConflict(conflict);

    expect(resolution.text).toBe('Hello beautiful world today');
  });

  it('should queue operations when offline', async () => {
    const manager = new OfflineFirstManager();

    // Simulate offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    const result = await manager.executeCommand({
      type: 'send_email',
      data: { to: 'test@example.com' }
    });

    expect(result.offline).toBe(true);
    expect(result.message).toContain('queued');
  });
});

describe('Performance', () => {
  it('should maintain 60fps during scroll', async () => {
    const screen = render(<EmailList emails={largeEmailList} />);

    const frameDrops = await measureFrameDrops(() => {
      fireEvent.scroll(screen.getByTestId('email-list'), {
        nativeEvent: { contentOffset: { y: 1000 } }
      });
    });

    expect(frameDrops).toBeLessThan(2); // Max 2 frame drops
  });
});
```

## ✅ Key Deliverables

- [ ] Voice input with waveform
- [ ] Offline-first architecture
- [ ] Gemini Nano integration
- [ ] Background sync engine
- [ ] Push notifications
- [ ] Smooth animations
- [ ] 80% test coverage

Remember: Mobile is primary. Most users will only use the mobile app.