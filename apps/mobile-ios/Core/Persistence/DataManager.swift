import Foundation
import CoreData

/// Central manager for CoreData operations
class DataManager {
    static let shared = DataManager()

    private init() {
        // Ensure container is loaded
        _ = persistentContainer
    }

    // MARK: - Core Data Stack

    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "TideDataModel")

        container.loadPersistentStores { description, error in
            if let error = error as NSError? {
                // In production, handle this more gracefully
                fatalError("Unable to load persistent stores: \(error), \(error.userInfo)")
            }

            print("📦 CoreData: Persistent store loaded at \(description.url?.absoluteString ?? "unknown")")
        }

        // Merge policy for conflicts
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        container.viewContext.automaticallyMergesChangesFromParent = true

        return container
    }()

    var viewContext: NSManagedObjectContext {
        return persistentContainer.viewContext
    }

    // MARK: - Core Data Saving

    func saveContext() {
        let context = persistentContainer.viewContext
        if context.hasChanges {
            do {
                try context.save()
                print("✅ CoreData: Context saved successfully")
            } catch {
                let nsError = error as NSError
                print("❌ CoreData: Failed to save context: \(nsError), \(nsError.userInfo)")
            }
        }
    }

    func performBackgroundTask(_ block: @escaping (NSManagedObjectContext) -> Void) {
        persistentContainer.performBackgroundTask(block)
    }

    // MARK: - CRUD Operations

    // MARK: Conversation Operations

    func saveConversation(_ conversation: Conversation) {
        let context = viewContext

        // Check if conversation already exists
        let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", conversation.id)

        do {
            let results = try context.fetch(fetchRequest)
            let entity: ConversationEntity

            if let existingEntity = results.first {
                // Update existing
                entity = existingEntity
            } else {
                // Create new
                entity = ConversationEntity(context: context)
                entity.id = conversation.id
            }

            // Update properties
            entity.title = conversation.title
            entity.createdAt = conversation.createdAt
            entity.updatedAt = conversation.updatedAt
            entity.isActive = conversation.isActive

            // Save messages
            for message in conversation.messages {
                saveMessage(message, to: entity, in: context)
            }

            saveContext()
        } catch {
            print("❌ Failed to save conversation: \(error)")
        }
    }

    func fetchConversations() -> [Conversation] {
        let context = viewContext
        let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "updatedAt", ascending: false)]

        do {
            let entities = try context.fetch(fetchRequest)
            return entities.compactMap { $0.toModel() }
        } catch {
            print("❌ Failed to fetch conversations: \(error)")
            return []
        }
    }

    func deleteConversation(id: String) {
        let context = viewContext
        let fetchRequest: NSFetchRequest<ConversationEntity> = ConversationEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", id)

        do {
            let results = try context.fetch(fetchRequest)
            for entity in results {
                context.delete(entity)
            }
            saveContext()
        } catch {
            print("❌ Failed to delete conversation: \(error)")
        }
    }

    // MARK: Message Operations

    private func saveMessage(_ message: Message, to conversation: ConversationEntity, in context: NSManagedObjectContext) {
        // Check if message already exists
        let fetchRequest: NSFetchRequest<MessageEntity> = MessageEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", message.id)

        do {
            let results = try context.fetch(fetchRequest)
            let entity: MessageEntity

            if let existingEntity = results.first {
                entity = existingEntity
            } else {
                entity = MessageEntity(context: context)
                entity.id = message.id
                entity.conversation = conversation
            }

            // Update properties
            entity.content = message.content
            entity.role = message.role.rawValue
            entity.timestamp = message.timestamp
            entity.status = message.status.rawValue

            // Store suggestions as JSON
            if let suggestions = message.suggestions {
                entity.suggestionsJSON = try? JSONEncoder().encode(suggestions)
            }

            // Store action preview as JSON
            if let actionPreview = message.actionPreview {
                entity.actionPreviewJSON = try? JSONEncoder().encode(actionPreview)
            }

            entity.aiSummary = message.aiSummary

        } catch {
            print("❌ Failed to save message: \(error)")
        }
    }

    // MARK: - Cleanup

    func deleteAllData() {
        let entities = ["ConversationEntity", "MessageEntity"]

        for entity in entities {
            let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: entity)
            let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)

            do {
                try viewContext.execute(deleteRequest)
                saveContext()
            } catch {
                print("❌ Failed to delete \(entity): \(error)")
            }
        }
    }
}

// MARK: - CoreData Entity Extensions

extension ConversationEntity {
    func toModel() -> Conversation? {
        guard let id = id,
              let title = title,
              let createdAt = createdAt,
              let updatedAt = updatedAt else {
            return nil
        }

        let messages = (self.messages?.allObjects as? [MessageEntity])?.compactMap { $0.toModel() } ?? []

        return Conversation(
            id: id,
            title: title,
            messages: messages,
            createdAt: createdAt,
            updatedAt: updatedAt,
            isActive: isActive
        )
    }
}

extension MessageEntity {
    func toModel() -> Message? {
        guard let id = id,
              let content = content,
              let roleString = role,
              let role = MessageRole(rawValue: roleString),
              let timestamp = timestamp,
              let statusString = status,
              let status = MessageStatus(rawValue: statusString) else {
            return nil
        }

        var suggestions: [String]?
        if let suggestionsJSON = suggestionsJSON {
            suggestions = try? JSONDecoder().decode([String].self, from: suggestionsJSON)
        }

        var actionPreview: ActionPreview?
        if let actionPreviewJSON = actionPreviewJSON {
            actionPreview = try? JSONDecoder().decode(ActionPreview.self, from: actionPreviewJSON)
        }

        return Message(
            id: id,
            content: content,
            role: role,
            timestamp: timestamp,
            status: status,
            actionPreview: actionPreview,
            suggestions: suggestions,
            aiSummary: aiSummary
        )
    }
}
