import { Friendship, FriendStatus, NotificationType } from "../../../generated/prisma";
import { ResponseError } from "../../error/response-error"
import { FriendRequestResponse, FriendResponse, toFriendRequestResponse, toFriendResponse } from "../../models/user/friend-model"
import { prismaClient } from "../../utils/database-util"
import { Validation } from "../../validations/validation"
import { NotificationService } from "../notification/notification-service";

export class friendService {
    static async searchUsers(userId: bigint, query: string): Promise<any[]> {
        return await prismaClient.user.findMany({
            where: {
                username: { contains: query, mode: "insensitive" },
                NOT: { id: userId },
                receivedFriendRequests: {
                    none: {
                        requesterId: userId,
                        friendStatus: FriendStatus.BLOCKED
                    }
                },
                sentFriendRequests: {
                    none: {
                        addresseeId: userId,
                        friendStatus: FriendStatus.BLOCKED
                    }
                }
            },
            select: {
                id: true,
                username: true,
                totalSteps: true
            }
        });
    }

    // Send friend request
    static async sendRequest(requesterId: bigint, addresseeId: bigint): Promise<Friendship> {
        if (requesterId === addresseeId) throw new ResponseError(400, "Cannot add yourself");

        const existing = await prismaClient.friendship.findFirst({
            where: {
                OR: [
                    { requesterId, addresseeId },
                    { requesterId: addresseeId, addresseeId: requesterId }
                ]
            }
        });

        if (existing) throw new ResponseError(400, "Relationship already exists or is pending");

        const newFriendship = await prismaClient.friendship.create({
            data: {
                requesterId,
                addresseeId,
                friendStatus: FriendStatus.PENDING
            },
            include: { requester: true }
        });

        await NotificationService.create(
            addresseeId,
            "Permintaan Pertemanan",
            `${newFriendship.requester.username} ingin berteman denganmu.`,
            NotificationType.FRIEND_REQUEST
        );

        return newFriendship;
    }


    // To accept friend request
    static async acceptRequest(userId: bigint, requestId: number): Promise<Friendship> {
        const request = await prismaClient.friendship.findUnique({
            where: { id: requestId },
            include: { addressee: true }
        });

        if (!request || request.addresseeId !== userId) {
            throw new ResponseError(404, "Friend request not found");
        }

        if (request.friendStatus !== FriendStatus.PENDING) {
            throw new ResponseError(400, `Cannot accept request with status ${request.friendStatus}`);
        }

        const updatedFriendship = await prismaClient.friendship.update({
            where: { id: requestId },
            data: { friendStatus: FriendStatus.ACCEPTED }
        });

        await NotificationService.create(
            request.requesterId,
            "Friend accepted",
            `${request.addressee.username} happy to be friends with you!.`,
            NotificationType.FRIEND_ACCEPTED
        );

        return updatedFriendship;
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

    static async blockUser(userId: bigint, targetUserId: bigint): Promise<Friendship> {
        return await prismaClient.friendship.upsert({
            where: {
                requesterId_addresseeId: {
                    requesterId: userId,
                    addresseeId: targetUserId
                }
            },
            update: { friendStatus: FriendStatus.BLOCKED },
            create: {
                requesterId: userId,
                addresseeId: targetUserId,
                friendStatus: FriendStatus.BLOCKED
            }
        });
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