import { AirmeetService } from '../src/services/airmeet/airmeet.service';
import util from 'util';
import dotenv from 'dotenv';
import axios from 'axios';

jest.mock('axios', () => ({
    create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        interceptors: {
            response: {
                use: jest.fn()
            }
        },
        defaults: {
            headers: {
                common: {}
            }
        }
    }))
}));

dotenv.config({ path: './.env' });

describe('AirmeetService', () => {
    let airmeetService: AirmeetService;
    let mockAxiosInstance: any;
    const TEST_EVENT_ID = process.env['AIRMEET_TEST_EVENT_ID'] || 'test-event-id';
    const TEST_API_KEY = process.env['AIRMEET_API_KEY'] || 'test-api-key';
    const TEST_SECRET_KEY = process.env['AIRMEET_SECRET_KEY'] || 'test-secret-key';
    const TEST_BASE_URL = process.env['AIRMEET_BASE_URL'] || 'test-base-url';
    const TEST_COMMUNITY_ID = process.env['AIRMEET_COMMUNITY_ID'] || 'test-community-id';
    const TEST_ATTENDEE = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
    };

    beforeEach(() => {
        const apiKey = process.env['AIRMEET_API_KEY'];
        const secretKey = process.env['AIRMEET_SECRET_KEY'];
        const baseUrl = process.env['AIRMEET_BASE_URL'];
        const communityId = process.env['AIRMEET_COMMUNITY_ID'];

        if (!apiKey || !secretKey || !baseUrl || !communityId) {
            throw new Error('Airmeet configuration not found in environment variables');
        }

        airmeetService = new AirmeetService(apiKey, secretKey, baseUrl, communityId);
        mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value;
        
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Setup default successful responses
        mockAxiosInstance.post.mockResolvedValue({
            data: {
                token: 'mock-token',
                expiresIn: 3600
            }
        });
        
        mockAxiosInstance.get.mockResolvedValue({
            data: {
                attendees: [TEST_ATTENDEE]
            }
        });
    });

    it('should authenticate and get events', async () => {
        const events = await airmeetService.getEventAttendees(TEST_EVENT_ID);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
            '/v2/auth/token',
            {},
            expect.objectContaining({
                headers: {
                    'X-Airmeet-Access-Key': TEST_API_KEY,
                    'X-Airmeet-Secret-Key': TEST_SECRET_KEY
                }
            })
        );
        expect(events).toEqual([TEST_ATTENDEE]);
    });

    it('should handle authentication error', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(new Error('Auth failed'));
        
        await expect(airmeetService.getEventAttendees(TEST_EVENT_ID))
            .rejects
            .toThrow('Auth failed');
    });

    it('should handle attendee fetch error', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
            data: {
                token: 'mock-token',
                expiresIn: 3600
            }
        });
        mockAxiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));
        
        await expect(airmeetService.getEventAttendees(TEST_EVENT_ID))
            .rejects
            .toThrow('Failed to fetch');
    });

    it('should fetch all event data successfully', async () => {
        const mockEvent = {
            id: TEST_EVENT_ID,
            name: 'Test Event',
            startDate: '2023-01-01',
            endDate: '2023-01-02',
            timezone: 'UTC',
            sessions: [{
                id: 'session-1',
                name: 'Test Session',
                startTime: '2023-01-01T10:00:00Z',
                endTime: '2023-01-01T11:00:00Z',
                duration: 3600
            }]
        };
        
        mockAxiosInstance.get
            .mockResolvedValueOnce({ data: { events: [mockEvent] } })
            .mockResolvedValueOnce({ data: { attendees: [TEST_ATTENDEE] } })
            .mockResolvedValueOnce({ data: { attendance: [] } })
            .mockResolvedValueOnce({ data: { activities: [] } });
        
        const allData = await airmeetService.getAllEventData(TEST_EVENT_ID);
        
        expect(allData.event).toEqual(mockEvent);
        expect(allData.attendees).toEqual([TEST_ATTENDEE]);
        expect(Array.isArray(allData.sessionAttendance)).toBe(true);
        expect(Array.isArray(allData.boothActivity)).toBe(true);
    });
});
