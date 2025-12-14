export class UserMapper {
    static toOverview(user: any) {
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
        }
    }

    static toProfile(user: any) {
        return {
            username: user.username,
            email: user.email,
            height: user.height,
            weight: user.weight,
            gender: user.gender,
            dateOfBirth: user.date_of_birth,
        }
    }

    static toStats(user: any) {
        return {
            totalSteps: user.totalSteps,
            totalDistance: user.totalDistance,
            totalCaloriesBurned: user.totalCaloriesBurned,
            longestStreak: user.longestStreak,
        }
    }
}
