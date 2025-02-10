import { AirmeetService } from './airmeet.service';
import { AccountLinkingService } from '../devrev/account_linking';
import { RegistrationSyncService } from '../devrev/registration_sync';
import { EngagementTrackingService } from '../devrev/engagement_tracking';


export interface WebhookRegistration {
    name: string;
    description?: string;
    triggerMetaInfoId: string;
    url: string;
    platformName: string;
    airmeetId?: string;
}

export interface AirmeetEventEntryPayload {
    email: string;
    airmeet_id: string;
    airmeet_name: string;
    timestamp: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export interface AirmeetCTAClickPayload {
    email: string;
    airmeet_id: string;
    airmeet_name: string;
    timestamp: string;
    cta_link: string;
    cta_text: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export interface AirmeetRegistrationPayload {
    email: string;
    airmeet_id: string;
    airmeet_name: string;
    registration_link: string;
    timestamp: string;
    phone_number?: string;
    city?: string;
    country?: string;
    job_title?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

export class WebhookHandlerService {
    constructor(
        private airmeetService: AirmeetService,
        private accountLinkingService: AccountLinkingService,
        private registrationSyncService: RegistrationSyncService,
        private engagementTrackingService: EngagementTrackingService
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
        try {
            const {
                email,
                firstName,
                lastName,
                city,
                country,
                designation: jobTitle,
                airmeetId: eventId,
                airmeetName: eventName,
                registrationDateTime,
                registrationLink,
                utmSource,
                utmMedium,
                utmCampaign,
                utmTerm,
                utmContent,
                phoneNumber,
                organization
            } = payload;

            // First find or create the contact
            const result = await this.accountLinkingService.lookupOrCreateAccount(email);
            if (!result.contactId) {
                throw new Error(`No contact found or created for email: ${email}`);
            }

            // Track the registration
            await this.registrationSyncService.syncRegistration({
                contactId: result.contactId,
                registrationDateTime: registrationDateTime || new Date().toISOString(),
                airmeetId: eventId,
                airmeetName: eventName,
                email: email,
                firstName: firstName,
                lastName: lastName,
                city: city,
                country: country,
                designation: jobTitle,
                organization: organization,
                utmSource: utmSource,
                utmMedium: utmMedium,
                utmCampaign: utmCampaign
            });

            return { success: true, contactId: result.contactId };
        } catch (error) {
            console.error('Error handling registration webhook:', error);
            throw error;
        }

    }

    async handleEventEntryWebhook(payload: AirmeetEventEntryPayload) {
        try {
            const {
                email,
                airmeet_id: eventId,
                airmeet_name: eventName,
                timestamp,
                utm_source: utmSource,
                utm_medium: utmMedium,
                utm_campaign: utmCampaign
            } = payload;

            // First find or create the contact
            const result = await this.accountLinkingService.lookupOrCreateAccount(email);
            if (!result.contactId) {
                throw new Error(`No contact found or created for email: ${email}`);
            }

            // Track the event entry
            await this.engagementTrackingService.trackEventEntry({
                contact_id: result.contactId,
                event_id: eventId,
                event_name: eventName,
                activity_timestamp: timestamp || new Date().toISOString()
            });

            return { success: true, contactId: result.contactId };
        } catch (error) {
            console.error('Error handling event entry webhook:', error);
            throw error;
        }
    }

    async handleCTAClickWebhook(payload: AirmeetCTAClickPayload) {
        try {
            const {
                email,
                airmeet_id: eventId,
                airmeet_name: eventName,
                timestamp,
                cta_link: ctaLink,
                cta_text: ctaText
            } = payload;

            // First find or create the contact
            const result = await this.accountLinkingService.lookupOrCreateAccount(email);
            if (!result.contactId) {
                throw new Error(`No contact found or created for email: ${email}`);
            }

            // Track the CTA click
            await this.engagementTrackingService.trackCTAClick({
                contact_id: result.contactId,
                event_id: eventId,
                event_name: eventName,
                activity_timestamp: timestamp || new Date().toISOString(),
                cta_link: ctaLink,
                cta_text: ctaText
            });

            return { success: true, contactId: result.contactId };
        } catch (error) {
            console.error('Error handling CTA click webhook:', error);
            throw error;
        }
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
