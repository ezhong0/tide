# 📡 Connection Status UI Guide

**Purpose:** Add visual connection status indicators to both iOS and Android apps

**Status:** Reference implementation guide

---

## iOS Implementation

### Option 1: Simple Text Indicator (Easiest)

**Add to ChatView.swift header:**

```swift
// In ChatView.swift
@EnvironmentObject var tide: TideCore

var body: some View {
    NavigationView {
        VStack(spacing: 0) {
            // Connection Status Bar
            if !tide.isConnected {
                HStack {
                    Image(systemName: "wifi.slash")
                        .foreground Color(.systemRed)
                    Text(tide.connectionStatus)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color(.systemYellow).opacity(0.2))
            }

            // Rest of your chat UI...
            ScrollView {
                // messages
            }
        }
    }
}
```

---

### Option 2: Animated Status Dot

```swift
struct ConnectionStatusView: View {
    @EnvironmentObject var tide: TideCore

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
                .overlay(
                    Circle()
                        .stroke(statusColor, lineWidth: tide.connectionStatus == "Connecting..." ? 2 : 0)
                        .scaleEffect(tide.connectionStatus == "Connecting..." ? 1.3 : 1)
                        .opacity(tide.connectionStatus == "Connecting..." ? 0 : 1)
                        .animation(.easeOut(duration: 1).repeatForever(autoreverses: false), value: tide.connectionStatus)
                )

            Text(tide.connectionStatus)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }

    private var statusColor: Color {
        switch tide.connectionStatus {
        case "Connected":
            return .green
        case "Connecting...":
            return .orange
        default:
            return .red
        }
    }
}

// Usage in ChatView:
VStack {
    ConnectionStatusView()
        .padding(.top, 8)

    // Rest of chat UI
}
```

---

### Option 3: Banner with Retry

```swift
struct ConnectionBanner: View {
    @EnvironmentObject var tide: TideCore

    var body: some View {
        if !tide.isConnected {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Not Connected")
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text("Messages will be sent when connection is restored")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Button("Retry") {
                    if let token = tide.accessToken {
                        tide.connectWebSocket(token: token)
                    }
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
            .padding()
            .background(Color(.systemYellow).opacity(0.2))
            .cornerRadius(8)
            .padding(.horizontal)
        }
    }
}
```

---

## Android Implementation

### Option 1: Simple Snackbar

**Add to ChatScreen.kt:**

```kotlin
@Composable
fun ChatScreen(tideCore: TideCore = TideCore.getInstance()) {
    val isConnected by tideCore.isConnected.collectAsState()
    val connectionStatus by tideCore.connectionStatus.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(isConnected) {
        if (!isConnected) {
            snackbarHostState.showSnackbar(
                message = connectionStatus,
                duration = SnackbarDuration.Indefinite
            )
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        // Your chat UI
    }
}
```

---

### Option 2: Status Bar

```kotlin
@Composable
fun ConnectionStatusBar(
    isConnected: Boolean,
    status: String
) {
    AnimatedVisibility(
        visible = !isConnected,
        enter = slideInVertically() + fadeIn(),
        exit = slideOutVertically() + fadeOut()
    ) {
        Surface(
            color = MaterialTheme.colorScheme.errorContainer,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error
                )

                Spacer(modifier = Modifier.width(12.dp))

                Text(
                    text = status,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
    }
}

// Usage:
Column {
    val isConnected by tideCore.isConnected.collectAsState()
    val status by tideCore.connectionStatus.collectAsState()

    ConnectionStatusBar(isConnected, status)

    // Rest of chat UI
}
```

---

### Option 3: Floating Status Chip

```kotlin
@Composable
fun FloatingConnectionStatus(
    modifier: Modifier = Modifier,
    isConnected: Boolean,
    status: String
) {
    val backgroundColor = when (status) {
        "Connected" -> Color(0xFF4CAF50)  // Green
        "Connecting..." -> Color(0xFFFF9800)  // Orange
        else -> Color(0xFFF44336)  // Red
    }

    AnimatedVisibility(
        visible = true,
        modifier = modifier
    ) {
        Surface(
            color = backgroundColor,
            shape = RoundedCornerShape(16.dp),
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Pulsing dot for "Connecting..."
                if (status == "Connecting...") {
                    val infiniteTransition = rememberInfiniteTransition()
                    val alpha by infiniteTransition.animateFloat(
                        initialValue = 0.3f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(1000),
                            repeatMode = RepeatMode.Reverse
                        )
                    )

                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .alpha(alpha)
                            .background(Color.White, CircleShape)
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(Color.White, CircleShape)
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = status,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White
                )
            }
        }
    }
}

// Usage with positioning:
Box(modifier = Modifier.fillMaxSize()) {
    // Chat UI

    FloatingConnectionStatus(
        modifier = Modifier
            .align(Alignment.TopCenter)
            .padding(top = 8.dp),
        isConnected = isConnected,
        status = status
    )
}
```

---

## Recommended Approach

### For MVP/Alpha Testing:
**Use Option 1 (Simple Indicator)** - Quick to implement, gets the job done

### For Production:
**Use Option 2 or 3** - Better UX with animations and visual feedback

---

## Key States to Display

Both platforms should show:

1. **Connected** (Green) - Everything working
2. **Connecting...** (Orange/Yellow) - In progress, show animation
3. **Disconnected** (Red) - Connection lost, show retry option
4. **Reconnecting...** (Orange) - Auto-retry in progress

---

## Testing Connection States

```bash
# Terminal 1: Stop WebSocket service to test disconnected state
# (Press Ctrl+C in the terminal running the WebSocket service)

# Terminal 2: Start it again to test reconnection
cd packages/services/realtime
pnpm dev
```

**In app, you should see:**
1. Status changes from "Connected" to "Disconnected"
2. Visual indicator appears (red/orange)
3. When service restarts, automatically reconnects
4. Status changes back to "Connected" (green)

---

## Already Integrated!

The connection status is **already available** in both apps:

### iOS:
```swift
@EnvironmentObject var tide: TideCore

// Available properties:
tide.isConnected    // Bool
tide.connectionStatus  // String: "Connected", "Connecting...", "Disconnected"
```

### Android:
```kotlin
val tide = TideCore.getInstance()

// Available flows:
val isConnected by tide.isConnected.collectAsState()
val status by tide.connectionStatus.collectAsState()
```

---

## Implementation Time

- **Option 1 (Simple)**: 10-15 minutes per platform
- **Option 2 (Animated)**: 30-45 minutes per platform
- **Option 3 (Advanced)**: 45-60 minutes per platform

---

## Next Steps

1. **Choose** which option to implement
2. **Add** to your chat screen
3. **Test** by stopping/starting the WebSocket service
4. **Polish** colors and animations to match your design system

---

**Status:** Connection status tracking is **fully integrated** in TideCore. Just add the UI component!
