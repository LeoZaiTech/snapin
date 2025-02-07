import { DevRevAPIClient } from '../code/src/services/devrev/client';
import { RegistrationSyncService, AirmeetRegistrationData } from '../code/src/services/devrev/registration_sync';
import { jest } from '@jest/globals';

describe('RegistrationSyncService', () => {
    let mockClient: jest.Mocked<DevRevAPIClient>;
    let registrationSync: RegistrationSyncService;

    beforeEach(() => {
        mockClient = {
            post: jest.fn(),
        } as any;

        registrationSync = new RegistrationSyncService(mockClient);
    });

    describe('syncRegistration', () => {
        it('should create a registration custom object with required fields', async () => {
            const registrationData: AirmeetRegistrationData = {
                contactId: 'contact123',
                registrationDateTime: '2025-02-06T04:39:22Z',
                airmeetName: 'Test Event',
                airmeetId: 'event123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            };

            const mockResponse = {
                data: {
                    custom_object: {
                        id: 'obj123',
                        unique_key: 'event123:john@example.com',
                        custom_fields: {
                            contact_id: 'contact123',
                            registered_datetime: '2025-02-06T04:39:22Z',
                            airmeet_name: 'Test Event',
                            airmeet_id: 'event123',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com',
                            attendance_type: 'VIRTUAL'
                        }
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await registrationSync.syncRegistration(registrationData);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.create', {
                leaf_type: 'airmeet_registration',
                unique_key: 'event123:john@example.com',
                title: 'Registration: John Doe - Test Event',
                custom_fields: {
                    contact_id: 'contact123',
                    registered_datetime: '2025-02-06T04:39:22Z',
                    airmeet_name: 'Test Event',
                    airmeet_id: 'event123',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    attendance_type: 'VIRTUAL'
                }
            });

            expect(result).toEqual(mockResponse.data.custom_object);
        });

        it('should include optional fields when provided', async () => {
            const registrationData: AirmeetRegistrationData = {
                contactId: 'contact123',
                registrationDateTime: '2025-02-06T04:39:22Z',
                airmeetName: 'Test Event',
                airmeetId: 'event123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                utmSource: 'linkedin',
                utmMedium: 'social',
                utmCampaign: 'spring2025',
                city: 'San Francisco',
                country: 'USA',
                designation: 'Engineer',
                organization: 'TechCo',
                attendanceType: 'IN-PERSON',
                customFields: [
                    { fieldId: 'field1', value: 'value1' },
                    { fieldId: 'field2', value: ['option1', 'option2'] }
                ]
            };

            const mockResponse = {
                data: {
                    custom_object: {
                        id: 'obj123',
                        unique_key: 'event123:john@example.com',
                        custom_fields: {
                            contact_id: 'contact123',
                            registered_datetime: '2025-02-06T04:39:22Z',
                            airmeet_name: 'Test Event',
                            airmeet_id: 'event123',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com',
                            utm_source: 'linkedin',
                            utm_medium: 'social',
                            utm_campaign: 'spring2025',
                            city: 'San Francisco',
                            country: 'USA',
                            designation: 'Engineer',
                            organization: 'TechCo',
                            attendance_type: 'IN-PERSON',
                            airmeet_custom_fields: {
                                field1: 'value1',
                                field2: ['option1', 'option2']
                            }
                        }
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await registrationSync.syncRegistration(registrationData);

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.create', {
                leaf_type: 'airmeet_registration',
                unique_key: 'event123:john@example.com',
                title: 'Registration: John Doe - Test Event',
                custom_fields: {
                    contact_id: 'contact123',
                    registered_datetime: '2025-02-06T04:39:22Z',
                    airmeet_name: 'Test Event',
                    airmeet_id: 'event123',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    utm_source: 'linkedin',
                    utm_medium: 'social',
                    utm_campaign: 'spring2025',
                    city: 'San Francisco',
                    country: 'USA',
                    designation: 'Engineer',
                    organization: 'TechCo',
                    attendance_type: 'IN-PERSON',
                    airmeet_custom_fields: {
                        field1: 'value1',
                        field2: ['option1', 'option2']
                    }
                }
            });

            expect(result).toEqual(mockResponse.data.custom_object);
        });
    });

    describe('getRegistration', () => {
        it('should retrieve an existing registration', async () => {
            const mockResponse = {
                data: {
                    custom_objects: [{
                        id: 'obj123',
                        unique_key: 'event123:john@example.com',
                        custom_fields: {
                            contact_id: 'contact123',
                            registered_datetime: '2025-02-06T04:39:22Z'
                        }
                    }]
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await registrationSync.getRegistration('event123', 'john@example.com');

            expect(mockClient.post).toHaveBeenCalledWith('/custom-objects.list', {
                leaf_type: 'airmeet_registration',
                filter: {
                    unique_key: ['event123:john@example.com']
                },
                limit: 1
            });

            expect(result).toEqual(mockResponse.data.custom_objects[0]);
        });

        it('should return undefined when registration not found', async () => {
            const mockResponse = {
                data: {
                    custom_objects: []
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };

            mockClient.post.mockResolvedValueOnce(mockResponse);

            const result = await registrationSync.getRegistration('event123', 'john@example.com');

            expect(result).toBeUndefined();
        });
    });
});
