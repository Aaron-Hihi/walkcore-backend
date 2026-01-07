import { UserJWTPayload } from "../../models/user/user-model";
import {
    toUserAchievementResponse,
    toUserAchievementResponseList,
    UserAchievementCreateUpdateRequest,
    UserAchievementResponse,
} from "../../models/achievement/userAchievement-model";
import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { UserAchievementValidation } from "../../validations/achievement/userAchievement-validation";
import { Validation } from "../../validations/validation";
import { RequirementType, UserAchievement } from "../../../generated/prisma";

/* =========================
* USER ACHIEVEMENT SERVICE
========================= */
export class UserAchievementService {
    static async getAllUserAchievements(user: UserJWTPayload): Promise<UserAchievementResponse[]> {
        const data = await prismaClient.userAchievement.findMany({
            where: { userId: BigInt(user.id) },
            include: { achievement: true }
        });

        return data.map(ua => ({
            id: ua.id,
            achievementId: ua.achievementId,
            title: ua.achievement.title,
            description: ua.achievement.description,
            progress: ua.progress,
            isCompleted: ua.isCompleted,
            completedAt: ua.completedAt
        }));
    }

    static async getUserAchievement(user: UserJWTPayload, id: number): Promise<UserAchievementResponse> {
        const ua = await prismaClient.userAchievement.findFirst({
            where: { id: id, userId: BigInt(user.id) },
            include: { achievement: true }
        });

        if (!ua) throw new ResponseError(404, "Achievement record not found");

        return {
            id: ua.id,
            achievementId: ua.achievementId,
            title: ua.achievement.title,
            description: ua.achievement.description,
            progress: ua.progress,
            isCompleted: ua.isCompleted,
            completedAt: ua.completedAt
        };
    }
    static async createUserAchievement(
        user: UserJWTPayload,
        achievementId: number,
        reqData: UserAchievementCreateUpdateRequest
    ): Promise<string> {
        const validatedData = Validation.validate(
            UserAchievementValidation.CREATE_UPDATE,
            reqData
        );

        const userId = BigInt(user.id);

        await prismaClient.userAchievement.create({
            data: {
                achievementId: achievementId,
                completedAt: validatedData.completedAt,
                isCompleted: validatedData.isCompleted,
                userId: userId,
            },
        });

        return "User Achievement has been created successfully";
    }

    static async updateUserAchievement(
        user: UserJWTPayload, 
        req: UserAchievementCreateUpdateRequest, 
        userAchievementListId: number
    ): Promise<string> {
        const validatedData = Validation.validate(
            UserAchievementValidation.CREATE_UPDATE,
            req
        );
        
        const userId = BigInt(user.id);
        
        await this.checkUserAchievementExists(userId, userAchievementListId);

        await prismaClient.userAchievement.update({
            where: {
                id: userAchievementListId,
            },
            data: {
                completedAt: validatedData.completedAt,
                isCompleted: validatedData.isCompleted,
            },
        });

        return "UserAchievement has been updated successfully";
    }

    static async deleteUserAchievement(
        user: UserJWTPayload, 
        userAchievementListId: number
    ): Promise<string> {
        const userId = BigInt(user.id);
        
        await this.checkUserAchievementExists(userId, userAchievementListId);

        await prismaClient.userAchievement.delete({
            where: {
                id: userAchievementListId,
            }
        });

        return "User Achievement has been deleted successfully";
    }

    /* =========================
    * PRIVATE HELPER METHODS
    ========================= */
    private static async checkUserAchievementExists(
        userId: bigint,
        userAchievementListId: number,
    ): Promise<UserAchievement> {
        const userAchievement = await prismaClient.userAchievement.findFirst({
            where: {
                userId: userId,
                id: userAchievementListId,
            },
        });

        if (!userAchievement) {
            throw new ResponseError(404, "User Achievement does not exist");
        }

        return userAchievement;
    }

    static async checkAndUnlock(userId: bigint, type: RequirementType, currentValue: number, tx: any = prismaClient) {
        // Find all achievements that meet the requirement but are not completed by the user
        const eligibleAchievements = await tx.achievement.findMany({
            where: {
                requirementType: type,
                requirementValue: { lte: currentValue }
            }
        });

        for (const ach of eligibleAchievements) {
            // Check if user already completed this specific achievement
            const alreadyDone = await tx.userAchievement.findFirst({
                where: { userId, achievementId: ach.id, isCompleted: true }
            });

            if (!alreadyDone) {
                // Mark as completed and reward the user
                await tx.userAchievement.upsert({
                    where: { userId_achievementId: { userId, achievementId: ach.id } },
                    create: { 
                        userId, 
                        achievementId: ach.id, 
                        isCompleted: true, 
                        completedAt: new Date(),
                        progress: currentValue 
                    },
                    update: { 
                        isCompleted: true, 
                        completedAt: new Date(),
                        progress: currentValue
                    }
                });

                // Add currency reward to user balance
                await tx.user.update({
                    where: { id: userId },
                    data: { currency: { increment: ach.reward } }
                });
            }
        }
    }
}