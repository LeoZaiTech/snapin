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
        post: {
            status: 200,
            statusText: 'OK',
            data: { success: true },
            headers: {},
            config: {}
        },
        get: {
            status: 200,
            statusText: 'OK',
            data: {},
            headers: {},
            config: {}
        },
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
} as const;

// Mock service factories
const createMockAirmeetService = (): MockAirmeetService => ({
    post: jest.fn().mockResolvedValue(mockResponses.airmeet.post),
    get: jest.fn().mockResolvedValue(mockResponses.airmeet.get),
    authenticate: jest.fn().mockResolvedValue(undefined),
    client: {},
    baseUrl: 'https://test.com',
    communityId: 'test-community',
    accessToken: 'test-token'
});

const createMockAccountLinkingService = (): MockAccountLinkingService => ({
    linkOrCreateContact: jest.fn().mockResolvedValue(mockResponses.accountLinking.contact),
    client: {},
    lookupOrCreateAccount: jest.fn().mockResolvedValue(mockResponses.accountLinking.account)
});

const createMockRegistrationSyncService = (): MockRegistrationSyncService => ({
    syncRegistration: jest.fn().mockResolvedValue(mockResponses.registration.sync),
    client: {},
    getRegistration: jest.fn().mockResolvedValue(null)
});

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
