import { NextFunction, Response } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { ShopItemResponse } from "../../models/item/shopItem-model";
import { UserItemService } from "../../services/item/userItem-service";
import { UserItemCreateUpdateRequest } from "../../models/item/userItem-model";
import { ResponseError } from "../../error/response-error";

export class UserItemController {
  static async getAllUserItems(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await UserItemService.getAllUserItems(req.user!);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserItem(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const useritemListId = Number(req.params.useritemListId);

      const response = await UserItemService.getUserItem(
        req.user!,
        useritemListId
      );
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
  static async createUserItem(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const shopId = Number(req.params.shopId);
      if (!Number.isInteger(shopId)) {
        throw new ResponseError(400, "Invalid shop id");
      }

      const reqData = req.body as UserItemCreateUpdateRequest;

      const response = await UserItemService.createUserItem(
        req.user!,
        shopId,
        reqData
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserItem(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const reqData = req.body as UserItemCreateUpdateRequest;
      const userItemListId = Number(req.params.userItemListId);
      const response = await UserItemService.updateUserItem(
        req.user!,
        reqData,
        userItemListId
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserItem(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const useritemListId = Number(req.params.userItemListId);
      const response = await UserItemService.deleteUserItem(
        req.user!,
        useritemListId
      );
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
