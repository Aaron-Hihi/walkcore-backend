import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { CreateSessionRequest, SessionResponse, toSessionResponse, UpdateSessionRequest } from "../../models/session/session-model";
import { ParticipantStatus, RequirementType, SessionStatus, Session } from "../../../generated/prisma";
import { UserAchievementService } from "../achievement/userAchievement-service";
import { Validation } from "../../validations/validation";
import { SessionValidation } from "../../validations/session/session-validation";

/* =========================
* SESSION BUSINESS LOGIC
========================= */
export class SessionService {
    static async create(userId: bigint, request: CreateSessionRequest): Promise<SessionResponse> {
        return await prismaClient.$transaction(async (tx) => {
            const newSession = await tx.session.create({
                data: {
                    ...request,
                    creatorId: userId,
                    status: "PLANNED",
                }
            });

            await tx.sessionParticipant.create({
                data: {
                    sessionId: newSession.id,
                    userId: userId,
                    status: "JOINED",
                    isAdmin: true,
                    joinTime: new Date()
                }
            });

            return toSessionResponse(newSession);
        });
    }

    static async getParticipants(userId: bigint, sessionId: bigint): Promise<any[]> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId },
            include: { participants: { include: { user: true } } }
        });

        if (!session) throw new ResponseError(404, "Session not found");

        if (session.visibility === "FRIENDONLY") {
            const isFriend = await prismaClient.friendship.findFirst({
                where: {
                    OR: [
                        { requesterId: userId, addresseeId: session.creatorId },
                        { requesterId: session.creatorId, addresseeId: userId }
                    ],
                    friendStatus: "ACCEPTED"
                }
            });
            if (!isFriend && session.creatorId !== userId) {
                throw new ResponseError(403, "Only friends can view participants of this session");
            }
        }

        return session.participants.map(p => ({
            id: p.id.toString(),
            userId: p.userId.toString(),
            username: p.user.username,
            totalSteps: p.totalSteps,
            status: p.status,
            isAdmin: p.isAdmin
        }));
    }

    static async getSessions(userId: bigint): Promise<SessionResponse[]> {
        const sessions = await prismaClient.session.findMany({
            where: {
                OR: [
                    { visibility: "PUBLIC" },
                    {
                        AND: [
                            { visibility: "FRIENDONLY" },
                            {
                                creator: {
                                    OR: [
                                        { receivedFriendRequests: { some: { requesterId: userId, friendStatus: "ACCEPTED" } } },
                                        { sentFriendRequests: { some: { addresseeId: userId, friendStatus: "ACCEPTED" } } }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        AND: [
                            { visibility: "INVITEONLY" },
                            { participants: { some: { userId: userId } } }
                        ]
                    }
                ]
            }
        });

        return sessions.map(toSessionResponse);
    }

    static async getById(userId: bigint, sessionId: bigint): Promise<SessionResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId },
            include: { 
                participants: {
                    select: { userId: true }
                } 
            }
        });

        if (!session) throw new ResponseError(404, "Session not found");

        if (session.visibility === "INVITEONLY") {
            const isParticipant = session.participants.some(p => p.userId === userId);
            const isCreator = session.creatorId === userId;
            if (!isParticipant && !isCreator) {
                throw new ResponseError(403, "This is a private invite-only session");
            }
        }

        return toSessionResponse(session);
    }

    static async update(userId: bigint, sessionId: bigint, request: UpdateSessionRequest): Promise<SessionResponse> {
        const session = await prismaClient.session.findUnique({ 
            where: { id: sessionId } 
        });

        if (!session) throw new ResponseError(404, "Session not found");
        if (session.creatorId !== userId) throw new ResponseError(403, "Access denied");

        const validatedData = Validation.validate(SessionValidation.UPDATE, request);
        
        const updateData: Partial<Session> = {};

        if (session.status === SessionStatus.PLANNED) {
            if (validatedData.title) updateData.title = validatedData.title;
            if (validatedData.description) updateData.description = validatedData.description;
            if (validatedData.visibility) updateData.visibility = validatedData.visibility;
            if (validatedData.status) updateData.status = validatedData.status;
        } else if (session.status === SessionStatus.ONGOING) {
            if (validatedData.status === SessionStatus.FINISHED || validatedData.status === SessionStatus.CANCELLED) {
                updateData.status = validatedData.status;
            } else {
                throw new ResponseError(400, "Ongoing session can only be FINISHED or CANCELLED");
            }
        }

        const updatedSession = await prismaClient.session.update({
            where: { id: sessionId },
            data: updateData
        });

        return toSessionResponse(updatedSession);
    }

    static async finishSessionAndDistributeRewards(sessionId: bigint): Promise<string> {
        return await prismaClient.$transaction(async (tx) => {
            const session = await tx.session.findUnique({
                where: { id: sessionId },
                include: { participants: { where: { status: ParticipantStatus.JOINED } } }
            });

            if (!session) throw new ResponseError(404, "Session not found");
            if (session.status !== SessionStatus.ONGOING) throw new ResponseError(400, "Only ongoing sessions can be finished");

            for (const participant of session.participants) {
                const steps = participant.totalSteps || 0;
                const reward = Math.floor(steps / 100);

                await tx.sessionParticipant.update({
                    where: { id: participant.id },
                    data: { 
                        status: ParticipantStatus.FINISHED,
                        currencyEarned: reward,
                        leaveTime: new Date()
                    }
                });

                const updatedUser = await tx.user.update({
                    where: { id: participant.userId },
                    data: { 
                        currency: { increment: reward },
                        totalSessionCount: { increment: 1 }
                    }
                });

                await UserAchievementService.checkAndUnlock(
                    participant.userId, 
                    RequirementType.TOTAL_SESSIONS, 
                    updatedUser.totalSessionCount
                );
            }

            await tx.session.update({
                where: { id: sessionId },
                data: { status: SessionStatus.FINISHED }
            });

            return "Session finished and rewards distributed successfully";
        });
    }
}