import { DevRevAPIClient } from './client';
import type { RegistrationData } from './schemas/registration';
import { REGISTRATION_SCHEMA } from './schemas/registration';

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
        custom_object: {
          data: {
            airmeet_id: data.airmeet_id,
            airmeet_name: data.airmeet_name,
            city: data.city,
            contact_id: data.contact_id,
            country: data.country,
            email: data.email,
            job_title: data.job_title,
            phone_number: data.phone_number,
            registered_at: data.registered_at,
            registration_link: data.registration_link,
            utm_campaign: data.utm_campaign,
            utm_content: data.utm_content,
            utm_medium: data.utm_medium,
            utm_source: data.utm_source,
            utm_term: data.utm_term,
          },
          leaf_type: this.LEAF_TYPE,
        },
        type: 'custom_object',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating registration record:', error);
      throw error;
    }
  }
}
