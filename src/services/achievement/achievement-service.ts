import { UserJWTPayload } from "../../models/user/user-model";
import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { Validation } from "../../validations/validation";
import { AchievementValidation } from "../../validations/achievement/achievement-validation";
import { AchievementCreateUpdateRequest, AchievementResponse, toAchievementResponse, toAchievementResponseList } from "../../models/achievement/achievement-model";
import { Achievement } from "../../../generated/prisma/client";

export class AchievementService {
  static async getAllAchievement(): Promise<AchievementResponse[]> {
    const achivements = await prismaClient.achievement.findMany({
      orderBy: { id: "asc" },
    });
    return toAchievementResponseList(achivements);
  }

  static async getAchievement(achievementId: number): Promise<AchievementResponse> {
    if (!Number.isInteger(achievementId)) throw new ResponseError(400, "Invalid achievement id");

    const achievement = await prismaClient.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) throw new ResponseError(404, "Achievement does not exist");
    return toAchievementResponse(achievement);
  }

  
  private static ensureAdmin(user: UserJWTPayload) {
    
  }

  static async createAchievement(user: UserJWTPayload, req: AchievementCreateUpdateRequest): Promise<string> {
    this.ensureAdmin(user);

    const validated = Validation.validate(AchievementValidation.CREATE_UPDATE, req);

    await prismaClient.achievement.create({
      data: {
        title: validated.title,
        description: validated.description,
        requirementType: validated.requirementType,
        requirementValue: validated.requirementValue,
        reward: validated.reward,
      },
    });

    return "The Achievement has been created successfully";
  }

  static async updateAchievement(user: UserJWTPayload, achievementId: number, req: AchievementCreateUpdateRequest): Promise<string> {
    this.ensureAdmin(user);

    if (!Number.isInteger(achievementId)) throw new ResponseError(400, "Invalid achievement id");

    const validated = Validation.validate(AchievementValidation.CREATE_UPDATE, req);

    const existing = await prismaClient.achievement.findUnique({ where: { id: achievementId } });
    if (!existing) throw new ResponseError(404, "Achievement does not exist");

    await prismaClient.achievement.update({
      where: { id: achievementId },
      data: {
        title: validated.title,
        description: validated.description,
        requirementType: validated.requirementType,
        requirementValue: validated.requirementValue,
        reward: validated.reward,
      },
    });

    return "Achievement has been updated successfully";
  }

  static async deleteAchievevment(user: UserJWTPayload, achievementId: number): Promise<string> {
    this.ensureAdmin(user);

    if (!Number.isInteger(achievementId)) throw new ResponseError(400, "Invalid achievement id");

    const existing = await prismaClient.achievement.findUnique({ where: { id: achievementId } });
    if (!existing) throw new ResponseError(404, "The Achievement does not exist");

    await prismaClient.achievement.delete({ where: { id: achievementId } });

    return "The achievement has been deleted successfully";
  }
}
