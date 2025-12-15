import { ResponseError } from "../../error/response-error"
import { prismaClient } from "../../utils/database-util"
import { UpdateUserProfileRequest } from "../../models/user-model"
import { Validation } from "../../validations/validation"
import { UserProfileValidation } from "../../validations/user/user-profile-validation"

export class UserQueryService {
    //* === Self ===

    // Get user by ID
    static async getUserById(userId: bigint) {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        })

        if (!user) throw new ResponseError(404, "User not found")

        return user
    }


    // Update the user's profile
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


    //* === Other User ===
    
    // Get other user profile
    static async getUserProfile(
        currentUserId: bigint,
        targetUserId: bigint
    ) {
        const user = await this.getUserById(targetUserId)

        const friendship = await prismaClient.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: currentUserId, addresseeId: targetUserId, friendStatus: "ACCEPTED" },
                    { requesterId: targetUserId, addresseeId: currentUserId, friendStatus: "ACCEPTED" }
                ]
            }
        })

        const isFriend = !!friendship

        return { ...user, isFriend }
    }

    static async getAllUsers() {
        const user = await prismaClient.user.findMany()
        if (!user) throw new ResponseError(404, "No user found")

        return user
    }

    
}