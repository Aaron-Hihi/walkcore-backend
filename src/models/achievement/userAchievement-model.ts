import { UserAchievement } from '../../../generated/prisma/client'
export interface UserAchievementResponse {
    id: number;
    isCompleted: boolean;
    completedAt: Date | null;
}

export function toUserAchievementResponseList(prismaUserAchievement : UserAchievement[]): UserAchievementResponse[] {
    const result = prismaUserAchievement.map((userachievement) =>{
        return{
            id: userachievement.id,
            isCompleted: userachievement.isCompleted,
            completedAt: userachievement.completedAt
        }
    })
    return result
}

export function toUserAchievementResponse(prismaUserAchievement : UserAchievement): UserAchievementResponse {
    return{
            id: prismaUserAchievement.id,
            isCompleted: prismaUserAchievement.isCompleted,
            completedAt: prismaUserAchievement.completedAt
        }
}

export interface UserAchievementCreateUpdateRequest {
    isCompleted: boolean;
    completedAt: Date | null;
}

