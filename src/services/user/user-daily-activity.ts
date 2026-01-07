// src/services/user/user-daily-activity.ts

import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { FitnessUtil } from "../../utils/fitness-util";
import { UserDailyActivity } from "../../../generated/prisma/client";

// Activity service logic for syncing and retrieving daily health data
export class userDailyActivityService {

    // Synchronizes steps
    static async syncSteps(userPayload: any, stepsToAdd: number, syncDate: Date, manualCalories?: number): Promise<any> {
        const userId = BigInt(userPayload.id);
        const targetDate = new Date(syncDate);
        targetDate.setUTCHours(0, 0, 0, 0);

        // Retrieve user biometrics for calorie calculation
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { weight: true, height: true, gender: true, totalSteps: true }
        });

        if (!user || user.weight === null || user.height === null) {
            throw new ResponseError(400, "User profile biometrics are incomplete");
        }

        const activity = await prismaClient.userDailyActivity.findUnique({
            where: { userId_date: { userId, date: targetDate } }
        });

        // Logic Anti-cheat
        if (activity) {
            const lastUpdate = new Date(activity.updatedAt).getTime();
            const now = new Date().getTime();
            const timeDiffMinutes = (now - lastUpdate) / 60000;

            const maxAllowedSteps = 5000 + (timeDiffMinutes * 250);

            if (stepsToAdd > maxAllowedSteps) {
                throw new ResponseError(400, "Unnatural step activity detected");
            }
        }

        const stride = FitnessUtil.calculateStrideLength(Number(user.height), user.gender);
        const cal = manualCalories ?? Math.round(FitnessUtil.calculateCalories(stepsToAdd, Number(user.weight), Number(user.height), user.gender));

        return await prismaClient.$transaction(async (tx) => {
            const updated = await tx.userDailyActivity.upsert({
                where: { userId_date: { userId, date: targetDate } },
                create: {
                    userId, 
                    date: targetDate, 
                    stepsWalked: stepsToAdd,
                    distance: Math.round(stepsToAdd * stride * 100) / 100,
                    caloriesBurned: cal, 
                    activeTime: Math.floor(stepsToAdd / 100)
                },
                update: {
                    stepsWalked: { increment: stepsToAdd },
                    distance: { increment: Math.round(stepsToAdd * stride * 100) / 100 },
                    caloriesBurned: { increment: cal },
                    activeTime: { increment: Math.floor(stepsToAdd / 100) }
                }
            });

            // Update user global stats
            await tx.user.update({
                where: { id: userId },
                data: {
                    totalSteps: { increment: BigInt(stepsToAdd) },
                    totalDistance: { increment: stepsToAdd * stride },
                    totalCaloriesBurned: { increment: cal }
                }
            });

            // Return with mapped stepsWalked for test compatibility
            return {
                ...updated,
                stepsWalked: Number(updated.stepsWalked)
            };
        });
    }

    // Retrieves activity for a specific date
    static async getActivityOn(userId: bigint, date: Date): Promise<UserDailyActivity | null> {
        return await prismaClient.userDailyActivity.findUnique({ where: { userId_date: { userId, date } } });
    }

    // Retrieves activities within a date range
    static async getActivitiesRange(userId: bigint, from: Date, to: Date): Promise<UserDailyActivity[]> {
        return await prismaClient.userDailyActivity.findMany({
            where: { userId, date: { gte: from, lte: to } },
            orderBy: { date: "asc" }
        });
    }
}