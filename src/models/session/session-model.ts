import { Session } from "../../../generated/prisma";

/* =========================
* SESSION INTERFACES
========================= */
export interface SessionResponse {
    id: string;
    creatorId: string;
    title: string;
    description: string | null;
    mode: string;
    status: string;
    visibility: string;
    maxParticipants: number;
    stepTarget: number;
    startTime: Date;
    endTime: Date;
    startLat: string | null;
    startLong: string | null;
}

export interface CreateSessionRequest {
    title: string;
    description?: string;
    mode: "SOLO" | "REMOTE";
    visibility: "PUBLIC" | "FRIENDONLY" | "INVITEONLY";
    maxParticipants: number;
    stepTarget: number;
    startTime: Date;
    endTime: Date;
    startLat?: number;
    startLong?: number;
}

/* =========================
* SESSION MAPPERS
========================= */
export function toSessionResponse(session: Session): SessionResponse {
    return {
        id: session.id.toString(),
        creatorId: session.creatorId.toString(),
        title: session.title,
        description: session.description,
        mode: session.mode,
        status: session.status,
        visibility: session.visibility,
        maxParticipants: session.maxParticipants,
        stepTarget: session.stepTarget,
        startTime: session.startTime,
        endTime: session.endTime,
        startLat: session.startLat?.toString() ?? null,
        startLong: session.startLong?.toString() ?? null,
    };
}