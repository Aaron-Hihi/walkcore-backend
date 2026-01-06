import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { ParticipantStatus, Visibility } from "../../../generated/prisma/client";
import { SessionLeaderboardResponse } from "../../models/session/leaderboard-model";

/* =========================
* LEADERBOARD SERVICE
========================= */
export class LeaderboardService {
    static async getLeaderboard(userId: bigint, sessionId: bigint): Promise<SessionLeaderboardResponse> {
        const session = await prismaClient.session.findUnique({
            where: { id: sessionId },
            include: { 
                participants: {
                    where: { userId: userId }
                }
            }
        });

        if (!session) {
            throw new ResponseError(404, "Session not found");
        }

        const isParticipant = session.participants.length > 0;
        if (!isParticipant) {
            throw new ResponseError(403, "Only participants can view the leaderboard");
        }

        const allParticipants = await prismaClient.sessionParticipant.findMany({
            where: {
                sessionId: sessionId,
                status: { in: [ParticipantStatus.JOINED, ParticipantStatus.FINISHED] }
            },
            include: {
                user: {
                    select: { username: true }
                }
            },
            orderBy: {
                totalSteps: "desc"
            }
        });

        const leaderboard = allParticipants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId.toString(),
            username: p.user.username,
            totalSteps: p.totalSteps || 0,
            approxDistance: p.approxDistance?.toString() || "0",
            caloriesBurned: p.caloriesBurned || 0
        }));

        return {
            sessionId: sessionId.toString(),
            leaderboard
        };
    }
}