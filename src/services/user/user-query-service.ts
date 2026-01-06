import { prismaClient } from "../../utils/database-util";
import { ResponseError } from "../../error/response-error";
import { User } from "../../../generated/prisma/client";
import { Validation } from "../../validations/validation";
import { UserValidation } from "../../validations/user/user-validation";
import { UpdateUserProfileRequest } from "../../models/user/user-model";

export class UserQueryService {
    // Fetch a single user by their unique ID
    static async getUserById(userId: bigint): Promise<User> {
        const user = await prismaClient.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new ResponseError(404, "User not found");
        }

        return user;
    }

    // Update user profile using centralized Zod validation
    static async updateMyProfile(userId: bigint, request: UpdateUserProfileRequest): Promise<User> {
        const validatedData = Validation.validate(UserValidation.UPDATE_PROFILE, request);

        return await prismaClient.user.update({
            where: { id: userId },
            data: {
                username: validatedData.username,
                gender: validatedData.gender,
                dateOfBirth: validatedData.dateOfBirth,
                height: validatedData.height,
                weight: validatedData.weight
            }
        });
    }

    // Retrieve all users from the database
    static async getAllUsers(): Promise<User[]> {
        return await prismaClient.user.findMany();
    }

    // Retrieve a target user's profile for social interaction
    static async getUserProfile(currentUserId: bigint, targetUserId: bigint): Promise<User> {
        const user = await prismaClient.user.findUnique({
            where: { id: targetUserId }
        });

        if (!user) {
            throw new ResponseError(404, "Target user not found");
        }

        return user;
    }
}