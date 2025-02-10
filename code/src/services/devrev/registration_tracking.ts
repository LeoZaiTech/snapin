import { DevRevAPIClient } from './client';
import { REGISTRATION_SCHEMA } from './schemas/registration';
import type { RegistrationData } from './schemas/registration';

export class RegistrationTrackingService {
    private readonly LEAF_TYPE = 'airmeet_registration';
    private schemaInitialized = false;

    constructor(private readonly client: DevRevAPIClient) {}

    private async ensureSchemaExists() {
        if (this.schemaInitialized) {
            return;
        }

        try {
            await this.client.post('/schemas.custom.set', REGISTRATION_SCHEMA);
            this.schemaInitialized = true;
        } catch (error: any) {
            // If schema already exists, that's fine
            if (error.response?.status !== 409) {
                throw error;
            }
            this.schemaInitialized = true;
        }
    }

    async createRegistrationRecord(data: RegistrationData) {
        await this.ensureSchemaExists();

        try {
            const response = await this.client.post('/custom-objects.create', {
                type: 'custom_object',
                custom_object: {
                    leaf_type: this.LEAF_TYPE,
                    data: {
                        contact_id: data.contact_id,
                        registered_at: data.registered_at,
                        airmeet_id: data.airmeet_id,
                        airmeet_name: data.airmeet_name,
                        registration_link: data.registration_link,
                        email: data.email,
                        phone_number: data.phone_number,
                        city: data.city,
                        country: data.country,
                        job_title: data.job_title,
                        utm_source: data.utm_source,
                        utm_medium: data.utm_medium,
                        utm_campaign: data.utm_campaign,
                        utm_term: data.utm_term,
                        utm_content: data.utm_content
                    }
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating registration record:', error);
            throw error;
        }
    }
}
