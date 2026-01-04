import { Request, Response, NextFunction } from "express"
import { LoginUserRequest, RegisterUserRequest, UserResponse } from "../models/user-model"
import { UserService } from "../services/user/user-service"
import { UserRequest } from "../models/user-request-model"
import { UserQueryService } from "../services/user/user-query-service"
import { UserMapper } from "../services/user/user-mapper"

export class UserController {
    /* =========================
    *  AUTHENTICATION
    ========================= */
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request: RegisterUserRequest = req.body as RegisterUserRequest
            const response: UserResponse = await UserService.register(request)

            res.status(200).json({
                data: response,
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request: LoginUserRequest = req.body as LoginUserRequest
            const response: UserResponse = await UserService.login(request)

            res.status(200).json({
                data: response,
            })
        } catch (error) {
            next(error)
        }
    }

    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id)
            await UserService.logout(userId)
            res.json({ message: "Logged out from all devices" })
        } catch (e) {
            next(e)
        }
    }

    /* =========================
    *  PROFILING
    ========================= */
    //* === PROFILE ===
    static async getMyProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id)
            const user = await UserQueryService.getUserById(userId)

            res.json({
                data: UserMapper.toProfile(user),
            })
        } catch (e) {
            next(e)
        }
    }

    static async updateMyProfile(
        req: UserRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = BigInt(req.user!.id)
            const data = await UserQueryService.updateMyProfile(userId, req.body)
            res.json({ data })
        } catch (e) {
            next(e)
        }
    }

    //* === STATS ===
    static async getMyStats(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id)
            const user = await UserQueryService.getUserById(userId)

            res.json({
                data: UserMapper.toStats(user),
            })
        } catch (e) {
            next(e)
        }
    }

    //* === OVERVIEW (ALL) ===
    static async getMyOverview(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.user!.id)
            const user = await UserQueryService.getUserById(userId)
            res.json({ data: UserMapper.toOverview(user) })
        } catch (e) {
            next(e)
        }
    }
}