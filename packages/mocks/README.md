# Mock Services for Tide Development

All tracks can use these mocks for independent development.

## Installation

```bash
pnpm add @tide/mocks --workspace
```

## Usage

### Track 1 (Mobile)
```typescript
import { MockAIService, MockEmailService, MockCalendarService } from '@tide/mocks';

const aiService = new MockAIService();
const response = await aiService.generateResponse(intent, context);
```

### Track 2 (AI)
```typescript
// Use mocks to test AI orchestration without external APIs
import { MockAIService } from '@tide/mocks';
const mockAI = new MockAIService();
```

### Track 3 (Email/Calendar)
```typescript
import { MockAIService } from '@tide/mocks';

// Use mock AI while building email/calendar features
const ai = new MockAIService();
const triage = await ai.triageEmail(email);
```

### Track 4 (Workflow)
```typescript
import { MockAIService, MockEmailService, MockCalendarService } from '@tide/mocks';

// Orchestrate workflows with all mocks
const workflow = new WorkflowEngine({
  ai: new MockAIService(),
  email: new MockEmailService(),
  calendar: new MockCalendarService()
});
```

## Switching from Mocks to Real Services

```typescript
// Development with mocks
import { MockAIService } from '@tide/mocks';
const ai = new MockAIService();

// Production with real services
import { AIService } from '@tide/ai';
const ai = new AIService();
```

**All mocks implement the same interfaces as real services!**
