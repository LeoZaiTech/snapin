import { AirmeetService } from '../code/src/services/airmeet/airmeet.service';
import { WebhookHandlerService } from '../code/src/services/airmeet/webhook_handler';
import { AccountLinkingService } from '../code/src/services/devrev/account_linking';
import { RegistrationSyncService, AirmeetRegistrationData } from '../code/src/services/devrev/registration_sync';
import { jest } from '@jest/globals';

// Mock service types with required methods
type MockAirmeetService = {
    post: jest.Mock;
    get: jest.Mock;
    authenticate: jest.Mock;
    client: any;
    baseUrl: string;
    communityId: string;
    accessToken: string;
};

type MockAccountLinkingService = {
    linkOrCreateContact: jest.Mock;
    lookupOrCreateAccount: jest.Mock;
    client: any;
};

type MockRegistrationSyncService = {
    syncRegistration: jest.Mock;
    getRegistration: jest.Mock;
    client: any;
};

// Default mock responses
const mockResponses = {
    airmeet: {
        post: { data: { success: true } },
        get: { data: {} },
    },
    accountLinking: {
        contact: { id: 'contact123' },
        account: { id: 'acc123' },
    },
    registration: {
        sync: {
            id: 'reg123',
            leaf_type: 'airmeet_registration',
            title: 'Registration: John Doe - Test Airmeet',
            custom_fields: {
                contact_id: 'contact123',
                email: 'test@example.com'
            }
        }
    },
};

// Mock service factories
const createMockAirmeetService = (): MockAirmeetService => {
    const service = new MockAirmeetService();
    service.post.mockResolvedValue({ data: { success: true } });
    service.get.mockResolvedValue({ data: {} });
    service.authenticate.mockResolvedValue(undefined);
    return service;
};

const createMockAccountLinkingService = (): MockAccountLinkingService => {
    const service = new MockAccountLinkingService();
    service.linkOrCreateContact.mockResolvedValue(mockResponses.accountLinking.contact);
    service.lookupOrCreateAccount.mockResolvedValue(mockResponses.accountLinking.account);
    return service;
};

const createMockRegistrationSyncService = (): MockRegistrationSyncService => {
    const service = new MockRegistrationSyncService();
    service.syncRegistration.mockResolvedValue(mockResponses.registration.sync);
    service.getRegistration.mockResolvedValue(null);
    return service;
};

describe('WebhookHandlerService', () => {
    let mockAirmeetService: MockAirmeetService;
    let mockAccountLinkingService: MockAccountLinkingService;
    let mockRegistrationSyncService: MockRegistrationSyncService;
    let webhookHandler: WebhookHandlerService;

    beforeEach(() => {
        mockAirmeetService = createMockAirmeetService();
        mockAccountLinkingService = createMockAccountLinkingService();
        mockRegistrationSyncService = createMockRegistrationSyncService();

        webhookHandler = new WebhookHandlerService(
            mockAirmeetService,
            mockAccountLinkingService,
            mockRegistrationSyncService
        );
    });

    describe('registerWebhooks', () => {
        it('should register all required webhooks', async () => {
            const baseUrl = 'https://api.example.com';
            const airmeetId = 'event123';

            mockAirmeetService.post.mockResolvedValue({ data: { success: true } });

            await webhookHandler.registerWebhooks(baseUrl, airmeetId);

            // Should register 3 webhooks
            expect(mockAirmeetService.post).toHaveBeenCalledTimes(3);

            // Check registration webhook
            expect(mockAirmeetService.post).toHaveBeenCalledWith(
                '/platform-integration/v1/webhook-register',
                expect.objectContaining({
                    triggerMetaInfoId: 'trigger.airmeet.attendee.added',
                    url: `${baseUrl}/webhooks/registration`,
                    platformName: 'DevRev'
                })
            );
        });
    });
});
