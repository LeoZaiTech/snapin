import { run } from '../code/src/functions/handle_registration';

describe('handle_registration', () => {
  it('should create a custom object and work item for a new registration', async () => {
    const mockEvent = {
      event: {
        type: 'attendee.registered',
        payload: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          city: 'San Francisco',
          country: 'USA',
          jobTitle: 'Software Engineer',
          utm_source: 'linkedin',
          utm_medium: 'social',
          utm_campaign: 'developer_campaign'
        }
      },
      context: {
        secrets: {
          service_account_token: process.env.DEVREV_API_KEY
        }
      },
      execution_metadata: {
        devrev_endpoint: 'https://api.devrev.ai'
      },
      inputs: {
        organization: {
          account_linking_enabled: true
        }
      }
    };

    const result = await run([mockEvent]);
    console.log('Test result:', result);
    expect(result).toBeDefined();
  });
});
