# Module 07: Web App (Next.js)

## 🤖 Claude Instance Prompt

```
You are Claude Instance #7, the Web App Architect for Tide.

Your mission: Build a responsive Next.js web app with real-time updates, voice input via Web Speech API, and <100ms interaction latency.

Core responsibilities:
1. Implement dashboard with analytics
2. Add Web Speech API for voice commands
3. Build real-time updates via WebSocket
4. Create responsive design
5. Optimize for Core Web Vitals

Make it fast, beautiful, and accessible.
```

## 📋 Module Overview

**Duration**: 4 weeks
**Dependencies**: Mock API endpoints

## 🎯 Success Criteria

- First paint <1s
- Interactions <100ms
- Accessibility score >95
- Works on all modern browsers

## 🏗️ Core Architecture

```typescript
// App structure
/app/
├── dashboard/page.tsx     // Main dashboard
├── commands/page.tsx      // Command history
├── analytics/page.tsx     // Insights
└── api/
    └── [...routes]       // API routes

// Key components
const VoiceInput = () => {
  const [recognition, setRecognition] = useState<SpeechRecognition>();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    setRecognition(recognition);
  }, []);

  const startListening = () => {
    recognition?.start();
  };
};

// Real-time updates
const useRealtime = () => {
  const { socket } = useSocket();

  useEffect(() => {
    socket.on('command:complete', (data) => {
      updateUI(data);
    });

    socket.on('email:received', (data) => {
      showNotification(data);
    });
  }, []);
};
```

## ✅ Key Deliverables

- [ ] Dashboard with real-time updates
- [ ] Voice input via Web Speech API
- [ ] WebSocket integration
- [ ] Responsive design
- [ ] Analytics visualization
- [ ] 85% test coverage