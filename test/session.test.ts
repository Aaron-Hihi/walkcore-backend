/**
 * UNIT TEST: SESSION MANAGEMENT
 * Location: test/session.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import supertest from "supertest";
import { app } from "../src/main";
import { TestUtil } from "./test-util";
import { prismaClient } from "../src/utils/database-util";

describe("POST /walkcore-backend/sessions", () => {
    let token: string;
    let userId: bigint;

    beforeEach(async () => {
        await TestUtil.cleanAll();
        const user = await TestUtil.createTestUser();
        userId = user.id;
        token = TestUtil.createTestToken(userId);
    });

    afterAll(async () => {
        await TestUtil.cleanAll();
        await prismaClient.$disconnect();
    });

    it("should be able to create a new session", async () => {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);

        const response = await supertest(app)
            .post("/walkcore-backend/sessions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Morning Walk Together",
                description: "Let's burn some calories",
                startTime: startTime.toISOString(),
                endTime: new Date(startTime.getTime() + 3600000).toISOString(), // Added endTime (required)
                mode: "REMOTE",
                visibility: "PUBLIC",
                maxParticipants: 10,
                stepTarget: 5000
            });

        if (response.status !== 201) {
            console.log("Create Session Error:", response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body.data.title).toBe("Morning Walk Together");
    });
});