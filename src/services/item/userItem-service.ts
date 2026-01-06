import { UserJWTPayload } from "../../models/user/user-model";
import { ShopItemResponse } from "../../models/item/shopItem-model";
import {
    InventoryResponse,
    toInventoryResponse,
    toUserItemResponse,
    toUserItemResponseList,
    UserItemCreateUpdateRequest,
    UserItemResponse,
} from "../../models/item/userItem-model";
import { prismaClient } from "../../utils/database-util";
import { PrismaClient, RequirementType, type UserItem } from "../../../generated/prisma/client";
import { ResponseError } from "../../error/response-error";
import { UserItemValidation } from "../../validations/item/userItem-validation";
import { Validation } from "../../validations/validation";
import { UserAchievementService } from "../achievement/userAchievement-service";

export class UserItemService {
    static async getAllUserItems(
        user: UserJWTPayload
    ): Promise<UserItemResponse[]> {
        const userId = Number(user.id);

        if (Number.isNaN(userId)) {
            throw new Error("Invalid user id in token");
        }
        const userItems = await prismaClient.userItem.findMany({
            where: {
                userId: userId
            },
        });
        return toUserItemResponseList(userItems);
    }

    static async getUserItem(
        user: UserJWTPayload,
        userItemListId: number,
    ): Promise<UserItemResponse> {
        const userId = Number(user.id);

        if (Number.isNaN(userId)) {
            throw new Error("Invalid user id in token");
        }
        const userItem = await this.checkUserItemIsEmpty(userId, userItemListId);

        return toUserItemResponse(userItem);
    }

    static async checkUserItemIsEmpty(
        user_id: number,
        userItemListId: number,
    ): Promise<UserItem> {
        const userItem = await prismaClient.userItem.findFirst({
            where: {
                userId: user_id,
                id: userItemListId,
            },
        });

        if (!userItem) {
            throw new ResponseError(400, "User Item does not exist");
        }
        return userItem;
    }

    static async createUserItem(
        user: UserJWTPayload,
        shopId: number,
        reqData: UserItemCreateUpdateRequest
    ): Promise<string> {
        const validatedData = Validation.validate(
            UserItemValidation.CREATE_UPDATE,
            reqData
        );

        const userId = BigInt(user.id);

        await prismaClient.userItem.create({
            data: {
                shopItemId: shopId,
                acquiredAt: validatedData.acquiredAt,
                isEquipped: validatedData.isEquipped,
                userId: userId,
                quantity: 1
            },
        });

        return "User Item has been created successfully";
    }

    
    static async updateUserItem(user: UserJWTPayload, req: UserItemCreateUpdateRequest, userItemListId: number) {
        const validatedData = Validation.validate(
            UserItemValidation.CREATE_UPDATE,
            req
        )
        const userId = Number(user.id);
        if (!Number.isInteger(userId)) {
            throw new ResponseError(401, "Invalid user id in token");
        }
        await this.checkUserItemIsEmpty(userId, userItemListId)

        await prismaClient.userItem.update({
            where:{
                id: userItemListId,
                },
                data:{
                    acquiredAt: validatedData.acquiredAt,
                    isEquipped: validatedData.isEquipped,
                },
        })
        return "User Item has been updated successfully"   
    }

    static async deleteUserItem(user: UserJWTPayload, userItemListId: number) { 
        const userId = Number(user.id);
    if (!Number.isInteger(userId)) {
        throw new ResponseError(401, "Invalid user id in token");
    }
        await this.checkUserItemIsEmpty(userId, userItemListId);
        await prismaClient.userItem.delete({    
            where:{
            id: userItemListId,
            }
        })
        return"User Item has been deleted successfully"
    }

    static async buyItem(userId: bigint, shopItemId: number): Promise<string> {
        return await prismaClient.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            const item = await tx.shopItem.findUnique({ where: { id: shopItemId } });

            if (!user || !item) throw new ResponseError(404, "User or Item not found");

            const existingItem = await tx.userItem.findUnique({
                where: { userId_shopItemId: { userId, shopItemId } }
            });
            if (existingItem) throw new ResponseError(400, "You already own this item");

            if (user.currency < item.price) {
                throw new ResponseError(400, "Insufficient currency balance");
            }

            await tx.user.update({
                where: { id: userId },
                data: { currency: { decrement: item.price } }
            });

            await tx.userItem.create({
                data: {
                    userId: userId,
                    shopItemId: shopItemId,
                    isEquipped: false
                }
            });

            const totalItems = await tx.userItem.count({ where: { userId } });
            await UserAchievementService.checkAndUnlock(
                userId, 
                RequirementType.TOTAL_SESSIONS,
                totalItems
            );

            return `Successfully purchased ${item.name}`;
        });
    }

    static async getMyInventory(userId: bigint): Promise<InventoryResponse[]> {
        const items = await prismaClient.userItem.findMany({
            where: { userId },
            include: { shopItem: true }
        });
        return items.map(toInventoryResponse);
    }

    static async toggleEquip(userId: bigint, userItemId: number): Promise<string> {
        const item = await prismaClient.userItem.findUnique({
            where: { id: userItemId },
            include: { shopItem: true }
        });

        if (!item || item.userId !== userId) throw new ResponseError(404, "Item not found in your inventory");

        if (!item.isEquipped) {
            await prismaClient.userItem.updateMany({
                where: { userId, shopItem: { itemType: item.shopItem.itemType } },
                data: { isEquipped: false }
            });
        }

        const updated = await prismaClient.userItem.update({
            where: { id: userItemId },
            data: { isEquipped: !item.isEquipped }
        });

        return updated.isEquipped ? "Item equipped" : "Item unequipped";
    }
}
