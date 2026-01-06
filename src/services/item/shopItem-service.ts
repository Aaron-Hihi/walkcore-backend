import { UserJWTPayload } from "../../models/user/user-model";
import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { Validation } from "../../validations/validation";
import { ShopItemValidation } from "../../validations/item/shopItem-validation";
import { ShopItemCreateUpdateRequest, ShopItemResponse, toShopItemResponse, toShopItemResponseList } from "../../models/item/shopItem-model";
import { ShopItem } from "../../../generated/prisma/client";

export class ShopItemService {
  static async getAllShopItems(): Promise<ShopItemResponse[]> {
    const items = await prismaClient.shopItem.findMany({
      orderBy: { id: "asc" },
    });
    return toShopItemResponseList(items);
  }

  static async getShopItem(shopItemId: number): Promise<ShopItemResponse> {
    if (!Number.isInteger(shopItemId)) throw new ResponseError(400, "Invalid shop item id");

    const item = await prismaClient.shopItem.findUnique({
      where: { id: shopItemId },
    });

    if (!item) throw new ResponseError(404, "Shop item does not exist");
    return toShopItemResponse(item);
  }

  
  private static ensureAdmin(user: UserJWTPayload) {
    
  }

  static async createShopItem(user: UserJWTPayload, req: ShopItemCreateUpdateRequest): Promise<string> {
    this.ensureAdmin(user);

    const validated = Validation.validate(ShopItemValidation.CREATE_UPDATE, req);

    await prismaClient.shopItem.create({
      data: {
        name: validated.name,
        description: validated.description,
        price: validated.price,
        imageUrl: validated.imageUrl,
        itemType: validated.itemType,
      },
    });

    return "Shop item has been created successfully";
  }

  static async updateShopItem(user: UserJWTPayload, shopItemId: number, req: ShopItemCreateUpdateRequest): Promise<string> {
    this.ensureAdmin(user);

    if (!Number.isInteger(shopItemId)) throw new ResponseError(400, "Invalid shop item id");

    const validated = Validation.validate(ShopItemValidation.CREATE_UPDATE, req);

    const existing = await prismaClient.shopItem.findUnique({ where: { id: shopItemId } });
    if (!existing) throw new ResponseError(404, "Shop item does not exist");

    await prismaClient.shopItem.update({
      where: { id: shopItemId },
      data: {
        name: validated.name,
        description: validated.description,
        price: validated.price,
        imageUrl: validated.imageUrl,
        itemType: validated.itemType,
      },
    });

    return "Shop item has been updated successfully";
  }

  static async deleteShopItem(user: UserJWTPayload, shopItemId: number): Promise<string> {
    this.ensureAdmin(user);

    if (!Number.isInteger(shopItemId)) throw new ResponseError(400, "Invalid shop item id");

    const existing = await prismaClient.shopItem.findUnique({ where: { id: shopItemId } });
    if (!existing) throw new ResponseError(404, "Shop item does not exist");

    await prismaClient.shopItem.delete({ where: { id: shopItemId } });

    return "Shop item has been deleted successfully";
  }
}
