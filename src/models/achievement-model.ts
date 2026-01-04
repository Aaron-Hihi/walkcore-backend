import { Achievement, RequirementType } from "../../generated/prisma/client";

export interface AchievementResponse {
  id: number;
  title: string;
  description: string;
  requirementType: RequirementType;
  requirementValue: number;
  reward: number;
}

export function toAchievementResponseList(
  prismaAchievement: Achievement[]
): AchievementResponse[] {
  const result = prismaAchievement.map((Achievement) => {
    return {
      id: Achievement.id,
      title: Achievement.title,
      description: Achievement.description,
      requirementType: Achievement.requirementType,
      requirementValue: Achievement.requirementValue,
      reward: Achievement.reward,
    };
  });
  return result;
}

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

export interface AchievementCreateUpdateRequest {
  title: string;
  description: string;
  requirementType: RequirementType;
  requirementValue: number;
  reward: number;
}
