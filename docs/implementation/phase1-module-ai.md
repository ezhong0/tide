# AI Module - Detailed Implementation Guide

## Timeline: Week 3-6 (Days 15-42)
## Team: Senior Engineer #1 (+ ML Engineer if available)
## Dependencies: Phase 0 complete (contracts, types)

---

## Module Overview

**Responsibility**: AI intelligence layer using GPT-5 function calling
- Intent classification (voice/text → structured intent)
- Function orchestration (parallel/sequential execution)
- Draft generation (emails, meeting requests)
- Command state management
- Learning from user feedback

**Module Boundary**: This module DOES NOT:
- Send emails (that's Email Module)
- Create calendar events (that's Calendar Module
- Store user context (that's Context Module)

**Key Insight**: This is the "brain" that orchestrates all other modules via function calling.

---

## Week 3: GPT Integration & Function Definitions

### Day 15-16: OpenAI SDK Setup & Cost Tracking

```typescript
// apps/api/src/services/ai/openai-client.ts
import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import { db } from '../../db';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID
});

/**
 * Wrapper for OpenAI calls with:
 * - Retry logic (exponential backoff)
 * - Cost tracking
 * - Error handling
 * - Logging
 */
export async function callOpenAI<T>(
  userId: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const result = await fn();

      // Log successful call
      const duration = Date.now() - startTime;
      logger.info({
        userId,
        operation,
        duration,
        attempt: attempt + 1
      }, 'OpenAI call successful');

      // Track cost (estimate based on tokens)
      await trackAICost(userId, operation, result);

      return result;

    } catch (error: any) {
      attempt++;

      // Rate limit or temporary error - retry
      if (error.status === 429 || error.status >= 500) {
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          logger.warn({ userId, operation, attempt, delay }, 'Retrying OpenAI call');
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Permanent error or max attempts - throw
      logger.error({ userId, operation, error, attempt }, 'OpenAI call failed');
      throw error;
    }
  }

  throw new Error('Max retry attempts exceeded');
}

async function trackAICost(
  userId: string,
  operation: string,
  response: any
): Promise<void> {
  // Estimate cost based on token usage
  const usage = response.usage;
  if (!usage) return;

  const promptTokens = usage.prompt_tokens;
  const completionTokens = usage.completion_tokens;

  // GPT-4 pricing (adjust for GPT-5 when available)
  const promptCost = (promptTokens / 1000) * 0.03; // $0.03/1K tokens
  const completionCost = (completionTokens / 1000) * 0.06; // $0.06/1K tokens
  const totalCost = promptCost + completionCost;

  // Store in database for billing/analytics
  await db.aiUsage.create({
    data: {
      user_id: userId,
      operation,
      model: response.model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: usage.total_tokens,
      estimated_cost: totalCost,
      timestamp: new Date()
    }
  });

  logger.debug({
    userId,
    operation,
    tokens: usage.total_tokens,
    cost: totalCost
  }, 'AI cost tracked');
}
```

### Day 17-18: Function/Tool Definitions

```typescript
// apps/api/src/services/ai/tools/definitions.ts
import { z } from 'zod';

/**
 * All GPT function definitions using Zod for type safety
 */

// ========== Email Tools ==========

export const SearchEmailToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('search_email'),
    description: z.literal('Search user\'s emails by criteria'),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        query: z.object({
          type: z.literal('string'),
          description: z.literal('Search query text')
        }).optional(),
        from: z.object({
          type: z.literal('string'),
          description: z.literal('Filter by sender email')
        }).optional(),
        date_after: z.object({
          type: z.literal('string'),
          description: z.literal('ISO date to search after')
        }).optional(),
        limit: z.object({
          type: z.literal('number'),
          description: z.literal('Max results (default 50)')
        }).optional()
      }),
      required: z.array(z.string()).default([])
    })
  })
});

export const DraftEmailToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('draft_email'),
    description: z.literal('Draft an email matching user\'s style'),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        recipients: z.object({
          type: z.literal('array'),
          items: z.object({ type: z.literal('string') }),
          description: z.literal('Email recipients')
        }),
        subject: z.object({
          type: z.literal('string'),
          description: z.literal('Email subject line')
        }),
        key_points: z.object({
          type: z.literal('array'),
          items: z.object({ type: z.literal('string') }),
          description: z.literal('Key points to include in email')
        }),
        tone: z.object({
          type: z.literal('string'),
          enum: z.array(z.enum(['professional', 'casual', 'friendly', 'formal'])),
          description: z.literal('Email tone')
        }).optional()
      }),
      required: z.array(z.string()).default(['recipients', 'key_points'])
    })
  })
});

// ========== Calendar Tools ==========

export const CheckAvailabilityToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('check_availability'),
    description: z.literal('Check user\'s calendar availability'),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        timeframe: z.object({
          type: z.literal('string'),
          enum: z.array(z.enum(['today', 'tomorrow', 'this_week', 'next_week'])),
          description: z.literal('When to check availability')
        }),
        duration_minutes: z.object({
          type: z.literal('number'),
          description: z.literal('Required meeting duration in minutes')
        }),
        time_of_day: z.object({
          type: z.literal('string'),
          enum: z.array(z.enum(['morning', 'lunch', 'afternoon', 'evening'])),
          description: z.literal('Preferred time of day')
        }).optional()
      }),
      required: z.array(z.string()).default(['timeframe', 'duration_minutes'])
    })
  })
});

export const CreateCalendarEventToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('create_calendar_event'),
    description: z.literal('Create event in user\'s calendar'),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        title: z.object({
          type: z.literal('string'),
          description: z.literal('Event title')
        }),
        start_time: z.object({
          type: z.literal('string'),
          description: z.literal('ISO datetime for event start')
        }),
        duration_minutes: z.object({
          type: z.literal('number'),
          description: z.literal('Event duration in minutes')
        }),
        attendees: z.object({
          type: z.literal('array'),
          items: z.object({
            type: z.literal('string'),
            description: z.literal('Attendee email address')
          })
        }).optional()
      }),
      required: z.array(z.string()).default(['title', 'start_time', 'duration_minutes'])
    })
  })
});

// ========== Context Tools ==========

export const AnalyzeContactToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.literal('analyze_contact'),
    description: z.literal('Get relationship info about a contact'),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.object({
        email: z.object({
          type: z.literal('string'),
          description: z.literal('Contact email address')
        })
      }),
      required: z.array(z.string()).default(['email'])
    })
  })
});

// ========== All Tools ==========

export const ALL_TOOLS = [
  SearchEmailToolSchema.parse({
    type: 'function',
    function: {
      name: 'search_email',
      description: 'Search user\'s emails by criteria',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query text'
          },
          from: {
            type: 'string',
            description: 'Filter by sender email'
          },
          date_after: {
            type: 'string',
            description: 'ISO date to search after'
          },
          limit: {
            type: 'number',
            description: 'Max results (default 50)'
          }
        },
        required: []
      }
    }
  }),
  DraftEmailToolSchema.parse({
    type: 'function',
    function: {
      name: 'draft_email',
      description: 'Draft an email matching user\'s style',
      parameters: {
        type: 'object',
        properties: {
          recipients: {
            type: 'array',
            items: { type: 'string' },
            description: 'Email recipients'
          },
          subject: {
            type: 'string',
            description: 'Email subject line'
          },
          key_points: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key points to include in email'
          },
          tone: {
            type: 'string',
            enum: ['professional', 'casual', 'friendly', 'formal'],
            description: 'Email tone'
          }
        },
        required: ['recipients', 'key_points']
      }
    }
  }),
  CheckAvailabilityToolSchema.parse({
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check user\'s calendar availability',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['today', 'tomorrow', 'this_week', 'next_week'],
            description: 'When to check availability'
          },
          duration_minutes: {
            type: 'number',
            description: 'Required meeting duration in minutes'
          },
          time_of_day: {
            type: 'string',
            enum: ['morning', 'lunch', 'afternoon', 'evening'],
            description: 'Preferred time of day'
          }
        },
        required: ['timeframe', 'duration_minutes']
      }
    }
  }),
  CreateCalendarEventToolSchema.parse({
    type: 'function',
    function: {
      name: 'create_calendar_event',
      description: 'Create event in user\'s calendar',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Event title'
          },
          start_time: {
            type: 'string',
            description: 'ISO datetime for event start'
          },
          duration_minutes: {
            type: 'number',
            description: 'Event duration in minutes'
          },
          attendees: {
            type: 'array',
            items: {
              type: 'string',
              description: 'Attendee email address'
            }
          }
        },
        required: ['title', 'start_time', 'duration_minutes']
      }
    }
  }),
  AnalyzeContactToolSchema.parse({
    type: 'function',
    function: {
      name: 'analyze_contact',
      description: 'Get relationship info about a contact',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Contact email address'
          }
        },
        required: ['email']
      }
    }
  })
];

// Type inference for tool calls
export type ToolName =
  | 'search_email'
  | 'draft_email'
  | 'check_availability'
  | 'create_calendar_event'
  | 'analyze_contact';

export interface ToolCall {
  id: string;
  name: ToolName;
  arguments: Record<string, unknown>;
}
```

**Deliverables Day 15-18**:
- [ ] OpenAI client with retry logic
- [ ] Cost tracking per request
- [ ] All function/tool definitions in Zod
- [ ] Type-safe tool calls
- [ ] Error handling for API failures

---

### Day 19-20: Intent Classification Service

```typescript
// apps/api/src/services/ai/intent-classifier.service.ts
import { openai, callOpenAI } from './openai-client';
import { ALL_TOOLS } from './tools/definitions';
import { logger } from '../../utils/logger';

export class IntentClassifierService {
  /**
   * Classify user intent and determine required function calls
   */
  async classifyIntent(
    userId: string,
    transcript: string,
    userContext: UserContext
  ): Promise<ClassifiedIntent> {
    const systemPrompt = this.buildSystemPrompt(userContext);

    const response = await callOpenAI(userId, 'classify_intent', () =>
      openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Use GPT-5 when available
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        tools: ALL_TOOLS,
        tool_choice: 'auto', // Let GPT decide which tools to use
        temperature: 0.3 // Lower for more consistent classification
      })
    );

    const message = response.choices[0].message;

    // Extract tool calls
    const toolCalls = message.tool_calls || [];

    // Determine primary intent
    const intent = this.determineIntent(toolCalls);

    // Calculate confidence
    const confidence = this.calculateConfidence(message, toolCalls);

    logger.info({
      userId,
      intent,
      confidence,
      toolCount: toolCalls.length
    }, 'Intent classified');

    return {
      intent,
      confidence,
      toolCalls: toolCalls.map(tc => ({
        id: tc.id,
        name: tc.function.name as ToolName,
        arguments: JSON.parse(tc.function.arguments)
      })),
      rawResponse: message
    };
  }

  private buildSystemPrompt(userContext: UserContext): string {
    return `You are Tide, an AI executive assistant.

User Information:
- Name: ${userContext.user.name}
- Timezone: ${userContext.user.timezone}
- Current time: ${new Date().toISOString()}

Recent Context:
${userContext.recentActivity.slice(0, 3).map(cmd =>
  `- ${cmd.intent} (${cmd.timestamp.toLocaleDateString()})`
).join('\n')}

Frequent Contacts:
${userContext.frequentContacts.slice(0, 5).map(c =>
  `- ${c.name || c.email}`
).join('\n')}

Your task:
1. Understand the user's intent from their voice command
2. Determine which functions to call to fulfill the request
3. Extract relevant entities (dates, contacts, topics)
4. Handle ambiguity by asking clarifying questions if needed

Guidelines:
- Be concise and efficient
- Infer context from user's history when possible
- For scheduling, prefer next week over this week unless specified
- For emails, match tone to recipient relationship
- Always check calendar before proposing meeting times`;
  }

  private determineIntent(toolCalls: ToolCall[]): CommandIntent {
    if (toolCalls.length === 0) return 'unknown';

    // Primary intent based on first/most important tool call
    const primaryTool = toolCalls[0].name;

    const intentMap: Record<string, CommandIntent> = {
      'draft_email': 'draft_email',
      'search_email': 'search_email',
      'check_availability': 'schedule_meeting',
      'create_calendar_event': 'schedule_meeting',
      'analyze_contact': 'get_contact_info'
    };

    return intentMap[primaryTool] || 'unknown';
  }

  private calculateConfidence(
    message: any,
    toolCalls: ToolCall[]
  ): number {
    // High confidence if GPT made clear tool selections
    if (toolCalls.length > 0) return 0.95;

    // Medium confidence if text response but no tools
    if (message.content) return 0.7;

    // Low confidence
    return 0.5;
  }
}

export interface ClassifiedIntent {
  intent: CommandIntent;
  confidence: number;
  toolCalls: ToolCall[];
  rawResponse: any;
}

export type CommandIntent =
  | 'schedule_meeting'
  | 'draft_email'
  | 'search_email'
  | 'get_contact_info'
  | 'unknown';

interface UserContext {
  user: {
    name: string;
    timezone: string;
  };
  recentActivity: Array<{
    intent: string;
    timestamp: Date;
  }>;
  frequentContacts: Array<{
    name?: string;
    email: string;
  }>;
}
```

**Deliverables Day 19-20**:
- [ ] Intent classifier using GPT-4
- [ ] System prompt with user context
- [ ] Tool selection automatic
- [ ] Confidence calculation
- [ ] Unit tests with mocked GPT responses

---

## Week 4-5: Function Execution & Orchestration

(Due to length, I'll summarize the key components. Full implementation would continue in same detailed style)

### Function Executor (Days 21-28)

**Purpose**: Execute tool calls against actual services

```typescript
class FunctionExecutor {
  async execute(toolCall: ToolCall, userId: string): Promise<ToolResult> {
    switch (toolCall.name) {
      case 'search_email':
        return this.emailService.searchEmails(userId, toolCall.arguments);
      case 'draft_email':
        return this.aiDrafter.draftEmail(userId, toolCall.arguments);
      case 'check_availability':
        return this.calendarService.checkAvailability(userId, toolCall.arguments);
      // ... more cases
    }
  }
}
```

### Command Orchestrator (Days 29-35)

**Purpose**: Manage complete command lifecycle

```typescript
class CommandOrchestrator {
  async processCommand(userId: string, transcript: string): Promise<CommandResult> {
    // 1. Store command
    // 2. Classify intent
    // 3. Analyze dependencies (parallel vs sequential)
    // 4. Execute functions
    // 5. Generate drafts if needed
    // 6. Return for user approval or auto-execute
  }
}
```

### Learning System (Days 36-42)

**Purpose**: Learn from user feedback

```typescript
class LearningService {
  async recordFeedback(userId: string, commandId: string, feedback: Feedback) {
    // Track what user changed
    // Update user preferences
    // Update contact preferences
    // Improve future suggestions
  }
}
```

**Key Deliverables Week 4-6**:
- [ ] Function executor for all tools
- [ ] Command orchestrator (full lifecycle)
- [ ] Parallel vs sequential execution logic
- [ ] User approval flow
- [ ] Learning from feedback
- [ ] Command state management
- [ ] 85%+ test coverage
- [ ] Integration tests with all modules

---

## Testing Strategy

```typescript
// Mock all external services for unit tests
describe('IntentClassifierService', () => {
  it('should classify meeting scheduling intent', async () => {
    const mockGPT = jest.spyOn(openai.chat.completions, 'create')
      .mockResolvedValue({
        choices: [{
          message: {
            tool_calls: [{
              id: '1',
              type: 'function',
              function: {
                name: 'check_availability',
                arguments: JSON.stringify({
                  timeframe: 'next_week',
                  duration_minutes: 60
                })
              }
            }]
          }
        }]
      });

    const result = await classifier.classifyIntent(
      'user-123',
      'Schedule lunch with Sarah next week',
      mockUserContext
    );

    expect(result.intent).toBe('schedule_meeting');
    expect(result.toolCalls).toHaveLength(1);
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

---

This AI module is the most critical piece - it orchestrates everything. The implementation must be rock-solid with comprehensive error handling and logging.
