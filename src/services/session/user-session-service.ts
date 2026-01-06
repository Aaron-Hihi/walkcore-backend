import { prismaClient } from "../../utils/database-util";
import { SessionStatus, ParticipantStatus } from "../../../generated/prisma";
import { UserSessionResponse, toUserSessionResponse } from "../../models/session/user-session-model";

/* =========================
* USER SESSION SERVICE
========================= */
export class UserSessionService {
    static async getMySessions(userId: bigint): Promise<UserSessionResponse[]> {
        const participations = await prismaClient.sessionParticipant.findMany({
            where: {
                userId: userId
            },
            include: {
                session: true
            },
            orderBy: {
                session: {
                    startTime: 'desc'
                }
            }
        });

        return participations.map(toUserSessionResponse);
    }

    static async getMyActiveSession(userId: bigint): Promise<UserSessionResponse | null> {
        const activeParticipation = await prismaClient.sessionParticipant.findFirst({
            where: {
                userId: userId,
                status: ParticipantStatus.JOINED,
                session: {
                    status: SessionStatus.ONGOING
                }
            },
            include: {
                session: true
            }
        });

        if (!activeParticipation) {
            return null;
        }

        return toUserSessionResponse(activeParticipation);
    }
}