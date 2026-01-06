import { ResponseError } from "../../error/response-error"
import { FriendRequestResponse, FriendResponse, toFriendRequestResponse, toFriendResponse } from "../../models/user/friend-model"
import { prismaClient } from "../../utils/database-util"
import { Validation } from "../../validations/validation"

export class friendService {

    // Send friend request
    static async sendRequest(
        requesterId: bigint,
        addresseeId: bigint
    ): Promise<string> {

        // Check if requester adds themselves
        if (requesterId === addresseeId) {
            throw new ResponseError(400, "Cannot add yourself")
        }

        // Check if requester adds themselves
        const target = await prismaClient.user.findUnique({
            where: { id: addresseeId },
            select: { id: true }
        })

        if (!target) {
            throw new ResponseError(404, "Target user not found") 
        }

        // Logic if request is already made
        const existing = await prismaClient.friendship.findFirst({
            where: {
                OR: [
                    {
                        requesterId,
                        addresseeId
                    },
                    {
                        requesterId: addresseeId,
                        addresseeId: requesterId
                    }
                ]
            }
        })

        if (existing) {
            switch (existing.friendStatus) {
                case "PENDING":
                    if (existing.addresseeId === requesterId) {
                        throw new ResponseError(400, "You already have a pending request from this user. Please accept it.")
                    } else {
                        throw new ResponseError(400, "Friend request already pending")
                    }

                case "ACCEPTED":
                    throw new ResponseError(400, "You are already friends")

                case "BLOCKED":
                    throw new ResponseError(403, "You cannot send request to this user")

            default:
                throw new ResponseError(400, "Invalid friendship state")
            }
        }

        // Create friend request
        await prismaClient.friendship.create({
            data: {
            requesterId,
            addresseeId,
            friendStatus: "PENDING"
            }
        })

        return "Friend request sent"
    }


    // To accept friend request
    static async acceptRequest(
        requestId: bigint,
        currentUserId: bigint
    ): Promise<string> {
        const friendship = await prismaClient.friendship.findUnique({
        where: { id: Number(requestId) }
        })

        // Check if request is found
        if (!friendship) {
            throw new ResponseError(404, "Friend request not found")
        }

        // Check if user is addressee
        if (friendship.addresseeId !== currentUserId) {
            throw new ResponseError(403, "You are not allowed to accept this request")
        }

        // State validation
        if (friendship.friendStatus !== "PENDING") {
            throw new ResponseError(400, `Cannot accept request with status ${friendship.friendStatus}`)
        }

        // Update friend status to ACCEPTED
        await prismaClient.friendship.update({
            where: { id: Number(requestId) },
            data: { friendStatus: "ACCEPTED" }
        })

        return "Friend request accepted"
    }


    static async rejectRequest(
        requestId: bigint,
        currentUserId: bigint
    ): Promise<string> {
        const friendship = await prismaClient.friendship.findUnique({
            where: { id: Number(requestId) }
        })

        // Check if friend request is found
        if (!friendship) {
            throw new ResponseError(404, "Friend request not found")
        }

        // Check if user is addressee
        if (friendship.addresseeId !== currentUserId) {
            throw new ResponseError(403, "You are not allowed to reject this request")
        }

        // State validation
        if (friendship.friendStatus !== "PENDING") {
            throw new ResponseError(400, `Cannot reject request with status ${friendship.friendStatus}`)
        }

        // Delete request (reject)
        await prismaClient.friendship.delete({
            where: { id: Number(requestId) }
        })

        return "Friend request rejected"
    }

    // To get all pending request towards addressee
    static async getPendingRequests(
        userId: bigint
    ): Promise<FriendRequestResponse[]> {
        const pendingRequests = await prismaClient.friendship.findMany({
            where: {
                addresseeId: userId,
                friendStatus: "PENDING"
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        })

        return pendingRequests.map(toFriendRequestResponse) 
    }


    // Get all friends
    static async getFriends(
        userId: bigint
    ): Promise<FriendResponse[]> {
        const friendships = await prismaClient.friendship.findMany({
            where: {
                friendStatus: "ACCEPTED",
                OR: [
                    { requesterId: userId },
                    { addresseeId: userId }
                ]
            },
            
            include: {
                requester: {
                    select: { id: true, username: true }
                },
                addressee: {
                    select: { id: true, username: true }
                }
            }
        })

        const friends = friendships.map(f => {
            return f.requesterId === userId
                ? f.addressee
                : f.requester
            })

        return friends.map(toFriendResponse)
    }
}