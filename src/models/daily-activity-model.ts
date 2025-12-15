import { Decimal } from "@prisma/client/runtime/library"
import { UserDailyActivity } from "../../generated/prisma/client"


export interface UserDailyActivityResponse {
    id: string
    userId: string
    date: Date
    stepsWalked: number
    distance: string
    activeTime: number
    sessionTime: number
    sessionCount: number
    caloriesBurned: number
    currencyEarned: number
}

export function toUserDailyActivityResponse(userDailyActivity: UserDailyActivity): UserDailyActivityResponse {
    return {
        id: userDailyActivity.id.toString(),
        userId: userDailyActivity.userId.toString(),
        date: userDailyActivity.date,
        stepsWalked: userDailyActivity.stepsWalked,
        activeTime: userDailyActivity.activeTime,
        sessionTime: userDailyActivity.sessionTime,
        sessionCount: userDailyActivity.sessionCount,
        caloriesBurned: userDailyActivity.caloriesBurned,
        currencyEarned: userDailyActivity.currencyEarned,
        distance: userDailyActivity.distance.toString(), 
    }
}






