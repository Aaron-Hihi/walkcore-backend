/**
 * TEST UTILITY
 * Location: test/test-util.ts
 */
import { prismaClient } from "../src/utils/database-util";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../src/utils/env-util";

export class TestUtil {
    /**
     * Delete all data from database in correct order to avoid FK constraints
     */
    static async cleanAll() {
        await prismaClient.notification.deleteMany();
        await prismaClient.sessionParticipant.deleteMany();
        await prismaClient.friendship.deleteMany();
        await prismaClient.userDailyActivity.deleteMany();
        await prismaClient.userAchievement.deleteMany();
        await prismaClient.userItem.deleteMany();
        await prismaClient.session.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.achievement.deleteMany();
        await prismaClient.shopItem.deleteMany();
    }

    /**
     * Create a dummy user with complete biometric data for activity calculation
     */
    static async createTestUser() {
        return await prismaClient.user.create({
            data: {
                username: "testuser",
                email: "test@example.com",
                password: "hashedpassword",
                tokenVersion: 0,
                gender: "MALE",
                height: 170.0,
                weight: 65.0,
                dateOfBirth: new Date("2000-01-01")
            }
        });
    }

    /**
     * Generate a valid JWT Token including tokenVersion for authMiddleware
     */
    static createTestToken(userId: bigint): string {
        return jwt.sign(
            { 
                id: userId.toString(),
                tokenVersion: 0 
            }, 
            JWT_SECRET_KEY || "secret", 
            { expiresIn: "1h" }
        );
    }

    static async createTestSession(userId: bigint) {
        const session = await prismaClient.session.create({
            data: {
                title: "Gauntlet Session",
                mode: "SOLO",
                status: "PLANNED",
                visibility: "PUBLIC",
                maxParticipants: 10,
                stepTarget: 1000,
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                creatorId: userId
            }
        });

        // Auto-join the creator
        await prismaClient.sessionParticipant.create({
            data: {
                sessionId: session.id,
                userId: userId,
                status: "JOINED",
                isAdmin: true
            }
        });

        return session;
    }
}