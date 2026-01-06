import { Friendship } from "../../../generated/prisma/client"

export interface FriendResponse {
    id: string
    username: string
}

export interface FriendRequestResponse {
    id: string
    requester: {
        id: string
        username: string
    }
    createdAt: Date
}

export function toFriendResponse(user: { id: bigint, username: string }): FriendResponse {
    return {
        id: user.id.toString(),
        username: user.username,
    }
}

type FriendshipWithRequester = Friendship & {
    requester: {
        id: bigint,
        username: string
    }
}

export function toFriendRequestResponse(friendship: FriendshipWithRequester): FriendRequestResponse {
    return {
        id: friendship.id.toString(),
        requester: {
            id: friendship.requester.id.toString(),
            username: friendship.requester.username
        },
        createdAt: friendship.createdAt
    }
}