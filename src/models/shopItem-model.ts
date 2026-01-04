import { Shop_Item, ItemType } from '../../generated/prisma/client'


export interface ShopItemResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    itemType: ItemType
}

export function toShopItemResponseList(prismaShopItem : Shop_Item[]): ShopItemResponse[] {
    const result = prismaShopItem.map((Shopitem) =>{
        return{
            id: Shopitem.id,
            name: Shopitem.name,
    description: Shopitem.description,
    price: Shopitem.price,
    imageUrl: Shopitem.imageUrl,
    itemType: Shopitem.itemType
            
        }
    })
    return result
}

export function toShopItemResponse(prismaShopItem : Shop_Item): ShopItemResponse {
     return{
            id: prismaShopItem.id,
            name: prismaShopItem.name,
            description: prismaShopItem.description,
            price: prismaShopItem.price,
            imageUrl: prismaShopItem.imageUrl,
            itemType: prismaShopItem.itemType
        }
}

export interface ShopItemCreateUpdateRequest {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    itemType: ItemType
}

