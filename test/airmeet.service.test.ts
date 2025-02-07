import { AirmeetService } from '../code/src/services/airmeet/airmeet.service';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

describe('AirmeetService', () => {
    let airmeetService: AirmeetService;

    beforeAll(() => {
        const apiKey = process.env.AIRMEET_API_KEY;
        const secretKey = process.env.AIRMEET_SECRET_KEY;
        const baseUrl = process.env.AIRMEET_BASE_URL;
        const communityId = process.env.AIRMEET_COMMUNITY_ID;

        if (!apiKey || !secretKey || !baseUrl || !communityId) {
            throw new Error('Airmeet configuration not found in environment variables');
        }

        airmeetService = new AirmeetService(apiKey, secretKey, baseUrl, communityId);
    });

    it('should authenticate and get events', async () => {
        try {
            // This will trigger authentication internally
            const events = await airmeetService.getEventAttendees('test-event-id');
            console.log('Got response from Airmeet API');
            expect(events).toBeDefined();
        } catch (error) {
            console.error('Error in test:', error);
            throw error;
        }
    });

    it('should fetch event attendees', async () => {
        try {
            const attendees = await airmeetService.getEventAttendees(testEventId);
            console.log('First attendee:', attendees[0]);
            expect(Array.isArray(attendees)).toBe(true);
        } catch (error) {
            console.error('Error in test:', error);
            throw error;
        }
    });

    it('should fetch all event data', async () => {
        try {
            const allData = await airmeetService.getAllEventData(testEventId);
            console.log('Event summary:', {
                eventName: allData.event.name,
                attendeeCount: allData.attendees.length,
                sessionCount: allData.event.sessions.length,
                boothActivityCount: allData.boothActivity.length
            });
            expect(allData.event).toBeDefined();
            expect(allData.attendees).toBeDefined();
            expect(allData.sessionAttendance).toBeDefined();
            expect(allData.boothActivity).toBeDefined();
        } catch (error) {
            console.error('Error in test:', error);
            throw error;
        }
    });
});
