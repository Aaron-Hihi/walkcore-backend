import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { ParticipantStatus, SessionStatus } from "../../../generated/prisma/client";
import { ParticipantResponse, toParticipantResponse, AddStepRequest } from "../../models/session/participant-model";
import { Validation } from "../../validations/validation";
import { ParticipantValidation } from "../../validations/session/participant-validation";

/* =========================
* PARTICIPANT SERVICE
========================= */
export class ParticipantService {
    static async joinSession(userId: bigint, sessionId: bigint): Promise<ParticipantResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId },
            include: { participants: true }
        });

        if (!session) throw new ResponseError(404, "Session not found");
        
        if (session.status !== SessionStatus.PLANNED && session.status !== SessionStatus.ONGOING) {
            throw new ResponseError(400, "Cannot join session in current status");
        }
        
        if (session.participants.length >= session.maxParticipants) {
            throw new ResponseError(400, "Session is full");
        }

        const conflict = await prismaClient.sessionParticipant.findFirst({
            where: {
                userId,
                status: ParticipantStatus.JOINED,
                session: {
                    status: { in: [SessionStatus.PLANNED, SessionStatus.ONGOING] },
                    NOT: {
                        OR: [
                            { endTime: { lte: session.startTime } },
                            { startTime: { gte: session.endTime } }
                        ]
                    }
                }
            }
        });

        if (conflict) throw new ResponseError(400, "Schedule conflict with another joined session");

        const participant = await prismaClient.sessionParticipant.upsert({
            where: { sessionId_userId: { sessionId, userId } },
            update: { status: ParticipantStatus.JOINED, leaveTime: null },
            create: {
                sessionId,
                userId,
                status: ParticipantStatus.JOINED,
                isAdmin: false,
                totalSteps: 0
            }
        });

        return toParticipantResponse(participant);
    }

    static async addStep(userId: bigint, sessionId: bigint, steps: number): Promise<ParticipantResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) throw new ResponseError(404, "Session not found");
        if (session.status !== SessionStatus.ONGOING) {
            throw new ResponseError(400, "Steps can only be added to an ongoing session");
        }

        const participant = await prismaClient.sessionParticipant.findUnique({
            where: { sessionId_userId: { sessionId, userId } }
        });

        if (!participant || participant.status !== ParticipantStatus.JOINED) {
            throw new ResponseError(403, "You are not an active participant in this session");
        }

        const updatedParticipant = await prismaClient.sessionParticipant.update({
            where: { id: participant.id },
            data: { 
                totalSteps: { increment: steps } 
            }
        });

        return toParticipantResponse(updatedParticipant);
    }

    static async editStatus(userId: bigint, sessionId: bigint, status: ParticipantStatus): Promise<ParticipantResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) throw new ResponseError(404, "Session not found");
        
        if (session.status === SessionStatus.FINISHED || session.status === SessionStatus.CANCELLED) {
            throw new ResponseError(400, "Cannot change status in a completed session");
        }

        const participant = await prismaClient.sessionParticipant.findUnique({
            where: { sessionId_userId: { sessionId, userId } }
        });

        if (!participant) throw new ResponseError(404, "Participant record not found");

        const updatedParticipant = await prismaClient.sessionParticipant.update({
            where: { id: participant.id },
            data: { 
                status: status,
                leaveTime: status === ParticipantStatus.LEFT ? new Date() : null
            }
        });

        return toParticipantResponse(updatedParticipant);
    }

    static async getParticipants(userId: bigint, sessionId: bigint) {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId },
            include: {
                participants: {
                    include: {
                        user: { select: { username: true, email: true } }
                    }
                }
            }
        });

        if (!session) {
            throw new ResponseError(404, "Session not found");
        }

        if (session.visibility === "INVITEONLY") {
            const isMember = session.participants.some(p => p.userId === userId);
            if (!isMember) {
                throw new ResponseError(403, "Access denied to invite-only session");
            }
        }

        return session.participants.map(p => ({
            userId: p.userId.toString(),
            username: p.user.username,
            status: p.status,
            isAdmin: p.isAdmin
        }));
    }
}