import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import supertest from "supertest";
import { app } from "../src/main";
import { TestUtil } from "./test-util";
import { prismaClient } from "../src/utils/database-util";

describe("GET /walkcore-backend/sessions/:sessionId/leaderboard", () => {
    let token: string;
    let userId: bigint;
    let sessionId: bigint;

    beforeEach(async () => {
        await TestUtil.cleanAll();
        const user = await TestUtil.createTestUser();
        userId = user.id;
        token = TestUtil.createTestToken(userId);

        const session = await prismaClient.session.create({
            data: {
                title: "Race to 10k",
                mode: "REMOTE",
                visibility: "PUBLIC",
                maxParticipants: 10,
                stepTarget: 10000,
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                creatorId: userId,
                status: "ONGOING"
            }
        });
        sessionId = session.id;

        // Tambahkan 2 partisipan tambahan dengan jumlah langkah berbeda
        const user2 = await prismaClient.user.create({
            data: { username: "user2", email: "u2@test.com", password: "pwd", tokenVersion: 0 }
        });
        const user3 = await prismaClient.user.create({
            data: { username: "user3", email: "u3@test.com", password: "pwd", tokenVersion: 0 }
        });

        await prismaClient.sessionParticipant.createMany({
            data: [
                { sessionId, userId: userId, totalSteps: 1000, status: "JOINED" },
                { sessionId, userId: user2.id, totalSteps: 5000, status: "JOINED" },
                { sessionId, userId: user3.id, totalSteps: 3000, status: "JOINED" }
            ]
        });
    });

    afterAll(async () => {
        await TestUtil.cleanAll();
        await prismaClient.$disconnect();
    });

    it("should return participants ranked by totalSteps descending", async () => {
        const response = await supertest(app)
            .get(`/walkcore-backend/sessions/${sessionId}/leaderboard`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(3);
        
        // Peringkat 1 harus user2 (5000 steps)
        expect(response.body.data[0].totalSteps).toBe(5000);
        expect(response.body.data[0].user.username).toBe("user2");
        
        // Peringkat terakhir harus user1 (1000 steps)
        expect(response.body.data[2].totalSteps).toBe(1000);
    });
});