import { AirmeetService } from '../src/services/airmeet/airmeet.service';
import util from 'util';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

describe('AirmeetService', () => {
    let airmeetService: AirmeetService;
    const testEventId = process.env['AIRMEET_TEST_EVENT_ID'] || 'test-event-id';

    beforeAll(() => {
        const apiKey = process.env['AIRMEET_API_KEY'];
        const secretKey = process.env['AIRMEET_SECRET_KEY'];
        const baseUrl = process.env['AIRMEET_BASE_URL'];
        const communityId = process.env['AIRMEET_COMMUNITY_ID'];

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
            console.log('First attendee:', util.inspect(attendees[0], { depth: 2 }));
            expect(Array.isArray(attendees)).toBe(true);
        } catch (error) {
            console.error('Error in test:', error);
            throw error;
        }
    });

    it('should fetch all event data', async () => {
        try {
            const allData = await airmeetService.getAllEventData(testEventId);
            console.log('Event summary:', util.inspect({
                eventName: allData.event.name,
                attendeeCount: allData.attendees.length,
                sessionCount: allData.event.sessions.length,
                boothActivityCount: allData.boothActivity.length
            }, { depth: 2 }));
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
