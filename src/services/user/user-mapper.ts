import { User } from "../../../generated/prisma/client"

export class UserMapper {
    // Map to all data
    static toOverview(user: User) {
        return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            currency: user.currency,
            totalSteps: user.totalSteps.toString(),
            totalDistance: user.totalDistance,
            totalActiveTime: user.totalActiveTime,
            totalSessionTime: user.totalSessionTime,
            totalSessionCount: user.totalSessionCount,
            totalCaloriesBurned: user.totalCaloriesBurned,
            longestStreak: user.longestStreak,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    // Only get profile
    static toProfile(user: User) {
        return {
            username: user.username,
            email: user.email,
            height: user.height,
            weight: user.weight,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
        }
    }

    // Only get statistics
    static toStats(user: User) {
        return {
            currency: user.currency,
            totalSteps: user.totalSteps.toString(),
            totalDistance: user.totalDistance,
            totalActiveTime: user.totalActiveTime,
            totalSessionTime: user.totalSessionTime,
            totalSessionCount: user.totalSessionCount,
            totalCaloriesBurned: user.totalCaloriesBurned,
            longestStreak: user.longestStreak,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    // To other user profile
    static toOtherProfile(user: User) {
        return {
            id: user.id.toString(),
            username: user.username,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            totalSteps: user.totalSteps.toString(),
            totalDistance: user.totalDistance,
            totalActiveTime: user.totalActiveTime,
            totalSessionTime: user.totalSessionTime,
            totalSessionCount: user.totalSessionCount,
            totalCaloriesBurned: user.totalCaloriesBurned,
            longestStreak: user.longestStreak
        }
    }

    static toOtherProfiles(users: User[]) {
        return users.map(user => UserMapper.toOtherProfile(user))
    }
}
