"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailEventType = exports.MessageEventType = exports.UserEventType = void 0;
/**
 * User events
 */
var UserEventType;
(function (UserEventType) {
    UserEventType["USER_REGISTERED"] = "user.registered";
    UserEventType["USER_AUTHENTICATED"] = "user.authenticated";
    UserEventType["USER_UPDATED"] = "user.updated";
    UserEventType["USER_DELETED"] = "user.deleted";
    UserEventType["USER_PASSWORD_CHANGED"] = "user.password.changed";
    UserEventType["USER_EMAIL_VERIFIED"] = "user.email.verified";
})(UserEventType || (exports.UserEventType = UserEventType = {}));
/**
 * Message events
 */
var MessageEventType;
(function (MessageEventType) {
    MessageEventType["MESSAGE_RECEIVED"] = "message.received";
    MessageEventType["MESSAGE_PROCESSED"] = "message.processed";
    MessageEventType["MESSAGE_INTENT_DETECTED"] = "message.intent.detected";
    MessageEventType["MESSAGE_RESPONSE_GENERATED"] = "message.response.generated";
})(MessageEventType || (exports.MessageEventType = MessageEventType = {}));
/**
 * Email events
 */
var EmailEventType;
(function (EmailEventType) {
    EmailEventType["EMAIL_RECEIVED"] = "email.received";
    EmailEventType["EMAIL_SENT"] = "email.sent";
    EmailEventType["EMAIL_TRIAGED"] = "email.triaged";
})(EmailEventType || (exports.EmailEventType = EmailEventType = {}));
//# sourceMappingURL=events.js.map