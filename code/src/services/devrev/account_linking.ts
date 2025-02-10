import { DevRevClient } from './client';
import { 
    extractDomainFromEmail, 
    isValidBusinessDomain, 
    normalizeEmail,
    generateAccountDisplayName 
} from './domain_utils';

export interface AccountLookupResult {
    accountId?: string;
    contactId?: string;
    isNewAccount: boolean;
    isNewContact: boolean;
}

export interface ContactInfo {
    email: string;
    displayName: string;
    phoneNumber?: string;
    city?: string;
    country?: string;
    jobTitle?: string;
}

export class AccountLinkingService {
    constructor(private client: DevRevClient) {}

    async lookupOrCreateAccount(email: string): Promise<AccountLookupResult> {
        const normalizedEmail = normalizeEmail(email);
        const domain = extractDomainFromEmail(normalizedEmail);
        
        // Skip account creation for generic domains
        if (!isValidBusinessDomain(normalizedEmail)) {
            const contact = await this.findOrCreateContact({
                email: normalizedEmail,
                displayName: email.split('@')[0] // Use local part as display name
            });
            
            return {
                contactId: contact.id,
                isNewAccount: false,
                isNewContact: contact.isNew
            };
        }

        // Look for existing account by domain
        const existingAccount = await this.findAccountByDomain(domain);
        let accountId = existingAccount?.id;
        let isNewAccount = false;

        // Create new account if none exists
        if (!existingAccount) {
            const newAccount = await this.createAccount(domain);
            accountId = newAccount.id;
            isNewAccount = true;
        }

        // Look for existing contact within the account
        const contact = await this.findOrCreateContact({
            email: normalizedEmail,
            displayName: email.split('@')[0],
            accountId
        });

        return {
            accountId,
            contactId: contact.id,
            isNewAccount,
            isNewContact: contact.isNew
        };
    }

    private async findAccountByDomain(domain: string) {
        // First try to find by domain
        const domainResponse = await this.client.post('/accounts.list', {
            domains: [domain],
            limit: 1
        });

        if (domainResponse.data.accounts?.length > 0) {
            return domainResponse.data.accounts[0];
        }

        // If not found by domain, try external references
        const externalRefResponse = await this.client.post('/accounts.list', {
            external_refs: [domain],
            limit: 1
        });

        const accounts = externalRefResponse.data.accounts || [];
        return accounts[0];
    }

    private async createAccount(domain: string) {
        const displayName = generateAccountDisplayName(domain);
        
        const response = await this.client.post('/accounts.create', {
            display_name: displayName,
            domains: [domain],
            external_refs: [domain] // Add domain as external reference for additional lookup
        });

        console.log('Account creation response:', JSON.stringify(response.data, null, 2));

        // Check for both possible response formats
        const account = response.data?.account || response.data;
        if (!account?.id) {
            throw new Error('Failed to create account: Invalid response format');
        }

        return account;
    }

    private async findOrCreateContact(info: ContactInfo & { accountId?: string }) {
        // Look for existing contact by email
        const existingContact = await this.findContactByEmail(info.email);
        
        if (existingContact) {
            return {
                id: existingContact.id,
                isNew: false
            };
        }

        // Create new contact
        const newContact = await this.createContact(info);
        return {
            id: newContact.id,
            isNew: true
        };
    }

    private async findContactByEmail(email: string) {
        const response = await this.client.post('/rev-users.list', {
            email: [email],
            limit: 1
        });

        const contacts = response.data.rev_users || [];
        return contacts[0];
    }

    private async createContact(info: ContactInfo & { accountId?: string }) {
        const contactData: any = {
            display_name: info.displayName,
            email: info.email
        };

        if (info.accountId) {
            contactData.account = info.accountId;
        }

        if (info.phoneNumber) {
            contactData.phone_numbers = [info.phoneNumber];
        }

        // Add optional fields if present
        if (info.city) contactData.city = info.city;
        if (info.country) contactData.country = info.country;
        if (info.jobTitle) contactData.job_title = info.jobTitle;

        const response = await this.client.post('/rev-users.create', contactData);
        return response.data.rev_user;
    }

    async linkOrCreateContact(info: {
        email: string;
        firstName: string;
        lastName: string;
        city?: string;
        country?: string;
        jobTitle?: string;
        organization?: string;
    }) {
        const result = await this.lookupOrCreateAccount(info.email);
        
        // Create or update the contact with the full information
        const contact = await this.findOrCreateContact({
            email: info.email,
            displayName: `${info.firstName} ${info.lastName}`,
            phoneNumber: undefined,
            city: info.city,
            country: info.country,
            jobTitle: info.jobTitle,
            accountId: result.accountId
        });

        return contact;
    }
}
