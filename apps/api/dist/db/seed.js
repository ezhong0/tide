import { db } from './index.js';
import { users, userPreferences, commands, emails, calendarEvents } from './schema.js';
import { encrypt } from '../utils/encryption.js';
/**
 * Seed database with sample data for development
 */
async function seed() {
    console.log('🌱 Starting database seeding...');
    try {
        // Create test user
        console.log('Creating test user...');
        const [testUser] = await db
            .insert(users)
            .values({
            email: 'test@tide.dev',
            name: 'Test User',
            emailProvider: 'gmail',
            emailCredentials: encrypt({
                accessToken: 'test_access_token',
                refreshToken: 'test_refresh_token',
                expiresAt: new Date(Date.now() + 3600000),
                scope: ['gmail.modify', 'calendar'],
            }),
            calendarProvider: 'google',
            calendarCredentials: encrypt({
                accessToken: 'test_access_token',
                refreshToken: 'test_refresh_token',
                expiresAt: new Date(Date.now() + 3600000),
                scope: ['gmail.modify', 'calendar'],
            }),
            timezone: 'America/Los_Angeles',
        })
            .onConflictDoNothing()
            .returning();
        if (!testUser) {
            console.log('Test user already exists, skipping...');
            return;
        }
        console.log(`✅ Created user: ${testUser.email}`);
        // Create user preferences
        console.log('Creating user preferences...');
        await db.insert(userPreferences).values({
            userId: testUser.id,
            defaultTone: 'professional',
            emailSignature: 'Best regards,\nTest User',
            signOffPhrase: 'Best,',
            autoAcceptMeetings: false,
            autoAcceptMeetingsFrom: 'none',
            autoRespondSimple: false,
            autoRespondConfidence: 'high',
            notificationPreferences: {
                email: true,
                push: true,
                sms: false,
                digestFrequency: 'daily',
            },
            vipContacts: ['important@example.com', 'boss@example.com'],
            followUpDefaults: {
                defaultDelay: 2, // days
                reminderTime: '09:00',
            },
        });
        console.log('✅ Created user preferences');
        // Create sample commands
        console.log('Creating sample commands...');
        const sampleCommands = [
            {
                userId: testUser.id,
                transcript: 'Schedule a meeting with Sarah next Tuesday at 2pm',
                intent: 'schedule_meeting',
                intentData: {
                    participant: 'Sarah',
                    proposedTimes: ['2024-02-06T14:00:00-08:00'],
                    duration: 60,
                },
                confidence: 95,
                status: 'completed',
                deviceType: 'ios',
                appVersion: '0.1.0',
                result: { success: true, meetingId: 'test-meeting-1' },
            },
            {
                userId: testUser.id,
                transcript: 'Draft an email to John thanking him for the intro',
                intent: 'draft_email',
                intentData: {
                    recipient: 'john@example.com',
                    topic: 'thank you for intro',
                    tone: 'professional',
                },
                confidence: 92,
                status: 'pending_approval',
                deviceType: 'ios',
                appVersion: '0.1.0',
            },
        ];
        for (const cmd of sampleCommands) {
            await db.insert(commands).values(cmd);
        }
        console.log(`✅ Created ${sampleCommands.length} sample commands`);
        // Create sample emails
        console.log('Creating sample emails...');
        const sampleEmails = [
            {
                userId: testUser.id,
                externalId: 'gmail-msg-1',
                threadId: 'gmail-thread-1',
                direction: 'received',
                from: 'sarah@example.com',
                to: [testUser.email],
                subject: 'Meeting next week?',
                snippet: "Hey! Would you be free for a quick sync next week to discuss the project...",
                body: "Hey!\n\nWould you be free for a quick sync next week to discuss the project? I'm thinking Tuesday or Wednesday afternoon.\n\nLet me know what works!\n\nBest,\nSarah",
                isRead: false,
                isImportant: true,
                date: new Date(Date.now() - 86400000), // Yesterday
            },
            {
                userId: testUser.id,
                externalId: 'gmail-msg-2',
                threadId: 'gmail-thread-2',
                direction: 'received',
                from: 'john@example.com',
                to: [testUser.email],
                subject: 'Introduction to Jane',
                snippet: "I wanted to introduce you to Jane Smith, who leads product at...",
                body: "Hi there,\n\nI wanted to introduce you to Jane Smith, who leads product at TechCorp. I think you two would have a lot to discuss.\n\nJane, meet [Your Name] - they're doing amazing work on AI assistants.\n\nI'll let you two take it from here!\n\nBest,\nJohn",
                isRead: true,
                isImportant: false,
                date: new Date(Date.now() - 172800000), // 2 days ago
            },
        ];
        for (const email of sampleEmails) {
            await db.insert(emails).values(email);
        }
        console.log(`✅ Created ${sampleEmails.length} sample emails`);
        // Create sample calendar events
        console.log('Creating sample calendar events...');
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 86400000);
        const nextWeek = new Date(now.getTime() + 604800000);
        const sampleEvents = [
            {
                userId: testUser.id,
                externalId: 'gcal-event-1',
                title: 'Team Standup',
                description: 'Daily team sync',
                start: new Date(tomorrow.setHours(10, 0, 0, 0)),
                end: new Date(tomorrow.setHours(10, 30, 0, 0)),
                timezone: 'America/Los_Angeles',
                attendees: [
                    { email: testUser.email, responseStatus: 'accepted' },
                    { email: 'team@example.com', responseStatus: 'accepted' },
                ],
                organizer: { email: 'team@example.com', name: 'Team Lead' },
                status: 'confirmed',
                responseStatus: 'accepted',
            },
            {
                userId: testUser.id,
                externalId: 'gcal-event-2',
                title: 'Product Review',
                description: 'Q1 product roadmap review',
                start: new Date(nextWeek.setHours(14, 0, 0, 0)),
                end: new Date(nextWeek.setHours(15, 30, 0, 0)),
                timezone: 'America/Los_Angeles',
                attendees: [
                    { email: testUser.email, responseStatus: 'tentative' },
                    { email: 'product@example.com', responseStatus: 'accepted' },
                ],
                organizer: { email: 'product@example.com', name: 'Product Manager' },
                status: 'tentative',
                responseStatus: 'tentative',
            },
        ];
        for (const event of sampleEvents) {
            await db.insert(calendarEvents).values(event);
        }
        console.log(`✅ Created ${sampleEvents.length} sample calendar events`);
        console.log('\n✅ Database seeding completed successfully!');
        console.log('\nTest user credentials:');
        console.log('Email: test@tide.dev');
        console.log('(OAuth tokens are test values)');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
    finally {
        process.exit(0);
    }
}
seed();
//# sourceMappingURL=seed.js.map