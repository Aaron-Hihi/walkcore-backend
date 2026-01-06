import { NextFunction, Response } from "express"
import { UserRequest } from "../models/user/user-request-model"
import { ResponseError } from "../error/response-error"
import { verifyToken } from "../utils/jwt-util"
import { prismaClient } from "../utils/database-util"

export const authMiddleware = async (
    req: UserRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers["authorization"]
        const token = authHeader && authHeader.split(" ")[1]
        
        if (!token) {
            return next(new ResponseError(401, "Unauthorized user!"))
        }

        const payload = verifyToken(token!)

        if (!payload) {
            return next(new ResponseError(401, "Unauthorized user!"))
        }
        

        const user = await prismaClient.user.findUnique({
            where: { id: BigInt(payload.id) },
            select: { tokenVersion: true }
        })

        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return next(new ResponseError(401, "Token expired"))
        }

        req.user = payload
        next()

    } catch (error) {
        return next(error)
    }
}