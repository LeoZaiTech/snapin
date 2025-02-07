import { AirmeetService } from '../code/src/services/airmeet/airmeet.service';
import dotenv from 'dotenv';

dotenv.config({ path: './code/.env' });

describe('AirmeetService Integration Tests', () => {
    let airmeetService: AirmeetService;

    beforeAll(() => {
        const apiKey = process.env.AIRMEET_API_KEY;
        const secretKey = process.env.AIRMEET_SECRET_KEY;
        const communityId = process.env.AIRMEET_COMMUNITY_ID;
        const baseUrl = 'https://api-gateway-prod.us.airmeet.com/prod';

        if (!apiKey || !secretKey || !communityId) {
            throw new Error('Airmeet configuration not found in environment variables');
        }

        console.log('Initializing AirmeetService with:');
        console.log('Base URL:', baseUrl);
        console.log('Community ID:', communityId);
        console.log('API Key:', apiKey);

        airmeetService = new AirmeetService(
            apiKey,
            secretKey,
            baseUrl,
            communityId
        );
    });

    it('should authenticate and list community events', async () => {
        try {
            // This will trigger authentication internally
            const events = await airmeetService.listEvents();
            console.log('API Response:', events);
            expect(events).toBeDefined();

            // If we get events, try to get attendees for the first event
            if (events && events.length > 0) {
                const eventId = events[0].id;
                console.log('Fetching attendees for event:', eventId);
                const attendees = await airmeetService.getEventAttendees(eventId);
                console.log('Attendees:', attendees);
                expect(attendees).toBeDefined();
            }
        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }, 10000); // Increase timeout to 10 seconds
});
