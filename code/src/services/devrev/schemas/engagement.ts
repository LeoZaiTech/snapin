export interface BaseEngagementData {
    contact_id: string;
    event_id: string;
    event_name: string;
    activity_timestamp: string;
    event_start_date?: string;
    event_end_date?: string;
    registration_link?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

export interface EventEntryData extends BaseEngagementData {}

export interface CTAClickData extends BaseEngagementData {
    cta_link: string;
    cta_text: string;
}

export const ENGAGEMENT_TYPES = {
    EVENT_ENTRY: 'event_entry',
    CTA_CLICK: 'cta_click'
} as const;

export const ENGAGEMENT_SCHEMA = {
    type: 'tenant_fragment',
    description: 'Attributes for Airmeet engagement tracking',
    leaf_type: 'airmeet_engagement',
    fields: [
        {
            name: 'contact_id',
            field_type: 'string',
            description: 'ID of the associated contact'
        },
        {
            name: 'event_id',
            field_type: 'string',
            description: 'Airmeet event ID'
        },
        {
            name: 'event_name',
            field_type: 'string',
            description: 'Name of the Airmeet event'
        },
        {
            name: 'activity_type',
            field_type: 'enum',
            description: 'Type of engagement activity',
            allowed_values: ['event_entry', 'cta_click']
        },
        {
            name: 'activity_timestamp',
            field_type: 'datetime',
            description: 'When the activity occurred'
        },
        {
            name: 'cta_link',
            field_type: 'string',
            description: 'URL of the CTA button (for CTA clicks only)',
            required: false
        },
        {
            name: 'cta_text',
            field_type: 'string',
            description: 'Text of the CTA button (for CTA clicks only)',
            required: false
        },
        {
            name: 'event_start_date',
            field_type: 'datetime',
            description: 'Start date and time of the event',
            required: false
        },
        {
            name: 'event_end_date',
            field_type: 'datetime',
            description: 'End date and time of the event',
            required: false
        },
        {
            name: 'registration_link',
            field_type: 'string',
            description: 'Link used for event registration',
            required: false
        },
        {
            name: 'utm_source',
            field_type: 'string',
            description: 'UTM source parameter from registration',
            required: false
        },
        {
            name: 'utm_medium',
            field_type: 'string',
            description: 'UTM medium parameter from registration',
            required: false
        },
        {
            name: 'utm_campaign',
            field_type: 'string',
            description: 'UTM campaign parameter from registration',
            required: false
        },
        {
            name: 'utm_term',
            field_type: 'string',
            description: 'UTM term parameter from registration',
            required: false
        },
        {
            name: 'utm_content',
            field_type: 'string',
            description: 'UTM content parameter from registration',
            required: false
        }
    ],
    is_custom_leaf_type: true,
    id_prefix: 'AMENG'
};
