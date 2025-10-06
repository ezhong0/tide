# Module 04: Event Sourcing & CQRS

## 🤖 Claude Instance Prompt

```
You are Claude Instance #4, the Event Sourcing Architect for Tide.

Your mission: Build a robust event sourcing system with CQRS that provides complete audit trail, time-travel debugging, and <10ms event append time.

Core responsibilities:
1. Implement event store with immutable append-only log
2. Build CQRS with separate read/write models
3. Create projection system for materialized views
4. Implement event replay and time-travel
5. Ensure exactly-once event processing

This is the foundation for debugging and compliance. Every action must be traceable.
```

## 📋 Module Overview

**Duration**: 4 weeks
**Dependencies**: Database interfaces from Module 00

## 🎯 Success Criteria

```typescript
const successCriteria = {
  performance: "Event append <10ms, replay 1000 events/sec",
  reliability: "Zero event loss, exactly-once processing",
  functionality: "Complete audit trail, time-travel to any point"
};
```

## 🏗️ Core Architecture

### Event Store Implementation

```typescript
class EventStore {
  async append(event: DomainEvent): Promise<void> {
    // Immutable append
    const storedEvent = {
      ...event,
      eventId: UUID(),
      timestamp: Date.now(),
      version: await this.getNextVersion(event.aggregateId)
    };

    // Store with transaction
    await this.db.transaction(async (trx) => {
      // Append to event log
      await trx.insert(events).values(storedEvent);

      // Update aggregate version
      await trx.update(aggregates)
        .set({ version: storedEvent.version })
        .where(eq(aggregates.id, event.aggregateId));
    });

    // Publish to event bus
    await this.eventBus.publish(storedEvent);
  }

  async replay(aggregateId: string, toVersion?: number): Promise<Aggregate> {
    const events = await this.getEvents(aggregateId, 0, toVersion);
    return this.hydrate(events);
  }
}
```

### CQRS Pattern

```typescript
// Write side - Commands
class CommandHandler {
  async handle(command: Command): Promise<void> {
    // Load aggregate from events
    const aggregate = await this.eventStore.replay(command.aggregateId);

    // Execute business logic
    aggregate.handle(command);

    // Get new events
    const newEvents = aggregate.getUncommittedEvents();

    // Store events
    for (const event of newEvents) {
      await this.eventStore.append(event);
    }
  }
}

// Read side - Projections
class ProjectionBuilder {
  async project(event: DomainEvent): Promise<void> {
    // Update read models based on event type
    switch(event.type) {
      case 'EmailSent':
        await this.updateEmailReadModel(event);
        break;
      case 'MeetingScheduled':
        await this.updateCalendarView(event);
        break;
    }
  }
}
```

### Event Replay & Time Travel

```typescript
class TimeTravelDebugger {
  async getStateAt(timestamp: number): Promise<SystemState> {
    // Get all events up to timestamp
    const events = await this.eventStore.getEventsUntil(timestamp);

    // Rebuild state
    return this.rebuildState(events);
  }

  async replayFromPoint(fromTimestamp: number): Promise<void> {
    // Get events after timestamp
    const events = await this.eventStore.getEventsAfter(fromTimestamp);

    // Replay each event
    for (const event of events) {
      await this.projectionBuilder.project(event);
    }
  }
}
```

## ✅ Key Deliverables

- [ ] Event store with append-only log
- [ ] Command handlers for all aggregates
- [ ] Projection system for read models
- [ ] Event replay capability
- [ ] Time-travel debugging
- [ ] Exactly-once processing
- [ ] Event versioning & migration
- [ ] 90% test coverage

Remember: Every state change is an event. Events are immutable truth.