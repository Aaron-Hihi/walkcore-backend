import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { FitnessUtil } from "../../utils/fitness-util";
import { UserDailyActivity } from "../../../generated/prisma/client";

export class userDailyActivityService {
    // Synchronizes step data with anti-cheat and biometric-based calculations
    static async syncSteps(userPayload: any, newSteps: number): Promise<UserDailyActivity> {
        const userId = BigInt(userPayload.id);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { weight: true, height: true, gender: true, totalSteps: true }
        });

        if (!user || !user.weight || !user.height) {
            throw new ResponseError(400, "User profile biometrics are incomplete");
        }

        const activity = await prismaClient.userDailyActivity.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        const lastActivityAt = activity?.updatedAt || new Date();
        const now = new Date();

        if (activity && newSteps > activity.stepsWalked) {
            const stepDiff = newSteps - activity.stepsWalked;
            const timeDiffMinutes = Math.max(1, (now.getTime() - lastActivityAt.getTime()) / (1000 * 60));
            const maxReasonableSteps = timeDiffMinutes * 250;

            if (stepDiff > maxReasonableSteps) {
                throw new ResponseError(400, "Unnatural step activity detected");
            }
        }

        const weight = Number(user.weight);
        const height = Number(user.height);
        const strideMeters = FitnessUtil.calculateStrideLength(height, user.gender);
        const totalDistance = Math.round(newSteps * strideMeters * 100) / 100;
        const calories = Math.round(FitnessUtil.calculateCalories(newSteps, weight, height, user.gender));

        return await prismaClient.$transaction(async (tx) => {
            const updatedActivity = await tx.userDailyActivity.upsert({
                where: { userId_date: { userId, date: today } },
                create: {
                    userId,
                    date: today,
                    stepsWalked: newSteps,
                    distance: totalDistance,
                    activeTime: Math.floor(newSteps / 100),
                    caloriesBurned: calories
                },
                update: {
                    stepsWalked: newSteps,
                    distance: totalDistance,
                    caloriesBurned: calories
                }
            });

            const stepIncrement = BigInt(Math.max(0, newSteps - (activity?.stepsWalked || 0)));
            const calorieIncrement = Math.max(0, calories - (activity?.caloriesBurned || 0));
            
            await tx.user.update({
                where: { id: userId },
                data: {
                    totalSteps: { increment: stepIncrement },
                    totalDistance: { increment: Number(stepIncrement) * strideMeters },
                    totalCaloriesBurned: { increment: calorieIncrement }
                }
            });

            return updatedActivity;
        });
    }

    // Retrieves user daily activity for a specific date
    static async getActivityOn(userId: bigint, date: Date): Promise<UserDailyActivity | null> {
        return await prismaClient.userDailyActivity.findUnique({
            where: { userId_date: { userId, date } }
        });
    }

    // Retrieves user daily activities within a date range
    static async getActivitiesRange(userId: bigint, from: Date, to: Date): Promise<UserDailyActivity[]> {
        return await prismaClient.userDailyActivity.findMany({
            where: {
                userId,
                date: {
                    gte: from,
                    lte: to
                }
            },
            orderBy: { date: "asc" }
        });
    }
}