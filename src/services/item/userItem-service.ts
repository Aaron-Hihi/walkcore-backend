import { UserJWTPayload } from "../../models/user/user-model";
import { ShopItemResponse } from "../../models/item/shopItem-model";
import {
    toUserItemResponse,
    toUserItemResponseList,
    UserItemCreateUpdateRequest,
    UserItemResponse,
} from "../../models/item/userItem-model";
import { prismaClient } from "../../utils/database-util";
import { PrismaClient, type UserItem } from "../../../generated/prisma/client";
import { ResponseError } from "../../error/response-error";
import { th } from "zod/v4/locales";
import { UserItemValidation } from "../../validations/item/userItem-validation";
import { Validation } from "../../validations/validation";

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
        return "User Item has been updated successfully"   }

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
    }
