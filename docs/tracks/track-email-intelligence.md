# Track 1: Email Intelligence

> **Complete Email Feature**: OAuth → Fetch → AI Triage → Smart Compose

**Owner**: Email Team (1-2 developers)
**Status**: 🚧 70% Complete
**Duration**: 4 weeks
**Dependencies**: Track 0 (Database schema)

---

## What You Own (Full Stack)

**Backend Service**: `packages/services/email/`
- Gmail/Outlook OAuth
- Email sync and storage
- AI triage integration
- Smart composition

**Mobile UI** (iOS + Android):
- `apps/mobile-ios/TideApp/Features/Email/`
- `apps/mobile-android/app/src/main/kotlin/ai/tide/features/email/`

**Database Tables**:
- `oauth_tokens` - Store Gmail/Outlook access tokens
- `email_threads` - Thread metadata
- `email_messages` - Individual emails with AI analysis

**AI Agents**:
- Email triage agent (urgent/important/normal/low)
- Composition agent (multi-draft generation)
- VIP detection agent

---

## Week 1: OAuth + Email Fetch

### Backend: Gmail OAuth

```typescript
// packages/services/email/src/oauth/gmail-oauth.ts
import { google } from 'googleapis';
import { supabase } from '../supabase';

export class GmailOAuth {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.API_BASE_URL}/api/email/oauth/callback/google`
    );
  }

  getAuthUrl(userId: string) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      state: userId // Pass userId to callback
    });
  }

  async handleCallback(code: string, userId: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    // Store in database
    await supabase.from('oauth_tokens').upsert({
      user_id: userId,
      provider: 'google',
      service: 'email',
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date!),
      scope: 'gmail.readonly,gmail.modify,gmail.compose'
    });

    return tokens;
  }

  async fetchEmails(userId: string, maxResults = 50) {
    // Get tokens from database
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .eq('service', 'email')
      .single();

    if (!tokenData) throw new Error('No Gmail token found');

    // Check if token expired, refresh if needed
    if (new Date(tokenData.expires_at) < new Date()) {
      await this.refreshToken(userId, tokenData.refresh_token);
    }

    this.oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults
    });

    const messages = await Promise.all(
      (response.data.messages || []).map(async ({ id }) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: id!,
          format: 'full'
        });
        return this.parseGmailMessage(msg.data, userId);
      })
    );

    // Store in database
    for (const message of messages) {
      await supabase.from('email_messages').upsert(message);
    }

    return messages;
  }

  private parseGmailMessage(msg: any, userId: string) {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name === name)?.value || '';

    return {
      user_id: userId,
      provider: 'google',
      external_message_id: msg.id,
      thread_id: msg.threadId,
      from_address: getHeader('From'),
      to_addresses: [getHeader('To')],
      cc_addresses: getHeader('Cc') ? [getHeader('Cc')] : [],
      subject: getHeader('Subject'),
      body_text: this.extractBody(msg.payload),
      received_at: new Date(parseInt(msg.internalDate)),
      is_read: !msg.labelIds?.includes('UNREAD')
    };
  }

  private extractBody(payload: any): string {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    if (payload.parts) {
      const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }
    return '';
  }

  private async refreshToken(userId: string, refreshToken: string) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();

    await supabase
      .from('oauth_tokens')
      .update({
        access_token: credentials.access_token,
        expires_at: new Date(credentials.expiry_date!)
      })
      .eq('user_id', userId)
      .eq('provider', 'google')
      .eq('service', 'email');
  }
}
```

### Mobile iOS: OAuth Flow

```swift
// apps/mobile-ios/TideApp/Features/Email/EmailConnectView.swift
import SwiftUI
import SafariServices

struct EmailConnectView: View {
    @StateObject private var viewModel = EmailConnectViewModel()
    @State private var showingSafari = false

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "envelope.fill")
                .font(.system(size: 80))
                .foregroundColor(.blue)

            Text("Connect Your Email")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Connect Gmail or Outlook to get started with AI email management")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 40)

            // Gmail Button
            Button(action: { viewModel.connectGmail() }) {
                HStack {
                    Image(systemName: "envelope")
                    Text("Connect Gmail")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
            }

            // Outlook Button
            Button(action: { viewModel.connectOutlook() }) {
                HStack {
                    Image(systemName: "envelope.badge")
                    Text("Connect Outlook")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
        .padding()
        .sheet(isPresented: $viewModel.showingOAuth) {
            SafariView(url: viewModel.oauthURL!)
                .onDisappear {
                    viewModel.handleOAuthReturn()
                }
        }
    }
}

@MainActor
class EmailConnectViewModel: ObservableObject {
    @Published var showingOAuth = false
    @Published var oauthURL: URL?

    private let apiClient = APIClient.shared

    func connectGmail() {
        Task {
            do {
                let authUrl = try await apiClient.getGmailAuthURL()
                oauthURL = URL(string: authUrl)
                showingOAuth = true
            } catch {
                print("Error getting Gmail auth URL: \(error)")
            }
        }
    }

    func connectOutlook() {
        // Similar to Gmail
    }

    func handleOAuthReturn() {
        // Handle callback from Safari
        Task {
            await apiClient.checkEmailConnection()
        }
    }
}
```

**Week 1 Deliverable**: Users can connect Gmail/Outlook, emails stored in database

---

## Week 2: AI Triage

### Backend: AI Triage Integration

```typescript
// packages/services/email/src/triage/email-triage.ts
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../supabase';

export class EmailTriageService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async triageEmails(userId: string, emailIds: string[]) {
    const { data: emails } = await supabase
      .from('email_messages')
      .select('*')
      .in('id', emailIds)
      .eq('user_id', userId);

    const triageResults = await Promise.all(
      emails!.map(email => this.triageEmail(email))
    );

    // Update database with AI analysis
    for (const result of triageResults) {
      await supabase
        .from('email_messages')
        .update({
          ai_category: result.category,
          ai_priority: result.priority,
          ai_summary: result.summary
        })
        .eq('id', result.emailId);
    }

    return triageResults;
  }

  private async triageEmail(email: any) {
    const prompt = `Analyze this email and categorize it:

From: ${email.from_address}
Subject: ${email.subject}
Body: ${email.body_text?.substring(0, 1000)}

Respond with JSON:
{
  "category": "urgent" | "important" | "normal" | "low",
  "priority": 1-10,
  "summary": "one sentence summary",
  "reasoning": "why this category"
}`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const result = JSON.parse(message.content[0].text);

    return {
      emailId: email.id,
      ...result
    };
  }
}
```

### Mobile iOS: Display Triaged Emails

```swift
// apps/mobile-ios/TideApp/Features/Email/EmailListView.swift
struct EmailListView: View {
    @StateObject private var viewModel = EmailListViewModel()

    var body: some View {
        NavigationView {
            List {
                // Urgent Section
                if !viewModel.urgentEmails.isEmpty {
                    Section(header: Text("URGENT").foregroundColor(.red)) {
                        ForEach(viewModel.urgentEmails) { email in
                            EmailRow(email: email)
                        }
                    }
                }

                // Important Section
                if !viewModel.importantEmails.isEmpty {
                    Section(header: Text("IMPORTANT").foregroundColor(.orange)) {
                        ForEach(viewModel.importantEmails) { email in
                            EmailRow(email: email)
                        }
                    }
                }

                // Normal Section
                if !viewModel.normalEmails.isEmpty {
                    Section(header: Text("INBOX")) {
                        ForEach(viewModel.normalEmails) { email in
                            EmailRow(email: email)
                        }
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .navigationTitle("Email")
        }
        .task {
            await viewModel.loadEmails()
        }
    }
}

struct EmailRow: View {
    let email: Email

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(email.fromName)
                    .font(.headline)
                    .fontWeight(email.isRead ? .regular : .bold)

                Spacer()

                if let category = email.aiCategory {
                    CategoryBadge(category: category)
                }
            }

            Text(email.subject ?? "(No Subject)")
                .font(.subheadline)
                .lineLimit(1)

            if let summary = email.aiSummary {
                HStack {
                    Image(systemName: "sparkles")
                        .font(.caption2)
                        .foregroundColor(.purple)
                    Text(summary)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
```

**Week 2 Deliverable**: Emails triaged by AI in <3s, displayed with categories

---

## Week 3: Smart Composition

### Backend: Multi-Draft Generation

```typescript
// packages/services/email/src/compose/smart-compose.ts
export class SmartComposeService {
  async generateDrafts(emailId: string, replyType: 'reply' | 'forward') {
    const { data: email } = await supabase
      .from('email_messages')
      .select('*')
      .eq('id', emailId)
      .single();

    const drafts = await Promise.all([
      this.generateDraft(email!, 'detailed'),
      this.generateDraft(email!, 'balanced'),
      this.generateDraft(email!, 'brief')
    ]);

    return drafts;
  }

  private async generateDraft(email: any, tone: string) {
    const prompt = `Generate a ${tone} email reply to:

From: ${email.from_address}
Subject: ${email.subject}
Body: ${email.body_text}

Tone: ${tone}
- detailed: 3-4 paragraphs, comprehensive
- balanced: 2 paragraphs, professional
- brief: 1-2 sentences, concise

Generate ONLY the reply body, no subject.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      tone,
      content: message.content[0].text
    };
  }
}
```

**Week 3 Deliverable**: AI-generated reply drafts (detailed/balanced/brief)

---

## Week 4: Polish + Advanced

### VIP Detection

```typescript
// Analyze email frequency to detect VIPs
const vips = await supabase
  .from('email_messages')
  .select('from_address')
  .eq('user_id', userId)
  .gte('received_at', thirtyDaysAgo);

const senderCounts = vips.data.reduce((acc, email) => {
  acc[email.from_address] = (acc[email.from_address] || 0) + 1;
  return acc;
}, {});

const vipSenders = Object.entries(senderCounts)
  .filter(([_, count]) => count > 10)
  .map(([sender]) => sender);
```

**Week 4 Deliverable**: VIP detection, auto-archive, email search

---

## Success Criteria

- [ ] Gmail connected in <30s
- [ ] Emails triaged in <3s
- [ ] 90%+ triage accuracy
- [ ] Multi-draft generation in <5s
- [ ] VIP detection >80% accurate
- [ ] Works offline (cached emails)

---

## Claude Code Prompts

**For OAuth:**
```
Implement Gmail OAuth in Email Service. Create GmailOAuth class with getAuthUrl, handleCallback, fetchEmails, and refreshToken methods. Store tokens in Supabase oauth_tokens table. Parse Gmail API responses and store in email_messages table. Handle token expiry and refresh.
```

**For AI triage:**
```
Implement email triage using Claude API. For each email, send prompt with from/subject/body, get JSON response with category (urgent/important/normal/low), priority (1-10), and summary. Update email_messages table with AI analysis. Process 50 emails in <3 seconds using parallel requests.
```

This track ships a complete, production-ready email intelligence feature.
