import { Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { LeaderboardService } from "../../services/session/leaderboard-service";

/* =========================
* LEADERBOARD CONTROLLER
========================= */
export class LeaderboardController {
    static async getSessionLeaderboard(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);

            const result = await LeaderboardService.getLeaderboard(userId, sessionId);

            res.status(200).json({
                data: result
            });
        } catch (e) {
            next(e);
        }
    }
}