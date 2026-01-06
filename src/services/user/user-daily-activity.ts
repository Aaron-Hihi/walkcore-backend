import { ResponseError } from "../../error/response-error"
import { toUserDailyActivityResponse, UserDailyActivityResponse } from "../../models/user/daily-activity-model"
import { prismaClient } from "../../utils/database-util"

export class userDailyActivityService {
    
    // Get daily activity on a date from a user
    static async getActivityOn(
        currentUserId: bigint,
        date: Date
    ): Promise<UserDailyActivityResponse> {
        
        const userDailyActivity = await prismaClient.userDailyActivity.findFirst({
            where: { userId: currentUserId, date: date }
        })

        // Check if daily activity exists
        if (!userDailyActivity) {
            throw new ResponseError(404, "Activity not found")
        }
        
        return toUserDailyActivityResponse(userDailyActivity)
    }


    // Get daily activity on a range of date from a user
    static async getActivitiesRange(
        currentUserId: bigint,
        startDate: Date,
        endDate: Date
    ): Promise<UserDailyActivityResponse[]> {
        
        const userDailyActivities = await prismaClient.userDailyActivity.findMany({
            where: {
                userId: currentUserId,
                date: {
                    gte: startDate, 
                    lte: endDate 
                }
            },
            orderBy: {
                date: 'asc' 
            }
        });

        // If there isn't any data
        if (userDailyActivities.length === 0) {
            return [];
        }

        // Map to user daily activity response
        return userDailyActivities.map(toUserDailyActivityResponse);
    }
}