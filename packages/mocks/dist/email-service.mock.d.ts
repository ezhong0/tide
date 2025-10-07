import { Email } from '@tide/contracts';
export declare class MockEmailService {
    private mockEmails;
    fetchEmails(userId: string, filter?: any): Promise<Email[]>;
    sendEmail(email: any): Promise<{
        success: boolean;
        messageId: string;
    }>;
    triageEmail(emailId: string): Promise<any>;
}
