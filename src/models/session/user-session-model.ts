import { SessionStatus, ParticipantStatus } from "../../../generated/prisma";

/* =========================
* USER SESSION INTERFACES
========================= */
export interface UserSessionResponse {
    sessionId: string;
    title: string;
    status: SessionStatus;
    participantStatus: ParticipantStatus;
    startTime: Date;
    endTime: Date;
    totalSteps: number;
}

/* =========================
* USER SESSION MAPPERS
========================= */
export function toUserSessionResponse(participant: any): UserSessionResponse {
    return {
        sessionId: participant.session.id.toString(),
        title: participant.session.title,
        status: participant.session.status,
        participantStatus: participant.status,
        startTime: participant.session.startTime,
        endTime: participant.session.endTime,
        totalSteps: participant.totalSteps || 0
    };
}