# 📅 Week 3 Implementation Plan - Mobile Apps Track

**Start Date:** 2025-10-06
**Target:** Complete persistence, networking, and testing foundations

---

## 🎯 Week 3 Goals

### Primary Objectives
1. ✅ **Persistence Layer** - Never lose user data
2. ✅ **Error Handling** - User-friendly error messages
3. ✅ **Network Layer** - Real API integration foundation
4. ✅ **Testing** - 30%+ code coverage
5. ✅ **Offline Support** - Queue and sync messages

### Success Metrics
- [ ] Data persists across app restarts
- [ ] Errors displayed to users
- [ ] Network status monitored
- [ ] 30% test coverage
- [ ] Offline messages queue properly

---

## 📋 Implementation Tasks

### Phase 1: Persistence (Day 1-2)

#### iOS - CoreData
- [x] Create CoreData model (`.xcdatamodeld`)
- [x] Define entities: ConversationEntity, MessageEntity, UserEntity
- [x] Create DataManager singleton
- [x] Implement CRUD operations
- [x] Add migration strategy
- [x] Update TideCore to use CoreData

#### Android - Room Database
- [x] Define Room entities with @Entity
- [x] Create DAO interfaces
- [x] Build TideDatabase class
- [x] Add TypeConverters for complex types
- [x] Implement Repository pattern
- [x] Update TideCore to use Room

**Deliverable:** All conversations/messages persist across app restarts

---

### Phase 2: Error Handling (Day 2)

#### iOS - Alert System
- [x] Create ErrorAlert component
- [x] Add error state to AppState
- [x] Display errors in ChatView
- [x] Handle network errors gracefully
- [x] Add retry mechanism

#### Android - Snackbar System
- [x] Add SnackbarHost to Scaffold
- [x] Create ErrorHandler helper
- [x] Display errors in ChatScreen
- [x] Add retry action to snackbar

**Deliverable:** Users see friendly error messages

---

### Phase 3: Network Layer (Day 3-4)

#### iOS - Apollo GraphQL
- [x] Add Apollo iOS dependency
- [x] Create GraphQL schema
- [x] Generate Swift types
- [x] Implement NetworkService with Apollo
- [x] Add authentication interceptor
- [x] Add retry policy

#### Android - Apollo Kotlin
- [x] Add Apollo Android dependency
- [x] Share GraphQL schema
- [x] Generate Kotlin types
- [x] Implement NetworkService with Apollo
- [x] Add authentication interceptor

#### WebSocket (Both Platforms)
- [x] iOS: Starscream WebSocket client
- [x] Android: OkHttp WebSocket
- [x] Implement RealtimeService
- [x] Handle connection lifecycle
- [x] Add reconnection logic

**Deliverable:** Real-time communication ready

---

### Phase 4: Offline Support (Day 4-5)

#### Message Queue
- [x] Create MessageQueue service
- [x] Queue messages when offline
- [x] Sync when connection restored
- [x] Handle conflicts
- [x] Update message status (pending → sent)

#### Network Monitoring
- [x] iOS: NWPathMonitor (Network framework)
- [x] Android: ConnectivityManager callback
- [x] Update UI based on connectivity
- [x] Show offline banner

**Deliverable:** App works offline, syncs later

---

### Phase 5: Testing (Day 5-6)

#### Unit Tests
- [x] iOS: TideCore tests (XCTest)
- [x] iOS: ViewModel tests
- [x] iOS: Service tests (mocked)
- [x] Android: TideCore tests (JUnit)
- [x] Android: Repository tests

#### UI Tests
- [x] iOS: Chat flow test
- [x] iOS: Auth flow test
- [x] Android: Chat flow test
- [x] Android: Auth flow test

**Deliverable:** 30%+ test coverage

---

### Phase 6: Local AI Stub (Day 6-7)

#### iOS - CoreML
- [x] Create LocalInference class
- [x] Add placeholder ML model
- [x] Implement intent classification
- [x] Integrate with TideCore
- [x] Add confidence scoring

#### Android - TensorFlow Lite
- [x] Create LocalInference class
- [x] Add placeholder TFLite model
- [x] Implement intent classification
- [x] Integrate with TideCore

**Deliverable:** Local AI framework ready for model training

---

## 🗂️ Files to Create

### iOS (15+ files)
```
Core/
  ├── Persistence/
  │   ├── TideDataModel.xcdatamodeld
  │   ├── DataManager.swift
  │   ├── ConversationEntity+CoreData.swift
  │   └── MessageEntity+CoreData.swift
  ├── Network/
  │   ├── NetworkMonitor.swift
  │   ├── GraphQLClient.swift
  │   ├── WebSocketService.swift
  │   └── MessageQueue.swift
  ├── LocalInference.swift
  └── ErrorHandler.swift

Tests/
  ├── TideCoreTests.swift
  ├── DataManagerTests.swift
  └── TideUITests/
      └── ChatFlowTests.swift
```

### Android (12+ files)
```
data/
  ├── local/
  │   ├── TideDatabase.kt
  │   ├── entities/
  │   │   ├── ConversationEntity.kt
  │   │   └── MessageEntity.kt
  │   └── dao/
  │       ├── ConversationDao.kt
  │       └── MessageDao.kt
  ├── repository/
  │   └── ConversationRepository.kt
  └── network/
      ├── GraphQLClient.kt
      ├── WebSocketService.kt
      └── NetworkMonitor.kt

core/
  ├── LocalInference.kt
  └── MessageQueue.kt

test/
  ├── TideCoreTest.kt
  └── ConversationRepositoryTest.kt
```

---

## 📊 Progress Tracking

### Day 1-2: Persistence
- [ ] CoreData models
- [ ] Room database
- [ ] Data migrations
- [ ] Integration with TideCore

### Day 3-4: Networking
- [ ] Apollo setup
- [ ] WebSocket service
- [ ] Network monitoring
- [ ] Error handling

### Day 4-5: Offline Support
- [ ] Message queue
- [ ] Sync logic
- [ ] Conflict resolution
- [ ] Status updates

### Day 5-6: Testing
- [ ] Unit tests (30% coverage)
- [ ] UI tests (key flows)
- [ ] Integration tests
- [ ] Test documentation

### Day 6-7: Local AI
- [ ] CoreML integration
- [ ] TFLite integration
- [ ] Intent classification
- [ ] Confidence scoring

---

## 🎯 Definition of Done

### Persistence
- ✅ Data survives app restart
- ✅ Migrations work correctly
- ✅ No data loss

### Error Handling
- ✅ All errors shown to user
- ✅ Retry mechanism works
- ✅ No silent failures

### Networking
- ✅ GraphQL queries work
- ✅ WebSocket connects
- ✅ Reconnection works

### Offline Support
- ✅ Messages queue when offline
- ✅ Sync when online
- ✅ UI shows offline state

### Testing
- ✅ 30%+ code coverage
- ✅ All critical paths tested
- ✅ CI/CD ready

### Local AI
- ✅ Framework in place
- ✅ Basic classification works
- ✅ Ready for real models

---

## 🚀 Deployment Checklist

- [ ] All Week 3 features implemented
- [ ] No regressions from Week 2
- [ ] All tests passing
- [ ] Documentation updated
- [ ] README updated with Week 3 status
- [ ] Code review completed
- [ ] Performance metrics met

---

**Estimated Time:** 6-7 days
**Start:** October 6, 2025
**Target Completion:** October 13, 2025
