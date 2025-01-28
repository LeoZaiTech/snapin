import { run } from '../src/functions/handle_registration';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('handle_registration', () => {
  it('should create a custom object and work item for a new registration', async () => {
    // Mock event data
    const event = {
      context: {
        secrets: {
          service_account_token: process.env.DEVREV_API_KEY,
        },
      },
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
        utm_campaign: 'developer_campaign',
      },
    };

    // Run the handler
    await run([event]);
  });
});
