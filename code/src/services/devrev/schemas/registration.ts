export interface RegistrationData {
    contact_id: string;
    registered_at: string;
    airmeet_id: string;
    airmeet_name: string;
    registration_link: string;
    email: string;
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

export const REGISTRATION_SCHEMA = {
    type: 'tenant_fragment',
    description: 'Attributes for Airmeet registration tracking',
    leaf_type: 'airmeet_registration',
    fields: [
        {
            name: 'contact_id',
            field_type: 'string',
            description: 'ID of the associated contact'
        },
        {
            name: 'registered_at',
            field_type: 'datetime',
            description: 'When the registration occurred'
        },
        {
            name: 'airmeet_id',
            field_type: 'string',
            description: 'Airmeet event ID'
        },
        {
            name: 'airmeet_name',
            field_type: 'string',
            description: 'Name of the Airmeet event'
        },
        {
            name: 'registration_link',
            field_type: 'string',
            description: 'Link used for event registration'
        },
        {
            name: 'email',
            field_type: 'string',
            description: 'Registrant email address'
        },
        {
            name: 'phone_number',
            field_type: 'string',
            description: 'Registrant phone number',
            required: false
        },
        {
            name: 'city',
            field_type: 'string',
            description: 'Registrant city',
            required: false
        },
        {
            name: 'country',
            field_type: 'string',
            description: 'Registrant country',
            required: false
        },
        {
            name: 'job_title',
            field_type: 'string',
            description: 'Registrant job title',
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
    id_prefix: 'AMREG'
};
