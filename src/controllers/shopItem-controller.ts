import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user-request-model";
import { ShopItemService } from "../services/shopItem-service";
import { ShopItemResponse,
    ShopItemCreateUpdateRequest
 } from "../models/shopItem-model";

export class ShopItemController {
  static async getAllShopItems(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const response = await ShopItemService.getAllShopItems();
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async getShopItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const shopItemId = Number(req.params.shopItemId);
      const response = await ShopItemService.getShopItem(shopItemId);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async createShopItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const reqData = req.body as ShopItemCreateUpdateRequest; 
      const response = await ShopItemService.createShopItem(req.user!, reqData); 
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async updateShopItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const shopItemId = Number(req.params.shopItemId);
      const reqData = req.body as ShopItemCreateUpdateRequest;
      const response = await ShopItemService.updateShopItem(req.user!, shopItemId, reqData);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }

  static async deleteShopItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const shopItemId = Number(req.params.shopItemId);
      const response = await ShopItemService.deleteShopItem(req.user!, shopItemId);
      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }
}
