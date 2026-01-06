import { Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { NotificationService } from "../../services/notification/notification-service";

/* =========================
* NOTIFICATION CONTROLLER
========================= */
export class NotificationController {
    static async getNotifications(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const result = await NotificationService.getMyNotifications(userId);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    static async markAsRead(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const notificationId = BigInt(req.params.id);
            await NotificationService.markAsRead(userId, notificationId);
            res.status(200).json({ data: "OK" });
        } catch (e) {
            next(e);
        }
    }
}