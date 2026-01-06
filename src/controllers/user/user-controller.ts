import { Request, Response, NextFunction } from "express";
import { 
    LoginUserRequest, 
    RegisterUserRequest, 
    UserResponse, 
    toUserProfileResponse, 
    toUserStatsResponse, 
    toUserOverviewResponse, 
    toOtherProfilesResponse 
} from "../../models/user/user-model";
import { UserService } from "../../services/user/user-service";
import { UserRequest } from "../../models/user/user-request-model";
import { UserQueryService } from "../../services/user/user-query-service";
import { UserSessionService } from "../../services/session/user-session-service";

export class UserController {
    // Handle user registration
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: RegisterUserRequest = req.body as RegisterUserRequest;
            const response: UserResponse = await UserService.register(request);
            res.status(200).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    // Handle user login
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginUserRequest = req.body as LoginUserRequest;
            const response: UserResponse = await UserService.login(request);
            res.status(200).json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    // Handle logout from all devices
    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            await UserService.logout(userId);
            res.json({ message: "Logged out from all devices" });
        } catch (e) {
            next(e);
        }
    }

    // Get current user profile
    static async getMyProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);
            res.json({ data: toUserProfileResponse(user) });
        } catch (e) {
            next(e);
        }
    }

    // Update user profile with biometric data validation
    static async updateMyProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const data = await UserQueryService.updateMyProfile(userId, req.body);
            res.json({ data: toUserProfileResponse(data) });
        } catch (e) {
            next(e);
        }
    }

    // Get personal fitness statistics
    static async getMyStats(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);
            res.json({ data: toUserStatsResponse(user) });
        } catch (e) {
            next(e);
        }
    }

    // Get combined profile and statistics
    static async getMyOverview(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);
            res.json({ data: toUserOverviewResponse(user) });
        } catch (e) {
            next(e);
        }
    }

    // List all users in the system
    static async getAllUsers(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userProfiles = await UserQueryService.getAllUsers();
            res.json({ data: toOtherProfilesResponse(userProfiles) });
        } catch (e) {
            next(e);
        }
    }
    
    // Get specific user profile by ID
    static async getUserProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const currentUserId = BigInt(req.user!.id);
            const targetUserId = BigInt(req.params.id);
            const userProfile = await UserQueryService.getUserProfile(currentUserId, targetUserId);
            res.json({ data: toUserProfileResponse(userProfile) });
        } catch (e) {
            next(e);
        }
    }

    // List all sessions for the current user
    static async getMySessions(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const result = await UserSessionService.getMySessions(userId);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }

    // Get the currently active session for the user
    static async getMyActiveSession(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const result = await UserSessionService.getMyActiveSession(userId);
            res.status(200).json({ data: result });
        } catch (e) {
            next(e);
        }
    }
}