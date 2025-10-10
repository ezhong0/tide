# Chatbot Redesign & UI Cleanup

## Issues Found

### Current Problems:
1. **Action cards with confirm/cancel** - Not ready for v1.0, backend doesn't return properly formatted actions yet
2. **Suggestion chips** - Not functional, backend doesn't return suggestions
3. **WebSocket logic** - Incomplete, fallback to HTTP but confusing
4. **"New Conversation" menu** - Not functional (no backend support)
5. **Mock features in Calendar** - "Tide Suggests" section shows fake suggestions
6. **Empty states** - Some are placeholder text

### v1.0 Scope
**Chat should be**: Simple text conversation with AI that accesses your data
**NOT**: Action confirmations, suggestions, complex UI

## Redesign Plan

### Chat UI - Keep It Simple
1. **Remove**: Action cards with confirm/cancel (not ready)
2. **Remove**: Suggestion chips (not ready)
3. **Remove**: New conversation menu (not ready)
4. **Keep**: Simple text bubbles
5. **Keep**: Typing indicator
6. **Keep**: Clear chat option

### Calendar UI - Remove Mock Features
1. **Remove**: "Tide Suggests" section (mock data)
2. **Remove**: "Smart Scheduler" button (not functional)
3. **Remove**: Meeting prep expansion (complex, not v1.0)
4. **Keep**: Week calendar selector
5. **Keep**: Event list
6. **Keep**: Basic event display

### Email UI - Already Clean
Email is already in good shape, just needs:
- Detail view (Phase 3)
- Compose view (Phase 4)

## Implementation
1. Simplify ChatView - pure text conversation
2. Simplify CalendarView - just show events
3. Continue with Email Detail/Compose
4. Add Tasks (simple list)
