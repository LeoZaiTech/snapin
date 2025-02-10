import { DevRevClient } from '../code/src/services/devrev/client';
import { AccountLinkingService } from '../code/src/services/devrev/account_linking';
import { jest } from '@jest/globals';

describe('AccountLinkingService', () => {
    let mockClient: jest.Mocked<DevRevClient>;
    let accountLinking: AccountLinkingService;

    beforeEach(() => {
        mockClient = {
            post: jest.fn(),
        } as any;

        accountLinking = new AccountLinkingService(mockClient);
    });

    describe('lookupOrCreateAccount', () => {
        it('should handle generic email domains without creating account', async () => {
            const email = 'test@gmail.com';
            const mockContact = {
                id: 'contact123',
                display_name: 'test',
                email: email
            };

            // Mock finding no existing contact, then creating one
            const mockResponse = {
                data: { rev_users: [] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
            const mockCreateResponse = {
                data: { rev_user: mockContact },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
            mockClient.post
                .mockResolvedValueOnce(mockResponse)
                .mockResolvedValueOnce(mockCreateResponse);

            const result = await accountLinking.lookupOrCreateAccount(email);

            expect(result).toEqual({
                contactId: 'contact123',
                isNewAccount: false,
                isNewContact: true
            });

            // Verify we didn't try to create/lookup an account
            expect(mockClient.post).not.toHaveBeenCalledWith('/accounts.list', expect.any(Object));
        });

        it('should create new account and contact for business domain', async () => {
            const email = 'test@company.com';
            const mockAccount = {
                id: 'account123',
                display_name: 'Company',
                domains: ['company.com']
            };
            const mockContact = {
                id: 'contact123',
                display_name: 'test',
                email: email,
                account: 'account123'
            };

            // Mock the API calls
            mockClient.post
                // First lookup by domain
                .mockResolvedValueOnce({
                    data: { accounts: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                // Second lookup by external refs
                .mockResolvedValueOnce({
                    data: { accounts: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                // Account creation
                .mockResolvedValueOnce({
                    data: { account: mockAccount },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                // Contact lookup
                .mockResolvedValueOnce({
                    data: { rev_users: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                // Contact creation
                .mockResolvedValueOnce({
                    data: { rev_user: mockContact },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            const result = await accountLinking.lookupOrCreateAccount(email);

            expect(result).toEqual({
                accountId: 'account123',
                contactId: 'contact123',
                isNewAccount: true,
                isNewContact: true
            });
        });

        it('should link contact to existing account', async () => {
            const email = 'test@existing.com';
            const mockAccount = {
                id: 'account123',
                display_name: 'Existing',
                domains: ['existing.com']
            };
            const mockContact = {
                id: 'contact123',
                display_name: 'test',
                email: email,
                account: 'account123'
            };

            // Mock the API calls
            mockClient.post
                .mockResolvedValueOnce({
                    data: { accounts: [mockAccount] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: { rev_users: [] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: { rev_user: mockContact },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            const result = await accountLinking.lookupOrCreateAccount(email);

            expect(result).toEqual({
                accountId: 'account123',
                contactId: 'contact123',
                isNewAccount: false,
                isNewContact: true
            });
        });

        it('should handle existing contact', async () => {
            const email = 'existing@company.com';
            const mockAccount = {
                id: 'account123',
                display_name: 'Company',
                domains: ['company.com']
            };
            const mockContact = {
                id: 'contact123',
                display_name: 'existing',
                email: email,
                account: 'account123'
            };

            // Mock the API calls
            mockClient.post
                .mockResolvedValueOnce({
                    data: { accounts: [mockAccount] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: { rev_users: [mockContact] },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            const result = await accountLinking.lookupOrCreateAccount(email);

            expect(result).toEqual({
                accountId: 'account123',
                contactId: 'contact123',
                isNewAccount: false,
                isNewContact: false
            });
        });
    });
});
