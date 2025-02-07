import { AirmeetService } from '../code/src/services/airmeet/airmeet.service';
import dotenv from 'dotenv';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

dotenv.config({ path: './code/.env' });

describe('AirmeetService', () => {
    let airmeetService: AirmeetService;
    const TEST_EVENT_ID = process.env.AIRMEET_TEST_EVENT_ID || 'test-event-id';

    beforeEach(() => {
        const apiKey = process.env.AIRMEET_API_KEY;
        const secretKey = process.env.AIRMEET_SECRET_KEY;
        const baseUrl = process.env.AIRMEET_BASE_URL;
        const communityId = process.env.AIRMEET_COMMUNITY_ID;

        if (!apiKey || !secretKey || !baseUrl || !communityId) {
            throw new Error('Airmeet configuration not found in environment variables');
        }

        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock responses
        const mockAxiosInstance = {
            post: jest.fn(),
            get: jest.fn(),
            interceptors: {
                response: {
                    use: jest.fn((successFn) => {
                        // Store the success handler for later use
                        mockAxiosInstance._successHandler = successFn;
                    })
                }
            },
            defaults: {
                headers: {
                    common: {}
                }
            },
            _successHandler: null
        };

        mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

        airmeetService = new AirmeetService(apiKey, secretKey, baseUrl, communityId);
    });

    it('should authenticate and get events', async () => {
        const mockAuthResponse = { data: { token: 'mock-token', expiresIn: 3600 } };
        const mockEventsResponse = { data: { attendees: [{ id: '1', name: 'Test User' }] } };

        const axiosInstance = mockedAxios.create();
        (axiosInstance.post as jest.Mock).mockResolvedValue(mockAuthResponse);
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockEventsResponse);

        const events = await airmeetService.getEventAttendees('test-event-id');
        
        expect(events).toBeDefined();
        expect(events).toEqual([{ id: '1', name: 'Test User' }]);
        expect(axiosInstance.post).toHaveBeenCalledWith('/v2/auth/token', {}, {
            headers: {
                'X-Airmeet-Access-Key': process.env.AIRMEET_API_KEY,
                'X-Airmeet-Secret-Key': process.env.AIRMEET_SECRET_KEY
            }
        });
        expect(axiosInstance.get).toHaveBeenCalledWith(`/v2/community/${process.env.AIRMEET_COMMUNITY_ID}/events/test-event-id/attendees`);
    });

    it('should fetch event attendees', async () => {
        const mockAuthResponse = { data: { token: 'mock-token', expiresIn: 3600 } };
        const mockAttendees = [{ id: '1', name: 'Test User 1' }, { id: '2', name: 'Test User 2' }];
        const mockAttendeesResponse = { data: { attendees: mockAttendees } };

        const axiosInstance = mockedAxios.create();
        (axiosInstance.post as jest.Mock).mockResolvedValue(mockAuthResponse);
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockAttendeesResponse);

        const attendees = await airmeetService.getEventAttendees(TEST_EVENT_ID);
        
        expect(attendees).toBeDefined();
        expect(Array.isArray(attendees)).toBe(true);
        expect(attendees).toEqual(mockAttendees);
        expect(axiosInstance.post).toHaveBeenCalledWith('/v2/auth/token', {}, {
            headers: {
                'X-Airmeet-Access-Key': process.env.AIRMEET_API_KEY,
                'X-Airmeet-Secret-Key': process.env.AIRMEET_SECRET_KEY
            }
        });
        expect(axiosInstance.get).toHaveBeenCalledWith(`/v2/community/${process.env.AIRMEET_COMMUNITY_ID}/events/${TEST_EVENT_ID}/attendees`);
    });

    it('should fetch all event data', async () => {
        const mockAuthResponse = { data: { token: 'mock-token', expiresIn: 3600 } };
        const mockEvent = {
            id: TEST_EVENT_ID,
            name: 'Test Event',
            sessions: [{ id: 'session1', title: 'Test Session' }]
        };
        const mockAttendees = [{ id: '1', name: 'Test User 1' }];
        const mockSessionAttendance = [{ sessionId: 'session1', attendeeId: '1' }];
        const mockBoothActivity = [{ id: 'booth1', name: 'Test Booth' }];

        const mockEventData = {
            event: mockEvent,
            attendees: mockAttendees,
            sessionAttendance: mockSessionAttendance,
            boothActivity: mockBoothActivity
        };

        const axiosInstance = mockedAxios.create();
        // Use mockResolvedValue instead of mockResolvedValueOnce for auth to handle parallel calls
        (axiosInstance.post as jest.Mock).mockResolvedValue(mockAuthResponse);
        
        // Setup the get responses in sequence
        const getMock = axiosInstance.get as jest.Mock;
        getMock
            .mockResolvedValueOnce({ data: mockEvent }) // getEvent returns data directly
            .mockResolvedValueOnce({ data: { attendees: mockAttendees } })
            .mockResolvedValueOnce({ data: { attendance: mockSessionAttendance } })
            .mockResolvedValueOnce({ data: { booth_activities: mockBoothActivity } });

        const allData = await airmeetService.getAllEventData(TEST_EVENT_ID);
        
        expect(allData.event).toBeDefined();
        expect(allData.attendees).toBeDefined();
        expect(allData.sessionAttendance).toBeDefined();
        expect(allData.boothActivity).toBeDefined();
        expect(allData).toEqual(mockEventData);
        expect(axiosInstance.post).toHaveBeenCalledWith('/v2/auth/token', {}, {
            headers: {
                'X-Airmeet-Access-Key': process.env.AIRMEET_API_KEY,
                'X-Airmeet-Secret-Key': process.env.AIRMEET_SECRET_KEY
            }
        });
    });
});
