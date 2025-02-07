import { DevRevAPIClient } from './client';

export interface AirmeetRegistrationForm {
    leaf_type: 'airmeet_registration';
    unique_key: string;
    title: string;
    custom_fields: {
        contact_id: string;
        registered_datetime: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        utm_term?: string;
        utm_content?: string;
        airmeet_name: string;
        airmeet_id: string;
    };
}

export interface AirmeetEngagement {
    leaf_type: 'airmeet_engagement';
    unique_key: string;
    title: string;
    custom_fields: {
        contact_id: string;
        airmeet_id: string;
        airmeet_name: string;
        registration_link: string;
        registration_time: string;
        event_start_date: string;
        event_end_date: string;
        intent_signals: {
            entered_event: boolean;
            clicked_cta: boolean;
            cta_details?: string;
        };
    };
}

export class DevRevCustomObjects {
    constructor(private readonly client: DevRevAPIClient) {}

    async createRegistrationForm(data: Omit<AirmeetRegistrationForm, 'leaf_type'>) {
        try {
            const response = await this.client.post('/custom-objects.create', {
                leaf_type: 'airmeet_registration',
                ...data
            });
            return response.data.custom_object;
        } catch (error) {
            console.error('Error creating registration form:', error);
            throw error;
        }
    }

    async createEngagement(data: Omit<AirmeetEngagement, 'leaf_type'>) {
        try {
            const response = await this.client.post('/custom-objects.create', {
                leaf_type: 'airmeet_engagement',
                ...data
            });
            return response.data.custom_object;
        } catch (error) {
            console.error('Error creating engagement record:', error);
            throw error;
        }
    }

    async getRegistrationForm(uniqueKey: string) {
        try {
            const response = await this.client.post('/custom-objects.list', {
                leaf_type: 'airmeet_registration',
                filters: {
                    unique_key: uniqueKey
                }
            });
            return response.data.custom_objects[0];
        } catch (error) {
            console.error('Error fetching registration form:', error);
            throw error;
        }
    }

    async getEngagement(uniqueKey: string) {
        try {
            const response = await this.client.post('/custom-objects.list', {
                leaf_type: 'airmeet_engagement',
                filters: {
                    unique_key: uniqueKey
                }
            });
            return response.data.custom_objects[0];
        } catch (error) {
            console.error('Error fetching engagement record:', error);
            throw error;
        }
    }
}
