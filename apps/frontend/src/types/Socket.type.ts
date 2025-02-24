export enum QueueType {
    SPECIFIC = 'SPECIFIC_QUEUE',
    GENERAL = 'GENERAL_QUEUE'
}

export interface QueueEventType {
    type: QueueType;
    index?: number;
    queueId?: string;
    entryId?: string;
    status?: string;
    totalDoctors?: number;
    totalPatients?: number;
}

export interface SocketUpdatePayload {
    profileId: string
    socketId: string
}

export interface DoctorCallPatientEventType {
    threadId: string;
    callId: string;
    doctorId: string;
}