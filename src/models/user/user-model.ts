import { User } from "../../../generated/prisma/client";
import { generateToken } from "../../utils/jwt-util";

/* =========================
* USER INTERFACES
========================= */
export interface UserJWTPayload {
    id: string;
    email: string;
    tokenVersion: number;
}

export interface RegisterUserRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    token?: string;
}

export interface UpdateUserProfileRequest {
    height?: number;
    weight?: number;
    dateOfBirth?: Date;
    gender?: "MALE" | "FEMALE";
}

export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    gender: string | null;
    dateOfBirth: Date | null;
    height: string | null;
    weight: string | null;
}

export interface UserStatsResponse {
    totalSteps: string;
    totalDistance: string;
    totalActiveTime: number;
    totalCaloriesBurned: number;
    longestStreak: number;
}

/* =========================
* USER MAPPERS
========================= */
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
                tokenVersion: tokenVersion,
            },
            "1h"
        ),
    };
}

export function toUserProfileResponse(user: User): UserProfileResponse {
    return {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        height: user.height ? user.height.toString() : null,
        weight: user.weight ? user.weight.toString() : null,
    };
}

export function toUserStatsResponse(user: User): UserStatsResponse {
    return {
        totalSteps: user.totalSteps.toString(),
        totalDistance: user.totalDistance.toString(),
        totalActiveTime: user.totalActiveTime,
        totalCaloriesBurned: user.totalCaloriesBurned,
        longestStreak: user.longestStreak,
    };
}

export function toUserOverviewResponse(user: User) {
    return {
        profile: toUserProfileResponse(user),
        stats: toUserStatsResponse(user),
    };
}

export function toOtherProfilesResponse(users: User[]): UserProfileResponse[] {
    return users.map((user) => toUserProfileResponse(user));
}