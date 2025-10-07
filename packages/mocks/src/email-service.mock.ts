import { Email } from '@tide/contracts';

export class MockEmailService {
  private mockEmails: any[] = [];

  async fetchEmails(userId: string, filter?: any): Promise<Email[]> {
    const ts = Date.now();
    return [
      {
        id: 'email_1',
        from: { name: 'John Smith', email: 'john@acme.com' },
        to: [{ name: 'You', email: 'you@company.com' }],
        subject: 'Q4 Budget Review',
        body: 'Hi, I wanted to discuss the Q4 budget allocations...',
        priority: 'high' as const,
        labels: ['important', 'finance'],
        timestamp: ts - 3600000,
        aiSummary: 'Request to review Q4 budget allocations'
      },
      {
        id: 'email_2',
        from: { name: 'Sarah Johnson', email: 'sarah@partner.com' },
        to: [{ name: 'You', email: 'you@company.com' }],
        subject: 'Partnership Opportunity',
        body: 'I hope this email finds you well. I wanted to reach out...',
        priority: 'normal' as const,
        labels: ['business development'],
        timestamp: ts - 7200000,
        aiSummary: 'Partnership proposal from Sarah at Partner Co'
      }
    ];
  }

  async sendEmail(email: any): Promise<{ success: boolean; messageId: string }> {
    const id = Date.now();
    this.mockEmails.push({ ...email, id: `email_${id}`, sent: true });
    return { success: true, messageId: `msg_${id}` };
  }

  async triageEmail(emailId: string): Promise<any> {
    return {
      priority: 'normal',
      category: 'general',
      suggestedActions: ['reply', 'archive']
    };
  }
}
