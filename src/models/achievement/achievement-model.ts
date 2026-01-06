import { Achievement, RequirementType } from "../../../generated/prisma";

/* =========================
* ACHIEVEMENT INTERFACES
========================= */
export interface AchievementResponse {
    id: number;
    title: string;
    description: string;
    requirementType: RequirementType;
    requirementValue: number;
    reward: number;
}

export interface AchievementCreateUpdateRequest {
    title: string;
    description: string;
    requirementType: RequirementType;
    requirementValue: number;
    reward: number;
}

/* =========================
* ACHIEVEMENT MAPPERS
========================= */
export function toAchievementResponse(
    prismaAchievement: Achievement
): AchievementResponse {
    return {
        id: prismaAchievement.id,
        title: prismaAchievement.title,
        description: prismaAchievement.description,
        requirementType: prismaAchievement.requirementType,
        requirementValue: prismaAchievement.requirementValue,
        reward: prismaAchievement.reward,
    };
}

export function toAchievementResponseList(
    prismaAchievements: Achievement[]
): AchievementResponse[] {
    return prismaAchievements.map((achievement) => toAchievementResponse(achievement));
}