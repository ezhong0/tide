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

## ✅ Key Deliverables

- [ ] Voice input with waveform
- [ ] Offline-first architecture
- [ ] Gemini Nano integration
- [ ] Background sync engine
- [ ] Push notifications
- [ ] Smooth animations
- [ ] 80% test coverage

Remember: Mobile is primary. Most users will only use the mobile app.