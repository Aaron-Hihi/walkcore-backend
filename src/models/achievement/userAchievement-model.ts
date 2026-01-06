import { UserAchievement, Achievement } from "../../../generated/prisma/client";

/* =========================
* USER ACHIEVEMENT INTERFACES
========================= */
export interface UserAchievementResponse {
    id: number;
    achievementId: number;
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
    completedAt: Date | null;
}

export interface UserAchievementCreateUpdateRequest {
    progress: number;
    isCompleted?: boolean;
    completedAt?: Date | null;
}

/* =========================
* USER ACHIEVEMENT MAPPERS
========================= */
export function toUserAchievementResponse(
    ua: UserAchievement & { achievement: Achievement }
): UserAchievementResponse {
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

export function toUserAchievementResponseList(
    userAchievements: (UserAchievement & { achievement: Achievement })[]
): UserAchievementResponse[] {
    return userAchievements.map(toUserAchievementResponse);
}