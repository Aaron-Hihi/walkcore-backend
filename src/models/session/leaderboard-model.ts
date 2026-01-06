/* =========================
* LEADERBOARD INTERFACES
========================= */
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    totalSteps: number;
    approxDistance: string;
    caloriesBurned: number;
}

export interface SessionLeaderboardResponse {
    sessionId: string;
    leaderboard: LeaderboardEntry[];
}