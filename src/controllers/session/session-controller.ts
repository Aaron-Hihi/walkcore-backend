import { Request, Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { Validation } from "../../validations/validation";
import { SessionValidation } from "../../validations/session/session-validation";
import { SessionService } from "../../services/session/session-service";

/* =========================
* SESSION HANDLERS
========================= */
export class SessionController {
    static async createSession(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const request = Validation.validate(SessionValidation.CREATE, req.body);

            const response = await SessionService.create(userId, request);
            res.status(201).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    static async getSessions(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const response = await SessionService.getSessions(userId);
            res.status(200).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    static async getSessionDetail(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);
            const response = await SessionService.getById(userId, sessionId);
            res.status(200).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    static async updateSession(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const sessionId = BigInt(req.params.sessionId);
            const request = Validation.validate(SessionValidation.UPDATE, req.body);

            const response = await SessionService.update(userId, sessionId, request);
            res.status(200).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    /* =========================
    * SESSION COMPLETION
    ========================= */
    static async finishSession(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const sessionId = BigInt(req.params.sessionId);
            const userId = BigInt(req.user!.id);
            
            const result = await SessionService.finish(userId, sessionId);
            
            res.status(200).json({
                message: "Session finished successfully",
                data: result
            });
        } catch (e) {
            next(e);
        }
    }
}