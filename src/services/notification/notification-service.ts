import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { NotificationType } from "../../../generated/prisma/client";

/* =========================
* NOTIFICATION SERVICE
========================= */
export class NotificationService {
    static async create(userId: bigint, title: string, message: string, type: NotificationType) {
        return await prismaClient.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    }

    static async getMyNotifications(userId: bigint) {
        const notifications = await prismaClient.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return notifications.map(n => ({
            id: n.id.toString(),
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            createdAt: n.createdAt
        }));
    }

    static async markAsRead(userId: bigint, notificationId: bigint) {
        const notification = await prismaClient.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification || notification.userId !== userId) {
            throw new ResponseError(404, "Notification not found or access denied");
        }

        return await prismaClient.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    }

    static async deleteOldNotifications(userId: bigint) {
        return await prismaClient.notification.deleteMany({
            where: {
                userId,
                isRead: true,
                createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        });
    }
}