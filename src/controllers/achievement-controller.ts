import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user-request-model";
import { AchievementService } from "../services/achievement-service";
import { AchievementResponse,
    AchievementCreateUpdateRequest
 } from "../models/achievement-model";

export class AchievementController {
  static async getAllAchievements(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const response = await AchievementService.getAllAchievement();
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async getAchievement(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const achievementId = Number(req.params.achievementId);
      const response = await AchievementService.getAchievement(achievementId);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async createAchievement(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const reqData = req.body as AchievementCreateUpdateRequest; 
      const response = await AchievementService.createAchievement(req.user!, reqData); 
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async updateAchievement(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const achievementId = Number(req.params.achievementId);
      const reqData = req.body as AchievementCreateUpdateRequest;
      const response = await AchievementService.updateAchievement(req.user!, achievementId, reqData);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAchievement(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const achievementId = Number(req.params.achievementId);
      const response = await AchievementService.deleteAchievevment(req.user!, achievementId);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }
}
