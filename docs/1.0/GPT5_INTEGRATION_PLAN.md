# 🧠 GPT-5 Function Calling Integration Plan

**Timeline**: Weeks 3-5 (3 weeks)
**Priority**: 🔴 P0 - Core Intelligence Layer
**Dependencies**: Architecture cleanup complete
**Impact**: 10x smarter AI capabilities

---

## 🎯 Vision: AI Chief of Staff with Tool Use

### The Transformation

**Current System** (Multi-Model Router):
```
User Request → Intent Detection → Route to Agent → Agent Executes → Combine Results
```
- Hard-coded routing logic
- Limited flexibility
- Can't handle novel combinations
- Agent selection is static

**GPT-5 System** (Intelligent Tool Orchestration):
```
User Request → GPT-5 analyzes → Selects tools dynamically → Calls in parallel/sequence → Synthesizes result
```
- GPT-5 decides which tools to use
- Can combine tools creatively
- Handles complex multi-step tasks
- Adapts to user intent

### Example: Before vs After

**Request**: "Schedule a meeting with the engineering team next week, but only on days when I don't have back-to-back meetings, and send them an agenda based on our last standup notes."

**Before** (Current System):
- Intent detector identifies: `calendar_schedule`
- Routes to: Calendar Scheduler agent
- **Problem**: Can't handle the constraint about back-to-back meetings
- **Problem**: Can't access standup notes or compose agenda

**After** (GPT-5 Function Calling):
- GPT-5 analyzes full request
- Calls tools in sequence:
  1. `get_calendar_events` (next week)
  2. `analyze_schedule_gaps` (no back-to-back)
  3. `search_emails` (last standup notes)
  4. `compose_agenda` (from notes)
  5. `create_calendar_event` (meeting)
  6. `send_email` (invite with agenda)
- All orchestrated intelligently by GPT-5

---

## 🏗️ Architecture Design

### 1. Tool Registry System

Create a central registry of all available tools:

```typescript
// packages/services/ai/src/tools/registry.ts

export interface TideTool {
  type: 'function' | 'custom';
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any, context: ToolContext) => Promise<any>;
}

export interface ToolContext {
  userId: string;
  requestId: string;
  services: {
    email: EmailService;
    calendar: CalendarService;
    tasks: WorkflowService;
    // ... other services
  };
}

export class ToolRegistry {
  private tools: Map<string, TideTool> = new Map();

  register(tool: TideTool): void {
    this.tools.set(tool.name, tool);
  }

  getAll(): TideTool[] {
    return Array.from(this.tools.values());
  }

  async execute(name: string, params: any, context: ToolContext): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return await tool.handler(params, context);
  }
}
```

### 2. Agent-to-Tool Conversion

Convert existing agents into GPT-5 callable tools:

#### Email Tools
```typescript
// packages/services/ai/src/tools/email.tools.ts

export const emailTools: TideTool[] = [
  {
    type: 'function',
    name: 'search_emails',
    description: 'Search user emails by query, sender, date range, or other criteria',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        from: { type: 'string', description: 'Filter by sender email' },
        dateFrom: { type: 'string', description: 'Start date (ISO 8601)' },
        dateTo: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max results (default 20)' }
      },
      required: ['query']
    },
    handler: async (params, context) => {
      const emails = await context.services.email.search({
        userId: context.userId,
        ...params
      });
      return emails;
    }
  },

  {
    type: 'function',
    name: 'compose_email',
    description: 'Compose a draft email with AI assistance, matching user writing style',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject' },
        context: { type: 'string', description: 'What the email should communicate' },
        tone: {
          type: 'string',
          enum: ['professional', 'casual', 'formal', 'friendly'],
          description: 'Desired tone'
        },
        length: {
          type: 'string',
          enum: ['brief', 'balanced', 'detailed'],
          description: 'Desired length'
        }
      },
      required: ['to', 'context']
    },
    handler: async (params, context) => {
      // Use existing email composer agent
      const draft = await context.services.email.composeDraft({
        userId: context.userId,
        ...params
      });
      return { draft, previewText: draft.substring(0, 200) };
    }
  },

  {
    type: 'function',
    name: 'send_email',
    description: 'Send an email (requires user confirmation for important emails)',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
        cc: { type: 'array', items: { type: 'string' } },
        bcc: { type: 'array', items: { type: 'string' } }
      },
      required: ['to', 'subject', 'body']
    },
    handler: async (params, context) => {
      const result = await context.services.email.send({
        userId: context.userId,
        ...params
      });
      return { sent: true, messageId: result.id };
    }
  },

  {
    type: 'function',
    name: 'categorize_emails',
    description: 'Automatically categorize and prioritize emails using AI',
    parameters: {
      type: 'object',
      properties: {
        emailIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email IDs to categorize'
        }
      },
      required: ['emailIds']
    },
    handler: async (params, context) => {
      // Use existing triage agent
      const categorized = await context.services.email.triageEmails({
        userId: context.userId,
        emailIds: params.emailIds
      });
      return categorized;
    }
  }
];
```

#### Calendar Tools
```typescript
// packages/services/ai/src/tools/calendar.tools.ts

export const calendarTools: TideTool[] = [
  {
    type: 'function',
    name: 'get_calendar_events',
    description: 'Get calendar events for a specific date range',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' }
      },
      required: ['startDate', 'endDate']
    },
    handler: async (params, context) => {
      const events = await context.services.calendar.getEvents({
        userId: context.userId,
        startDate: params.startDate,
        endDate: params.endDate
      });
      return events;
    }
  },

  {
    type: 'function',
    name: 'create_calendar_event',
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        startTime: { type: 'string', description: 'ISO 8601 datetime' },
        endTime: { type: 'string', description: 'ISO 8601 datetime' },
        description: { type: 'string' },
        attendees: { type: 'array', items: { type: 'string' } },
        location: { type: 'string' }
      },
      required: ['title', 'startTime', 'endTime']
    },
    handler: async (params, context) => {
      const event = await context.services.calendar.createEvent({
        userId: context.userId,
        ...params
      });
      return event;
    }
  },

  {
    type: 'function',
    name: 'find_meeting_times',
    description: 'Find optimal meeting times considering all attendee calendars and constraints',
    parameters: {
      type: 'object',
      properties: {
        attendees: { type: 'array', items: { type: 'string' } },
        duration: { type: 'number', description: 'Duration in minutes' },
        dateRange: {
          type: 'object',
          properties: {
            start: { type: 'string' },
            end: { type: 'string' }
          }
        },
        constraints: {
          type: 'object',
          properties: {
            preferredTimes: { type: 'array', items: { type: 'string' } },
            avoidBackToBack: { type: 'boolean' },
            minBreakMinutes: { type: 'number' }
          }
        }
      },
      required: ['attendees', 'duration']
    },
    handler: async (params, context) => {
      // Use existing smart scheduler agent
      const slots = await context.services.calendar.findMeetingSlots({
        userId: context.userId,
        ...params
      });
      return slots;
    }
  },

  {
    type: 'function',
    name: 'analyze_calendar_load',
    description: 'Analyze calendar to find busy periods, free time, and schedule optimization opportunities',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string' },
        endDate: { type: 'string' }
      },
      required: ['startDate', 'endDate']
    },
    handler: async (params, context) => {
      // Use calendar optimizer agent
      const analysis = await context.services.calendar.analyzeLoad({
        userId: context.userId,
        ...params
      });
      return analysis;
    }
  }
];
```

#### Task & Workflow Tools
```typescript
// packages/services/ai/src/tools/task.tools.ts

export const taskTools: TideTool[] = [
  {
    type: 'function',
    name: 'create_task',
    description: 'Create a new task with optional sub-tasks',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        dueDate: { type: 'string', description: 'ISO 8601 date' },
        estimatedHours: { type: 'number' },
        subtasks: { type: 'array', items: { type: 'string' } }
      },
      required: ['title']
    },
    handler: async (params, context) => {
      const task = await context.services.tasks.createTask({
        userId: context.userId,
        ...params
      });
      return task;
    }
  },

  {
    type: 'function',
    name: 'get_tasks',
    description: 'Get user tasks, optionally filtered by status or priority',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'blocked'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        dueBefore: { type: 'string' }
      }
    },
    handler: async (params, context) => {
      const tasks = await context.services.tasks.getTasks({
        userId: context.userId,
        ...params
      });
      return tasks;
    }
  },

  {
    type: 'function',
    name: 'prioritize_tasks',
    description: 'AI-powered task prioritization based on deadlines, dependencies, and importance',
    parameters: {
      type: 'object',
      properties: {
        taskIds: { type: 'array', items: { type: 'string' } },
        criteria: {
          type: 'object',
          properties: {
            weightDeadline: { type: 'number', minimum: 0, maximum: 1 },
            weightImpact: { type: 'number', minimum: 0, maximum: 1 },
            weightEffort: { type: 'number', minimum: 0, maximum: 1 }
          }
        }
      }
    },
    handler: async (params, context) => {
      // Use task prioritizer agent
      const prioritized = await context.services.tasks.prioritizeTasks({
        userId: context.userId,
        ...params
      });
      return prioritized;
    }
  }
];
```

### 3. Custom Tools for Advanced Operations

Use GPT-5's custom tool type for complex operations:

```typescript
// packages/services/ai/src/tools/custom.tools.ts

export const customTools: TideTool[] = [
  {
    type: 'custom',
    name: 'analyze_with_sql',
    description: 'Execute SQL queries to analyze user data (read-only, safe queries only)',
    // No parameters for custom tools - GPT-5 sends free-form text
    handler: async (sqlQuery: string, context) => {
      // Validate query is read-only
      if (!/^SELECT/i.test(sqlQuery.trim())) {
        throw new Error('Only SELECT queries allowed');
      }

      // Execute with user_id filter for security
      const results = await context.services.database.executeQuery(
        sqlQuery,
        { userId: context.userId }
      );

      return results;
    }
  },

  {
    type: 'custom',
    name: 'execute_workflow',
    description: 'Execute a complex multi-step workflow defined in YAML or JSON format',
    handler: async (workflowDefinition: string, context) => {
      // Parse workflow (YAML or JSON)
      const workflow = parseWorkflow(workflowDefinition);

      // Execute using workflow engine
      const result = await context.services.workflow.execute({
        userId: context.userId,
        workflow
      });

      return result;
    }
  },

  {
    type: 'custom',
    name: 'generate_report',
    description: 'Generate a custom report with charts and insights from user data',
    handler: async (reportSpec: string, context) => {
      // Parse report specification
      const spec = parseReportSpec(reportSpec);

      // Generate report using intelligence service
      const report = await context.services.intelligence.generateReport({
        userId: context.userId,
        spec
      });

      return report;
    }
  }
];
```

### 4. GPT-5 Orchestrator

Main orchestrator using GPT-5 function calling:

```typescript
// packages/services/ai/src/orchestration/gpt5-orchestrator.ts

import OpenAI from 'openai';
import { ToolRegistry } from '../tools/registry.js';
import { emailTools } from '../tools/email.tools.js';
import { calendarTools } from '../tools/calendar.tools.js';
import { taskTools } from '../tools/task.tools.js';
import { customTools } from '../tools/custom.tools.js';

export class GPT5Orchestrator {
  private client: OpenAI;
  private registry: ToolRegistry;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.registry = new ToolRegistry();

    // Register all tools
    [...emailTools, ...calendarTools, ...taskTools, ...customTools].forEach(tool => {
      this.registry.register(tool);
    });
  }

  async process(request: AIRequest, context: ToolContext): Promise<AIResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(context)
      },
      {
        role: 'user',
        content: request.content
      }
    ];

    // Convert tools to OpenAI format
    const tools = this.registry.getAll().map(tool => this.convertToOpenAITool(tool));

    let response = await this.client.chat.completions.create({
      model: 'gpt-5',
      messages,
      tools,
      tool_choice: 'auto', // Let GPT-5 decide
    });

    let toolCalls = response.choices[0].message.tool_calls || [];
    const executionLog: any[] = [];

    // Execute tools iteratively
    while (toolCalls.length > 0) {
      // Add GPT-5's message (with tool calls) to conversation
      messages.push(response.choices[0].message);

      // Execute all tool calls (GPT-5 decides parallel vs sequential)
      const toolResults = await Promise.all(
        toolCalls.map(async (call) => {
          const args = JSON.parse(call.function.arguments);

          try {
            const result = await this.registry.execute(
              call.function.name,
              args,
              context
            );

            executionLog.push({
              tool: call.function.name,
              args,
              result,
              success: true
            });

            return {
              tool_call_id: call.id,
              role: 'tool' as const,
              content: JSON.stringify(result)
            };
          } catch (error) {
            executionLog.push({
              tool: call.function.name,
              args,
              error: error.message,
              success: false
            });

            return {
              tool_call_id: call.id,
              role: 'tool' as const,
              content: JSON.stringify({ error: error.message })
            };
          }
        })
      );

      // Add tool results to conversation
      messages.push(...toolResults);

      // Get next response from GPT-5
      response = await this.client.chat.completions.create({
        model: 'gpt-5',
        messages,
        tools,
        tool_choice: 'auto'
      });

      toolCalls = response.choices[0].message.tool_calls || [];
    }

    // Final response
    return {
      requestId: context.requestId,
      content: response.choices[0].message.content || '',
      executionLog,
      model: 'gpt-5',
      tokensUsed: response.usage?.total_tokens || 0,
      confidence: this.calculateConfidence(executionLog),
      timestamp: Date.now()
    };
  }

  private buildSystemPrompt(context: ToolContext): string {
    return `You are Tide, an AI Chief of Staff assistant. You have access to tools to help manage the user's emails, calendar, and tasks.

Current context:
- User ID: ${context.userId}
- Current time: ${new Date().toISOString()}

Guidelines:
1. Use tools proactively to get information needed
2. Call multiple tools in parallel when they don't depend on each other
3. Always confirm before taking destructive actions (delete, send email)
4. Be concise but thorough in your responses
5. If a tool call fails, try an alternative approach
6. Provide preamble messages for long-running operations to keep user informed

You can call tools multiple times and combine results intelligently.`;
  }

  private convertToOpenAITool(tool: TideTool): OpenAI.Chat.ChatCompletionTool {
    if (tool.type === 'custom') {
      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Free-form input for the custom tool'
              }
            },
            required: ['input']
          }
        }
      };
    }

    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters!
      }
    };
  }

  private calculateConfidence(executionLog: any[]): number {
    if (executionLog.length === 0) return 0.5;

    const successCount = executionLog.filter(log => log.success).length;
    return successCount / executionLog.length;
  }
}
```

---

## 📋 Implementation Checklist

### Week 3: Tool Foundation
- [ ] Create ToolRegistry class with registration/execution
- [ ] Convert Email agents to tools (4 tools)
- [ ] Convert Calendar agents to tools (4 tools)
- [ ] Convert Task agents to tools (3 tools)
- [ ] Create custom tools infrastructure (3 tools)
- [ ] Write unit tests for each tool
- [ ] Update service interfaces to support tool context

### Week 4: GPT-5 Integration
- [ ] Implement GPT5Orchestrator class
- [ ] Add OpenAI SDK and configure GPT-5 API
- [ ] Implement tool calling loop (call → execute → respond)
- [ ] Add error handling and retries
- [ ] Implement preamble messages for long operations
- [ ] Add execution logging and debugging
- [ ] Test with 20+ real-world scenarios

### Week 5: Advanced Features & Testing
- [ ] Implement parallel tool execution optimization
- [ ] Add tool execution caching
- [ ] Create tool usage analytics
- [ ] Build confidence scoring system
- [ ] Implement graceful fallback to current system
- [ ] Add cost tracking per request
- [ ] Comprehensive integration tests
- [ ] Performance benchmarking

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('ToolRegistry', () => {
  it('registers and executes tools', async () => {
    const registry = new ToolRegistry();
    const mockTool: TideTool = {
      name: 'test_tool',
      type: 'function',
      description: 'Test tool',
      parameters: { type: 'object', properties: {} },
      handler: async () => ({ success: true })
    };

    registry.register(mockTool);
    const result = await registry.execute('test_tool', {}, mockContext);

    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('GPT5Orchestrator', () => {
  it('handles multi-step email search and compose', async () => {
    const orchestrator = new GPT5Orchestrator(process.env.OPENAI_API_KEY);

    const request = {
      userId: 'test-user',
      content: 'Find emails from john@example.com in the last week and compose a summary reply'
    };

    const response = await orchestrator.process(request, mockContext);

    expect(response.executionLog).toContainEqual(
      expect.objectContaining({ tool: 'search_emails' })
    );
    expect(response.executionLog).toContainEqual(
      expect.objectContaining({ tool: 'compose_email' })
    );
    expect(response.content).toContain('summary');
  });
});
```

### Real-World Scenarios
1. "Schedule a team meeting next week avoiding my busy days"
2. "Find all unread emails from my manager and summarize them"
3. "Create tasks from the action items in my last 3 meetings"
4. "Analyze my calendar and suggest time for deep work"
5. "Draft responses to all urgent emails from yesterday"

---

## 📊 Success Metrics

### Functional Metrics
- ✅ GPT-5 successfully calls tools 95%+ of the time
- ✅ Multi-step tasks complete end-to-end
- ✅ Average 2-4 tool calls per complex request
- ✅ Parallel execution when appropriate

### Performance Metrics
- ✅ Tool execution < 2s per call
- ✅ Total request time < 10s for complex tasks
- ✅ Token usage < 5000 tokens average
- ✅ Cost < $0.01 per request average

### Quality Metrics
- ✅ 95%+ accuracy in tool selection
- ✅ 90%+ user satisfaction with responses
- ✅ < 5% error rate in tool execution
- ✅ Graceful degradation on failures

---

## 💡 Advanced Use Cases

### 1. Intelligent Email Management
```
User: "Handle my inbox"

GPT-5 executes:
1. search_emails(query: "is:unread")
2. categorize_emails(emailIds: [...])
3. compose_email(to: high_priority_sender, context: "acknowledgment")
4. For each routine email: auto-respond or archive
5. Returns: "Processed 47 emails: 3 need your attention, 12 responded, 32 archived"
```

### 2. Smart Meeting Scheduling
```
User: "Schedule 1:1s with my direct reports next week"

GPT-5 executes:
1. search_emails(query: "direct reports") → get team list
2. get_calendar_events(nextWeek) → see availability
3. find_meeting_times(attendees: each person, duration: 30, constraints: no back-to-back)
4. For each person: create_calendar_event(...)
5. compose_email(meeting invites with agenda)
6. Returns: "Scheduled 5 meetings, here's your week"
```

### 3. Task Planning from Email
```
User: "Turn the action items from Sarah's email into tasks"

GPT-5 executes:
1. search_emails(from: "sarah@...", recent: true)
2. Extract action items using GPT-5 reasoning
3. For each action: create_task(title, priority, estimate)
4. prioritize_tasks(all new tasks)
5. Returns: "Created 6 tasks from Sarah's email, highest priority: [...]"
```

---

## 🚨 Risk Mitigation

### Risk 1: GPT-5 API Costs
**Mitigation**:
- Use GPT-5-nano for simple requests (10x cheaper)
- Cache tool results for 5 minutes
- Set hard limits: max 10,000 tokens per request

### Risk 2: Tool Selection Errors
**Mitigation**:
- Comprehensive tool descriptions
- Example usage in descriptions
- Fallback to current system if confidence < 0.5

### Risk 3: Latency
**Mitigation**:
- Optimize tool execution (parallel where possible)
- Use streaming responses
- Show "thinking" indicators to user

### Risk 4: Security
**Mitigation**:
- All tools validate userId
- Read-only tools for sensitive operations
- Require confirmation for writes

---

## 📅 Detailed Timeline

### Week 3: Days 1-5

**Day 1: Tool Registry Foundation**
- Create ToolRegistry class
- Define TideTool interface
- Implement registration and execution
- Unit tests

**Day 2: Email Tools**
- search_emails
- compose_email
- send_email
- categorize_emails
- Integration tests

**Day 3: Calendar & Task Tools**
- Calendar: 4 tools
- Tasks: 3 tools
- Integration tests

**Day 4: Custom Tools**
- analyze_with_sql
- execute_workflow
- generate_report
- Safety validations

**Day 5: Testing & Documentation**
- Complete test coverage
- Tool documentation
- Example usage guide

### Week 4: Days 1-5

**Day 1-2: GPT5Orchestrator Core**
- Implement main orchestration loop
- OpenAI API integration
- Tool calling and response handling

**Day 3: Error Handling**
- Retry logic
- Graceful degradation
- Logging and debugging

**Day 4: Advanced Features**
- Preamble messages
- Parallel execution
- Cost tracking

**Day 5: Real-World Testing**
- 20 scenario tests
- Performance optimization
- Bug fixes

### Week 5: Days 1-5

**Day 1-2: Polish & Optimization**
- Response quality improvements
- Latency optimization
- Caching strategy

**Day 3: Analytics & Monitoring**
- Tool usage analytics
- Success rate tracking
- Cost monitoring

**Day 4: Integration Testing**
- End-to-end scenarios
- Edge case handling
- Load testing

**Day 5: Documentation & Handoff**
- API documentation
- Integration guide
- Performance benchmarks

---

## 🎯 Definition of Done

- [ ] All 14+ tools implemented and tested
- [ ] GPT5Orchestrator successfully handles complex requests
- [ ] 95%+ success rate in tool calling
- [ ] Average response time < 10s for complex tasks
- [ ] Comprehensive test coverage (80%+)
- [ ] Documentation complete
- [ ] Production monitoring in place
- [ ] Cost per request < $0.01 average
- [ ] Graceful fallback to current system working

---

**This integration will transform Tide from a smart assistant to a true AI Chief of Staff.** 🚀
