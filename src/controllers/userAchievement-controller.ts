import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user-request-model";
import { AchievementResponse } from "../models/achievement-model";
import { UserAchievementService } from "../services/userAchievement-service";
import { UserAchievementCreateUpdateRequest } from "../models/userAchievement-model";
import { ResponseError } from "../error/response-error";

export class UserAchievementController {
  static async getAllUserAchievements(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await UserAchievementService.getAllUserAchievements(req.user!);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAchievement(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userAchievementListId = Number(req.params.userAchievementListId);

      const response = await UserAchievementService.getUserAchievement(
        req.user!,
        userAchievementListId
      );
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUserAchievement(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const achievementId = Number(req.params.achievementId);
      if (!Number.isInteger(achievementId)) {
        throw new ResponseError(400, "Invalid achievement id");
      }

      const reqData = req.body as UserAchievementCreateUpdateRequest;

      const response = await UserAchievementService.createUserAchievement(
        req.user!,
        achievementId,
        reqData
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserAchievement(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const reqData = req.body as UserAchievementCreateUpdateRequest;
      const userAchievementListId = Number(req.params.userAchievementListId);
      const response = await UserAchievementService.updateUserAchievement(
        req.user!,
        reqData,
        userAchievementListId
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserAchievement(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userAchievementListId = Number(req.params.userAchievementListId);
      const response = await UserAchievementService.deleteUserAchievement(
        req.user!,
        userAchievementListId
      );
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
