/**
 * Email Detail Model
 * Represents complete email data for detail view
 */

import Foundation

struct EmailDetail: Identifiable {
    let id: String
    let from: String
    let fromName: String?
    let to: [String]
    let cc: [String]?
    let subject: String
    let body: String
    let receivedAt: Date
    var isRead: Bool
    var isStarred: Bool
    let isVIP: Bool
    let aiSummary: String?
    let attachments: [Attachment]?
}

struct Attachment: Identifiable {
    let id: String
    let filename: String
    let size: Int
    let mimeType: String
}
