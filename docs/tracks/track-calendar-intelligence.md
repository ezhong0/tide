# Track 2: Calendar Intelligence

> **Complete Calendar Feature**: OAuth → Sync → Meeting Prep → Smart Scheduling

**Owner**: Calendar Team (1-2 developers)
**Status**: 🚧 65% Complete
**Duration**: 4 weeks
**Dependencies**: Track 0 (Database), Track 1 (Emails for meeting prep)

---

## What You Own

- **Backend**: `packages/services/calendar/` - Google/MS Calendar OAuth, sync, AI meeting prep
- **Mobile iOS**: `apps/mobile-ios/TideApp/Features/Calendar/`
- **Mobile Android**: `apps/mobile-android/.../features/calendar/`
- **Database**: `calendar_events` table
- **AI Agents**: Meeting prep, smart scheduling, focus time protection

---

## 4-Week Plan

**Week 1**: OAuth + Event Sync (Google/MS Calendar)
**Week 2**: Smart Scheduling (availability, conflicts, suggestions)
**Week 3**: Meeting Prep (AI briefs, attendee insights)
**Week 4**: Optimization (focus blocks, travel time, energy-based)

---

## Key Code: Smart Scheduling

```typescript
// Find available time slots
async findAvailableSlots(userId: string, duration: number, range: DateRange) {
  const events = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', range.start)
    .lte('end_time', range.end);

  const slots = [];
  let current = new Date(range.start);

  while (current < range.end) {
    const hour = current.getHours();
    if (hour >= 9 && hour < 18) { // Working hours
      const slotEnd = new Date(current.getTime() + duration * 60000);
      const hasConflict = events.data.some(e =>
        this.overlaps(current, slotEnd, e.start_time, e.end_time)
      );

      if (!hasConflict) slots.push({ start: current, end: slotEnd });
    }
    current = new Date(current.getTime() + 30 * 60000); // 30min increments
  }

  return slots;
}
```

## Key Code: Meeting Prep

```typescript
// Generate AI meeting brief
async generateBrief(eventId: string) {
  const event = await getEvent(eventId);

  // Find related emails
  const relatedEmails = await supabase
    .from('email_messages')
    .select('*')
    .eq('user_id', event.user_id)
    .or(`subject.ilike.%${event.title}%,from_address.in.(${event.attendees.map(a => a.email).join(',')})`)
    .limit(10);

  const prompt = `Generate meeting brief for:
Title: ${event.title}
Attendees: ${event.attendees.map(a => a.name).join(', ')}
Recent emails: ${relatedEmails.data.map(e => e.subject).join('\n')}

Provide: Background, Key Topics, Talking Points`;

  const brief = await claude.generateBrief(prompt);

  await supabase
    .from('calendar_events')
    .update({ meeting_brief: brief })
    .eq('id', eventId);

  return brief;
}
```

---

## Success Criteria

- [ ] Calendar connected in <30s
- [ ] Events synced in real-time
- [ ] Meeting briefs ready 2hrs before
- [ ] Smart scheduling <2s
- [ ] Focus time protected

**See complete implementation details in codebase**
