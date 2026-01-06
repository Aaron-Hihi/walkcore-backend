import { UserItem } from '../../../generated/prisma/client'
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

export interface UserItemCreateUpdateRequest {
    acquiredAt: Date;
    isEquipped: boolean;
}

