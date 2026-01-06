import { ShopItem, UserItem } from '../../../generated/prisma/client'
export interface UserItemResponse {
    id: number;
    acquiredAt: Date;
    isEquipped: boolean;
}

export function toUserItemResponseList(prismaUserItem : UserItem[]): UserItemResponse[] {
    const result = prismaUserItem.map((useritem) =>{
        return{
            id: useritem.id,
            acquiredAt: useritem.acquiredAt,
            isEquipped: useritem.isEquipped
        }
    })
    return result
}

export function toUserItemResponse(prismaUserItem : UserItem): UserItemResponse {
     return{
            id: prismaUserItem.id,
            acquiredAt: prismaUserItem.acquiredAt,
            isEquipped: prismaUserItem.isEquipped
        }
}

export function toInventoryResponse(item: UserItem & { shopItem: ShopItem }): InventoryResponse {
    return {
        id: item.id,
        name: item.shopItem.name,
        itemType: item.shopItem.itemType,
        imageUrl: item.shopItem.imageUrl,
        isEquipped: item.isEquipped
    };
}


export interface UserItemCreateUpdateRequest {
    acquiredAt: Date;
    isEquipped: boolean;
}

export interface BuyItemRequest {
    shopItemId: number;
}

export interface InventoryResponse {
    id: number;
    name: string;
    itemType: string;
    imageUrl: string | null;
    isEquipped: boolean;
}
