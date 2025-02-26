import { DevRevAPIClient } from './client';

export interface AirmeetRegistrationData {
  contactId: string;
  registrationDateTime: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  airmeetName: string;
  airmeetId: string;
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  country?: string;
  designation?: string;
  organization?: string;
  attendanceType?: 'IN-PERSON' | 'VIRTUAL';
  customFields?: Array<{
    fieldId: string;
    value: string | string[];
  }>;
}

export class RegistrationSyncService {
  private readonly LEAF_TYPE = 'airmeet_registration';

  constructor(private client: DevRevAPIClient) {}

  async syncRegistration(data: AirmeetRegistrationData) {
    const uniqueKey = `${data.airmeetId}:${data.email}`;

    // Create custom fields for the registration data
    const customFields: Record<string, any> = {
      airmeet_id: data.airmeetId,
      airmeet_name: data.airmeetName,
      attendance_type: data.attendanceType || 'VIRTUAL',
      contact_id: data.contactId,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      registered_datetime: data.registrationDateTime,
    };

    // Add optional fields if present
    if (data.utmSource) customFields['utm_source'] = data.utmSource;
    if (data.utmMedium) customFields['utm_medium'] = data.utmMedium;
    if (data.utmCampaign) customFields['utm_campaign'] = data.utmCampaign;
    if (data.city) customFields['city'] = data.city;
    if (data.country) customFields['country'] = data.country;
    if (data.designation) customFields['designation'] = data.designation;
    if (data.organization) customFields['organization'] = data.organization;

    // Add any custom fields from Airmeet
    if (data.customFields && data.customFields.length > 0) {
      const airmeetCustomFields: Record<string, any> = {};
      data.customFields.forEach((field) => {
        airmeetCustomFields[field.fieldId] = field.value;
      });
      customFields['airmeet_custom_fields'] = airmeetCustomFields;
    }

    try {
      const response = await this.client.post('/custom-objects.create', {
        custom_fields: customFields,
        leaf_type: this.LEAF_TYPE,
        title: `Registration: ${data.firstName} ${data.lastName} - ${data.airmeetName}`,
        unique_key: uniqueKey,
      });

      return response.data.custom_object;
    } catch (error) {
      console.error('Error syncing registration:', error);
      throw error;
    }
  }

  async getRegistration(airmeetId: string, email: string) {
    const uniqueKey = `${airmeetId}:${email}`;

    try {
      const response = await this.client.post('/custom-objects.list', {
        filter: {
          unique_key: [uniqueKey],
        },
        leaf_type: this.LEAF_TYPE,
        limit: 1,
      });

      const objects = response.data.custom_objects || [];
      return objects[0];
    } catch (error) {
      console.error('Error getting registration:', error);
      throw error;
    }
  }
}
