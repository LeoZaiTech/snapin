import { AirmeetService } from './airmeet.service';
import { AccountLinkingService } from '../devrev/account_linking';
import { RegistrationSyncService } from '../devrev/registration_sync';

export interface WebhookRegistration {
    name: string;
    description?: string;
    triggerMetaInfoId: string;
    url: string;
    platformName: string;
    airmeetId?: string;
}

export class WebhookHandlerService {
    constructor(
        private airmeetService: AirmeetService,
        private accountLinkingService: AccountLinkingService,
        private registrationSyncService: RegistrationSyncService
    ) {}

    async registerWebhooks(baseUrl: string, airmeetId?: string): Promise<void> {
        const webhooks: WebhookRegistration[] = [
            {
                name: 'Registration Sync',
                description: 'Sync new registrations with DevRev',
                triggerMetaInfoId: 'trigger.airmeet.attendee.added',
                url: `${baseUrl}/webhooks/registration`,
                platformName: 'DevRev',
            },
            {
                name: 'Event Entry Tracking',
                description: 'Track when attendees enter the event',
                triggerMetaInfoId: 'trigger.attendee.entered_airmeet',
                url: `${baseUrl}/webhooks/event-entry`,
                platformName: 'DevRev',
                airmeetId
            },
            {
                name: 'CTA Click Tracking',
                description: 'Track when attendees click CTAs',
                triggerMetaInfoId: 'trigger.attendee.clicked_cta',
                url: `${baseUrl}/webhooks/cta-click`,
                platformName: 'DevRev',
                airmeetId
            }
        ];

        for (const webhook of webhooks) {
            try {
                const endpoint = webhook.airmeetId 
                    ? `/platform-integration/v1/webhook-register?airmeetId=${webhook.airmeetId}`
                    : '/platform-integration/v1/webhook-register';

                await this.airmeetService.post(endpoint, webhook);
                console.log(`Registered webhook: ${webhook.name}`);
            } catch (error) {
                console.error(`Failed to register webhook ${webhook.name}:`, error);
                throw error;
            }
        }
    }

    async handleRegistrationWebhook(payload: any) {
        const {
            email,
            firstName,
            lastName,
            city,
            country,
            designation,
            organisation,
            airmeetId,
            airmeetName,
            registrationDateTime,
            utmSource,
            utmMedium,
            utmCampaign,
            customFields
        } = payload;

        // First, handle account linking and contact creation
        const contact = await this.accountLinkingService.linkOrCreateContact({
            email,
            firstName,
            lastName,
            city,
            country,
            jobTitle: designation,
            organization: organisation
        });

        // Then sync the registration data
        await this.registrationSyncService.syncRegistration({
            contactId: contact.id,
            registrationDateTime,
            airmeetName,
            airmeetId,
            firstName,
            lastName,
            email,
            city,
            country,
            designation,
            organization: organisation,
            utmSource,
            utmMedium,
            utmCampaign,
            customFields
        });

        return { success: true, contactId: contact.id };
    }

    async handleEventEntryWebhook(payload: any) {
        // TODO: Implement event entry tracking
        // This will be used for intent signals and engagement tracking
        console.log('Event entry webhook received:', payload);
        return { success: true };
    }

    async handleCTAClickWebhook(payload: any) {
        // TODO: Implement CTA click tracking
        // This will be used for intent signals and engagement tracking
        console.log('CTA click webhook received:', payload);
        return { success: true };
    }

    async listActiveWebhooks(airmeetId?: string): Promise<any> {
        try {
            const endpoint = airmeetId 
                ? `/platform-integration/v1/webhook-list?airmeetId=${airmeetId}`
                : '/platform-integration/v1/webhook-list';

            const response = await this.airmeetService.get(endpoint);
            return response.data.webhookDTOList;
        } catch (error) {
            console.error('Failed to list webhooks:', error);
            throw error;
        }
    }
}
