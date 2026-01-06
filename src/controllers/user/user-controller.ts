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

/* =========================
* USER CONTROLLER
========================= */
export class UserController {
    /* =========================
    * AUTHENTICATION
    ========================= */
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: RegisterUserRequest = req.body as RegisterUserRequest;
            const response: UserResponse = await UserService.register(request);

            res.status(200).json({
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginUserRequest = req.body as LoginUserRequest;
            const response: UserResponse = await UserService.login(request);

            res.status(200).json({
                data: response,
            });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            await UserService.logout(userId);

            res.json({ message: "Logged out from all devices" });
        } catch (e) {
            next(e);
        }
    }

    /* =========================
    * PROFILING
    ========================= */
    static async getMyProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);

            res.json({
                data: toUserProfileResponse(user),
            });
        } catch (e) {
            next(e);
        }
    }

    static async updateMyProfile(
        req: UserRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = BigInt(req.user!.id);
            const data = await UserQueryService.updateMyProfile(userId, req.body);

            res.json({ data: toUserProfileResponse(data) });
        } catch (e) {
            next(e);
        }
    }

    static async getMyStats(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);

            res.json({
                data: toUserStatsResponse(user),
            });
        } catch (e) {
            next(e);
        }
    }

    static async getMyOverview(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id);
            const user = await UserQueryService.getUserById(userId);
            res.json({ data: toUserOverviewResponse(user) });
        } catch (e) {
            next(e);
        }
    }

    /* =========================
    * OTHER USERS
    ========================= */
    static async getAllUsers(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userProfiles = await UserQueryService.getAllUsers();

            res.json({ data: toOtherProfilesResponse(userProfiles) });
        } catch (e) {
            next(e);
        }
    }
    
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
}