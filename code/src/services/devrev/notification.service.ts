import { DevRevAPIClient } from './client';

export interface NotificationData {
    ownerId: string;
    contactId: string;
    contactName: string;
    eventName: string;
    activityType: string;
    timestamp: string;
}

export class NotificationService {
    constructor(private readonly client: DevRevAPIClient) {}

    async notifyAccountOwner(data: NotificationData): Promise<void> {
        const message = this.formatNotificationMessage(data);
        
        try {
            await this.client.post('/timeline-entries.create', {
                object: data.ownerId,
                type: 'timeline_comment',
                body: message,
                visibility: 'private'
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
            // Don't throw error as this is a non-critical operation
        }
    }

    private formatNotificationMessage(data: NotificationData): string {
        const activityDescription = this.getActivityDescription(data.activityType);
        const timestamp = new Date(data.timestamp).toLocaleString();
        
        return `🔔 High Intent Activity Alert!\n\n` +
               `Contact ${data.contactName} ${activityDescription} "${data.eventName}" at ${timestamp}.\n` +
               `View contact: https://app.devrev.ai/contacts/${data.contactId}`;
    }

    private getActivityDescription(activityType: string): string {
        switch (activityType) {
            case 'event_entry':
                return 'joined the event';
            case 'cta_click':
                return 'clicked a CTA in';
            case 'registration':
                return 'registered for';
            default:
                return 'interacted with';
        }
    }
}
