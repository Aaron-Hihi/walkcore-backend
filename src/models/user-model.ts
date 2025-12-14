import { string } from "zod"
import { generateToken } from "../utils/jwt-util"

export interface UserJWTPayload {
    id: string
    email: string
    tokenVersion: number
}

export interface RegisterUserRequest {
    username: string
    email: string
    password: string
    confirmPassword: string
}

export interface LoginUserRequest {
    email: string
    password: string
}

export interface UserResponse {
    token?: string
}

export function toUserResponse(
    id: bigint,
    email: string,
    tokenVersion: number
): UserResponse {
    return {
        token: generateToken(
            {
                id: id.toString(),
                email: email,
                tokenVersion: tokenVersion
            },
            "1h"
        ),
    }
}

//* === Profile and stats request ===
export interface UpdateUserProfileRequest {
    height?: number
    weight?: number
    dateOfBirth?: Date
    gender?: "MALE" | "FEMALE"
}


