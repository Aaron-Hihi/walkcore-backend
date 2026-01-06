import { SessionParticipant, ParticipantStatus } from "../../../generated/prisma/client";

/* =========================
* PARTICIPANT INTERFACES
========================= */
export interface ParticipantResponse {
    id: string;
    sessionId: string;
    userId: string;
    status: ParticipantStatus;
    isAdmin: boolean;
    totalSteps: number;
    joinTime: Date;
    leaveTime: Date | null;
}

export interface AddStepRequest {
    steps: number;
}

/* =========================
* PARTICIPANT MAPPERS
========================= */
export function toParticipantResponse(p: SessionParticipant): ParticipantResponse {
    return {
        id: p.id.toString(),
        sessionId: p.sessionId.toString(),
        userId: p.userId.toString(),
        status: p.status,
        isAdmin: p.isAdmin,
        totalSteps: p.totalSteps || 0,
        joinTime: p.joinTime,
        leaveTime: p.leaveTime
    };
}

export function toParticipantResponseList(participants: SessionParticipant[]): ParticipantResponse[] {
    return participants.map(toParticipantResponse);
}