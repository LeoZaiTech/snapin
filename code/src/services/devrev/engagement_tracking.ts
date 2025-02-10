import { DevRevAPIClient } from './client';
import { ENGAGEMENT_SCHEMA, BaseEngagementData } from './schemas/engagement';
import { AirmeetService } from '../airmeet/airmeet.service';

export interface EngagementData extends BaseEngagementData {
    activity_type: 'event_entry' | 'cta_click';
    cta_link?: string;
    cta_text?: string;
}

export class EngagementTrackingService {
    private readonly LEAF_TYPE = 'airmeet_engagement';
    private schemaInitialized = false;

    constructor(
        private readonly client: DevRevAPIClient,
        private readonly airmeetService: AirmeetService
    ) {}

    private async ensureSchemaExists() {
        if (this.schemaInitialized) {
            return;
        }

        try {
            await this.client.post('/schemas.custom.set', ENGAGEMENT_SCHEMA);
            this.schemaInitialized = true;
        } catch (error: any) {
            // If schema already exists, that's fine
            if (error.response?.status !== 409) {
                throw error;
            }
            this.schemaInitialized = true;
        }
    }

    private calculateEngagementScore(activityType: 'event_entry' | 'cta_click'): number {
        // Enhanced scoring model:
        // - Event entry: 10 points (showing initial interest)
        // - CTA click: 25 points (showing high intent)
        // Additional points can be added based on time spent, etc.
        switch (activityType) {
            case 'event_entry':
                return 10;
            case 'cta_click':
                return 25;
            default:
                return 0;
        }
    }

    private async getEventDetails(eventId: string) {
        try {
            const event = await this.airmeetService.getEvent(eventId);
            return {
                startDate: event.startDate,
                endDate: event.endDate
            };
        } catch (error) {
            console.error('Error fetching event details:', error);
            return null;
        }
    }

    async trackEventEntry(data: Omit<EngagementData, 'activity_type' | 'cta_link' | 'cta_text'>) {
        await this.ensureSchemaExists();
        
        // Get event details
        const eventDetails = await this.getEventDetails(data.event_id);
        
        return this.createEngagementRecord({
            ...data,
            activity_type: 'event_entry',
            event_start_date: eventDetails?.startDate,
            event_end_date: eventDetails?.endDate,
            engagement_score: this.calculateEngagementScore('event_entry')
        });
    }

    async trackCTAClick(data: Omit<EngagementData, 'activity_type'>) {
        if (!data.cta_link || !data.cta_text) {
            throw new Error('CTA link and text are required for CTA click tracking');
        }
        
        await this.ensureSchemaExists();
        return this.createEngagementRecord({
            ...data,
            activity_type: 'cta_click',
            engagement_score: this.calculateEngagementScore('cta_click')
        });
    }

    private async createEngagementRecord(data: EngagementData) {
        try {
            const uniqueKey = `${data.activity_type}_${data.event_id}_${Date.now()}`;
            
            const response = await this.client.post('/custom-objects.create', {
                leaf_type: this.LEAF_TYPE,
                unique_key: uniqueKey,
                custom_schema_spec: {
                    tenant_fragment: true
                },
                custom_fields: {
                    tnt__contact_id: data.contact_id,
                    tnt__event_id: data.event_id,
                    tnt__event_name: data.event_name,
                    tnt__activity_type: data.activity_type,
                    tnt__activity_timestamp: data.activity_timestamp,
                    tnt__event_start_date: data.event_start_date,
                    tnt__event_end_date: data.event_end_date,
                    ...(data.registration_link && { tnt__registration_link: data.registration_link }),
                    ...(data.utm_source && { tnt__utm_source: data.utm_source }),
                    ...(data.utm_medium && { tnt__utm_medium: data.utm_medium }),
                    ...(data.utm_campaign && { tnt__utm_campaign: data.utm_campaign }),
                    ...(data.utm_term && { tnt__utm_term: data.utm_term }),
                    ...(data.utm_content && { tnt__utm_content: data.utm_content }),
                    ...(data.cta_link && { tnt__cta_link: data.cta_link }),
                    ...(data.cta_text && { tnt__cta_text: data.cta_text }),
                    ...(data.engagement_score !== undefined && { tnt__engagement_score: data.engagement_score })
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating engagement record:', error);
            throw error;
        }
    }
}
