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
        }
    ],
    is_custom_leaf_type: true,
    id_prefix: 'AMENG'
};
