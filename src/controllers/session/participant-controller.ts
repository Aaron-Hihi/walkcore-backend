import { Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { ParticipantService } from "../../services/session/participant-service";

/* =========================
* PARTICIPANT CONTROLLER
========================= */
export class ParticipantController {
    static async getParticipants(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);

            const result = await ParticipantService.getParticipants(userId, sessionId);

            res.status(200).json({
                data: result
            });
        } catch (e) {
            next(e);
        }
    }

    /* Logic joinSession, editStatus, addStep tetap di sini tanpa Prisma Client */
    static async joinSession(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);
            const result = await ParticipantService.joinSession(userId, sessionId);
            res.status(201).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    static async editParticipantStatus(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);
            const result = await ParticipantService.editStatus(userId, sessionId, req.body.status);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    static async addStep(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);
            const result = await ParticipantService.addStep(userId, sessionId, Number(req.body.steps));
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }
}