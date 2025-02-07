import { DevRevCustomObjects } from '../code/src/services/devrev/custom_objects';
import { DevRevAPIClient } from '../code/src/services/devrev/client';
import { jest } from '@jest/globals';

jest.mock('../code/src/services/devrev/client');

describe('DevRevCustomObjects', () => {
    let customObjects: DevRevCustomObjects;
    let mockClient: jest.Mocked<DevRevAPIClient>;

    beforeEach(() => {
        mockClient = {
            post: jest.fn(),
        } as any;
        customObjects = new DevRevCustomObjects(mockClient);
    });

    describe('createRegistrationForm', () => {
        it('should create a registration form custom object', async () => {
            const mockData = {
                unique_key: 'event123_test@example.com',
                title: 'Registration: Test User - Test Event',
                custom_fields: {
                    contact_id: 'contact123',
                    registered_datetime: '2025-02-07T00:00:00Z',
                    utm_source: 'linkedin',
                    airmeet_name: 'Test Event',
                    airmeet_id: 'event123'
                }
            };

            const mockResponse = {
                data: {
                    custom_object: {
                        id: 'custom123',
                        ...mockData
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await customObjects.createRegistrationForm(mockData);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.create', {
                leaf_type: 'airmeet_registration',
                ...mockData
            });
            expect(result).toEqual(mockResponse.data.custom_object);
        });
    });

    describe('createEngagement', () => {
        it('should create an engagement custom object', async () => {
            const mockData = {
                unique_key: 'event123_test@example.com_engagement',
                title: 'Engagement: Test User - Test Event',
                custom_fields: {
                    contact_id: 'contact123',
                    airmeet_id: 'event123',
                    airmeet_name: 'Test Event',
                    registration_link: 'https://example.com',
                    registration_time: '2025-02-07T00:00:00Z',
                    event_start_date: '2025-02-07T01:00:00Z',
                    event_end_date: '2025-02-07T02:00:00Z',
                    intent_signals: {
                        entered_event: true,
                        clicked_cta: false
                    }
                }
            };

            const mockResponse = {
                data: {
                    custom_object: {
                        id: 'custom123',
                        ...mockData
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await customObjects.createEngagement(mockData);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.create', {
                leaf_type: 'airmeet_engagement',
                ...mockData
            });
            expect(result).toEqual(mockResponse.data.custom_object);
        });
    });

    describe('getRegistrationForm', () => {
        it('should fetch a registration form by unique key', async () => {
            const uniqueKey = 'event123_test@example.com';
            const mockResponse = {
                data: {
                    custom_objects: [{
                        id: 'custom123',
                        unique_key: uniqueKey,
                        leaf_type: 'airmeet_registration'
                    }]
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await customObjects.getRegistrationForm(uniqueKey);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.list', {
                leaf_type: 'airmeet_registration',
                filters: { unique_key: uniqueKey }
            });
            expect(result).toEqual(mockResponse.data.custom_objects[0]);
        });
    });

    describe('getEngagement', () => {
        it('should fetch an engagement record by unique key', async () => {
            const uniqueKey = 'event123_test@example.com_engagement';
            const mockResponse = {
                data: {
                    custom_objects: [{
                        id: 'custom123',
                        unique_key: uniqueKey,
                        leaf_type: 'airmeet_engagement'
                    }]
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await customObjects.getEngagement(uniqueKey);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.list', {
                leaf_type: 'airmeet_engagement',
                filters: { unique_key: uniqueKey }
            });
            expect(result).toEqual(mockResponse.data.custom_objects[0]);
        });
    });
});
