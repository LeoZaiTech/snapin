export interface AirmeetAttendee {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    city?: string;
    country?: string;
    jobTitle?: string;
    company?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

export interface AirmeetEventSession {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
}

export interface AirmeetSessionAttendance {
    attendeeId: string;
    sessionId: string;
    joinTime: string;
    leaveTime: string;
    timeSpent: number;
}

export interface AirmeetBoothActivity {
    attendeeId: string;
    boothId: string;
    activityType: 'visit' | 'download' | 'question';
    timestamp: string;
    details?: string;
}

export interface AirmeetEvent {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    timezone: string;
    sessions: AirmeetEventSession[];
}
