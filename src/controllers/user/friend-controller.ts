import { Request, Response, NextFunction } from "express";
import { friendService } from "../../services/user/friend-service";
import { UserRequest } from "../../models/user/user-request-model";

export class FriendController {

    static async search(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;
            const userId = BigInt(req.user!.id);
            const result = await friendService.searchUsers(userId, query);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    //* === FRIEND REQUEST ===
    // Send friend request
    static async sendRequest(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const requesterId = BigInt(req.user!.id);
            const addresseeId = BigInt(req.params.userId);
            const result = await friendService.sendRequest(requesterId, addresseeId);
            res.status(201).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    // Accept friend request
    static async acceptFriend(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const requestId = Number(req.params.requestId);
            const result = await friendService.acceptRequest(userId, requestId);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    // Reject friend request
    static async rejectFriend(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const currentUserId = BigInt(req.user!.id);
            const requestId = BigInt(req.params.requestId);

            const message = await friendService.rejectRequest(requestId, currentUserId);
            res.status(200).json({ message });
        } catch (err) {
            next(err);
        }
    }

    //* === SOCIAL SYSTEM ===
    // Look at friend's profile
    static async getFriendProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.params.userId);

            const friends = await friendService.getFriends(userId);
            res.status(200).json({ friends });
        } catch (err) {
            next(err);
        }
    }

    // Get all friends
    static async getFriendAll(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const currentUserId = BigInt(req.user!.id);
            const friends = await friendService.getFriends(currentUserId);
            res.status(200).json({ friends });
        } catch (err) {
            next(err);
        }
    }

    // Get all friend requests
    static async getFriendRequests(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const pendingRequests = await friendService.getPendingRequests(userId);
            
            res.status(200).json({ pendingRequests });
        } catch (err) {
            next(err);
        }
    }

    // Block a friend
    static async blockFriend(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const targetUserId = BigInt(req.params.userId);
            const result = await friendService.blockUser(userId, targetUserId);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }
}
