import { UserJWTPayload } from "../models/user-model";
import { AchievementResponse } from "../models/achievement-model";
import {
    toUserAchievementResponse,
    toUserAchievementResponseList,
    UserAchievementCreateUpdateRequest,
    UserAchievementResponse,
} from "../models/userAchievement-model";
import { prismaClient } from "../utils/database-util";
import { PrismaClient, type User_Achievement } from "../../generated/prisma/client";
import { ResponseError } from "../error/response-error";
import { th } from "zod/v4/locales";
import { UserAchievementValidation } from "../validations/userAchievement-validation";
import { Validation } from "../validations/validation";

export class UserAchievementService {
    static async getAllUserAchievements(
        user: UserJWTPayload
    ): Promise<UserAchievementResponse[]> {
        const userId = Number(user.id);

        if (Number.isNaN(userId)) {
            throw new Error("Invalid user id in token");
        }
        const userAchievements = await prismaClient.user_Achievement.findMany({
            where: {
                userId: userId
            },
        });
        return toUserAchievementResponseList(userAchievements);
    }

    static async getUserAchievement(
        user: UserJWTPayload,
        userAchievementListId: number,
    ): Promise<UserAchievementResponse> {
        const userId = Number(user.id);

        if (Number.isNaN(userId)) {
            throw new Error("Invalid user id in token");
        }
        const userAchievement = await this.checkUserAchievementIsEmpty(userId, userAchievementListId);

        return toUserAchievementResponse(userAchievement);
    }

    static async checkUserAchievementIsEmpty(
        user_id: number,
        userAchievementListId: number,
    ): Promise<User_Achievement> {
        const userAchievement = await prismaClient.user_Achievement.findFirst({
            where: {
                userId: user_id,
                id: userAchievementListId,
            },
        });

        if (!userAchievement) {
            throw new ResponseError(400, "User Achievement does not exist");
        }
        return userAchievement;
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

        const userId = Number(user.id);
        if (!Number.isInteger(userId)) {
            throw new ResponseError(401, "Invalid user id in token");
        }
        await prismaClient.user_Achievement.create({
            data: {
                achievementId,
                completedAt: validatedData.completedAt,
                isCompleted: validatedData.isCompleted,
                userId: userId,
            },
        });
        return "User Achievement has been created successfully";
    }

    static async updateUserAchievement(user: UserJWTPayload, req: UserAchievementCreateUpdateRequest, userAchievementListId: number) {
        const validatedData = Validation.validate(
            UserAchievementValidation.CREATE_UPDATE,
            req
        )
         const userId = Number(user.id);
        if (!Number.isInteger(userId)) {
            throw new ResponseError(401, "Invalid user id in token");
        }
        await this.checkUserAchievementIsEmpty(userId, userAchievementListId)

        await prismaClient.user_Achievement.update({
            where:{
                id: userAchievementListId,
                },
                data:{
                completedAt: validatedData.completedAt,
                isCompleted: validatedData.isCompleted,
                },
        })
        return "UserAchievement has been updated successfully"   }

        static async deleteUserAchievement(user: UserJWTPayload, userAchievementListId: number) { 
             const userId = Number(user.id);
        if (!Number.isInteger(userId)) {
            throw new ResponseError(401, "Invalid user id in token");
        }
            await this.checkUserAchievementIsEmpty(userId, userAchievementListId);
            await prismaClient.user_Achievement.delete({    
                where:{
                id: userAchievementListId,
                }
            })
            return"User Achievement has been deleted successfully"
        }
    }
