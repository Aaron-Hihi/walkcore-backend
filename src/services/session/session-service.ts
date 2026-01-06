import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { CreateSessionRequest, SessionResponse, toSessionResponse } from "../../models/session/session-model";

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
                creator: true,
                participants: { where: { userId: userId } } 
            }
        });

        if (!session) throw new ResponseError(404, "Session not found");

        if (session.creatorId !== userId) {
            if (session.visibility === "FRIENDONLY") {
                const isFriend = await prismaClient.friendship.findFirst({
                    where: {
                        friendStatus: "ACCEPTED",
                        OR: [
                            { requesterId: userId, addresseeId: session.creatorId },
                            { requesterId: session.creatorId, addresseeId: userId }
                        ]
                    }
                });
                if (!isFriend) throw new ResponseError(403, "Access denied: Friends only");
            }

            if (session.visibility === "INVITEONLY") {
                if (session.participants.length === 0) {
                    throw new ResponseError(403, "Access denied: Invite only");
                }
            }
        }

        return toSessionResponse(session);
    }

    static async update(userId: bigint, sessionId: bigint, request: any): Promise<SessionResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) throw new ResponseError(404, "Session not found");
        if (session.creatorId !== userId) throw new ResponseError(403, "Forbidden");

        const updateData: any = {};

        if (session.status === "PLANNED") {
            Object.assign(updateData, request);
        } else if (session.status === "ONGOING") {
            if (request.status !== "FINISHED") {
                throw new ResponseError(400, "Ongoing session can only be set to FINISHED");
            }
            updateData.status = "FINISHED";
        } else {
            throw new ResponseError(400, "Cannot modify FINISHED or CANCELLED session");
        }

        const updatedSession = await prismaClient.session.update({
            where: { id: sessionId },
            data: updateData
        });

        return toSessionResponse(updatedSession);
    }
}