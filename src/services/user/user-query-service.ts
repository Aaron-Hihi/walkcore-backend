import { NextFunction } from "express"
import { ResponseError } from "../../error/response-error"
import { UserRequest } from "../../models/user-request-model"
import { prismaClient } from "../../utils/database-util"
import { UpdateUserProfileRequest } from "../../models/user-model"
import { Validation } from "../../validations/validation"
import { UserProfileValidation } from "../../validations/user/user-profile-validation"

export class UserQueryService {
    static async getUserById(userId: bigint) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        })

        if (!user) throw new ResponseError(404, "User not found")

        return user
    }

    static async updateMyProfile(
        userId: bigint,
        request: UpdateUserProfileRequest
    ) {
        const data = Validation.validate(UserProfileValidation.UPDATE_PROFILE, request)

        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            throw new ResponseError(404, "User not found")
        }

        const updatedUser = await prismaClient.user.update({
            where: { id: userId },
            data,
        })

        return updatedUser
    }
}