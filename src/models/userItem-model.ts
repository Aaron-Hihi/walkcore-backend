import { User_Item } from '../../generated/prisma/client'
export interface UserItemResponse {
    id: number;
    acquiredAt: Date;
    isEquipped: boolean;
}

export function toUserItemResponseList(prismaUserItem : User_Item[]): UserItemResponse[] {
    const result = prismaUserItem.map((useritem) =>{
        return{
            id: useritem.id,
            acquiredAt: useritem.acquiredAt,
            isEquipped: useritem.isEquipped
        }
    })
    return result
}

export function toUserItemResponse(prismaUserItem : User_Item): UserItemResponse {
     return{
            id: prismaUserItem.id,
            acquiredAt: prismaUserItem.acquiredAt,
            isEquipped: prismaUserItem.isEquipped
        }
}

export interface UserItemCreateUpdateRequest {
    acquiredAt: Date;
    isEquipped: boolean;
}

