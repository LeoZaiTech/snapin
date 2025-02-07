import axios, { AxiosInstance } from 'axios';
import { AirmeetAttendee, AirmeetEvent, AirmeetSessionAttendance, AirmeetBoothActivity } from './types';

export class AirmeetService {
    private client: AxiosInstance;
    private readonly baseUrl: string;
    private readonly communityId: string;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor(
        private readonly apiKey: string,
        private readonly secretKey: string,
        baseUrl: string,
        communityId: string
    ) {
        this.baseUrl = baseUrl;
        this.communityId = communityId;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor to handle token expiration
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token might be expired, try to refresh it
                    await this.authenticate();
                    // Retry the original request
                    const config = error.config;
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                    return this.client(config);
                }
                return Promise.reject(error);
            }
        );
    }

    private async authenticate(): Promise<void> {
        try {
            // Create a new axios instance for auth to avoid the base URL
            const authUrl = 'https://api-gateway-prod.us.airmeet.com/auth';
            console.log('Authenticating with Airmeet at:', authUrl);

            const response = await axios.post(authUrl, {}, {
                headers: {
                    'X-Airmeet-Access-Key': this.apiKey,
                    'X-Airmeet-Secret-Key': this.secretKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Auth response:', response.data);

            if (response.data?.data?.token) {
                this.accessToken = response.data.data.token;
                // Set token expiry to 1 hour before actual expiry to be safe
                this.tokenExpiry = Date.now() + (29 * 24 * 60 * 60 * 1000); // 29 days (tokens are valid for 30 days)
                
                // Update client headers with new token
                this.client.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
                console.log('Successfully authenticated with Airmeet');
            } else {
                throw new Error('Failed to get authentication token');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }

    private async ensureAuthenticated(): Promise<void> {
        if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
            await this.authenticate();
        }
    }

    async listEvents(): Promise<AirmeetEvent[]> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get(`/v2/community/${this.communityId}/events`);
            return response.data.events;
        } catch (error) {
            console.error('Error listing events:', error);
            throw error;
        }
    }

    async getEvent(eventId: string): Promise<AirmeetEvent> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get(`/v2/community/${this.communityId}/events/${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }

    async getEventAttendees(eventId: string): Promise<AirmeetAttendee[]> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get(`/v2/community/${this.communityId}/events/${eventId}/attendees`);
            return response.data.attendees;
        } catch (error) {
            console.error('Error fetching attendees:', error);
            throw error;
        }
    }

    async getSessionAttendance(eventId: string, sessionId: string): Promise<AirmeetSessionAttendance[]> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get(`/v2/community/${this.communityId}/events/${eventId}/sessions/${sessionId}/attendance`);
            return response.data.attendance;
        } catch (error) {
            console.error('Error fetching session attendance:', error);
            throw error;
        }
    }

    async getBoothActivity(eventId: string): Promise<AirmeetBoothActivity[]> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get(`/v2/community/${this.communityId}/events/${eventId}/booth-activities`);
            return response.data.activities;
        } catch (error) {
            console.error('Error fetching booth activities:', error);
            throw error;
        }
    }

    // Helper method to get all attendance data for an event
    async getAllEventData(eventId: string) {
        try {
            const [event, attendees] = await Promise.all([
                this.getEvent(eventId),
                this.getEventAttendees(eventId)
            ]);

            // Get attendance for each session
            const sessionAttendance = await Promise.all(
                event.sessions.map(session => 
                    this.getSessionAttendance(eventId, session.id)
                )
            );

            const boothActivity = await this.getBoothActivity(eventId);

            return {
                event,
                attendees,
                sessionAttendance: sessionAttendance.flat(),
                boothActivity
            };
        } catch (error) {
            console.error('Error fetching all event data:', error);
            throw error;
        }
    }
}
