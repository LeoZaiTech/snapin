import { client, publicSDK } from "@devrev/typescript-sdk";
import { excludeGenericDomain, extractDomainFromEmail } from '../../utils/domain';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function handleEvent(event: any) {
  try {
    const devrevPAT = event.context.secrets.service_account_token;
    if (!devrevPAT) {
      console.error('Missing DevRev service account token');
      return;
    }

    const APIBase = event.execution_metadata.devrev_endpoint;
    if (!APIBase) {
      console.error('Missing DevRev API endpoint');
      return;
    }

    // Initialize SDK
    console.log('Initializing DevRev SDK...');
    const devrevSDK = client.setup({
      endpoint: APIBase,
      token: devrevPAT,
    });

    const registrantData = event.event.payload;
    const email = registrantData.email;
    const domain = extractDomainFromEmail(email);

    // Skip generic domains if account linking is enabled
    const accountLinkingEnabled = event.inputs.organization.account_linking_enabled;
    if (accountLinkingEnabled && excludeGenericDomain(domain)) {
      console.log(`Skipping generic domain: ${domain}`);
      return;
    }

    // First, check if an account exists for this domain
    console.log(`Checking for existing account with domain: ${domain}`);
    try {
      const accountResponse = await devrevSDK.accountsList({
        display_name: [domain] // Using display_name as a fallback since domains isn't supported
      });

      let accountId = null;
      if (accountResponse.data.accounts && accountResponse.data.accounts.length > 0) {
        accountId = accountResponse.data.accounts[0].id;
        console.log(`Found existing account for domain ${domain}: ${accountId}`);
      }

      // Get the default feature ID and owner ID from environment variables
      const defaultFeatureId = process.env['DEVREV_DEFAULT_FEATURE_ID'];
      const defaultOwnerId = process.env['DEVREV_DEFAULT_OWNER_ID'];
      
      console.log('Using feature ID:', defaultFeatureId);
      console.log('Using owner ID:', defaultOwnerId);

      if (!defaultFeatureId || !defaultOwnerId) {
        throw new Error('Missing required environment variables: DEVREV_DEFAULT_FEATURE_ID and/or DEVREV_DEFAULT_OWNER_ID');
      }

      // Create a work item (ticket) for the registration
      console.log(`Creating new work item for contact: ${email}`);
      console.log(`Using feature ID: ${defaultFeatureId}`);
      console.log(`Using owner ID: ${defaultOwnerId}`);

      const workResponse = await devrevSDK.worksCreate({
        applies_to_part: defaultFeatureId,
        owned_by: [defaultOwnerId],
        title: `New Contact Registration: ${registrantData.firstName} ${registrantData.lastName}`,
        type: publicSDK.WorkType.Ticket,
        body: `Contact Information:
Email: ${email}
Name: ${registrantData.firstName} ${registrantData.lastName}
Phone: ${registrantData.phone || 'Not provided'}
City: ${registrantData.city || 'Not provided'}
Country: ${registrantData.country || 'Not provided'}
Job Title: ${registrantData.jobTitle || 'Not provided'}
Source: Airmeet Registration
UTM Source: ${registrantData.utm_source || 'direct'}
UTM Medium: ${registrantData.utm_medium || 'none'}
UTM Campaign: ${registrantData.utm_campaign || 'none'}`,
        ...(accountId && { applies_to_account: accountId })
      });

      console.log(`Successfully created work item:`, workResponse.data);
      return workResponse.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please check your DevRev service account token.');
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in handle_registration:', error);
    throw error;
  }
}

export async function run(events: any[]) {
  return await handleEvent(events[0]);
}
