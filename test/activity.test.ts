/**
 * UNIT TEST: USER DAILY ACTIVITY
 * Location: test/activity.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import supertest from "supertest";
import { app } from "../src/main";
import { TestUtil } from "./test-util";
import { prismaClient } from "../src/utils/database-util";

describe("POST /walkcore-backend/activities/sync", () => {
    let token: string;
    let userId: bigint;

    /**
     * Test Setup: Clean database and prepare authenticated user with biometrics
     */
    beforeEach(async () => {
        try {
            await TestUtil.cleanAll();
            const user = await TestUtil.createTestUser();
            userId = user.id;
            token = TestUtil.createTestToken(userId);
        } catch (error) {
            console.error("Test Setup Failed:", error);
            throw error;
        }
    });

    /**
     * Test Cleanup: Final database wipe and disconnect
     */
    afterAll(async () => {
        try {
            await TestUtil.cleanAll();
            await prismaClient.$disconnect();
        } catch (error) {
            console.error("Test Cleanup Failed:", error);
        }
    });

    /**
     * Scenario: Successful initial synchronization
     */
    it("should be able to sync steps for the first time", async () => {
        const response = await supertest(app)
            .post("/walkcore-backend/activities/sync")
            .set("Authorization", `Bearer ${token}`)
            .send({ steps: 500 });

        // Debugging helper
        if (response.status !== 200) {
            console.log("FULL RESPONSE:", JSON.stringify(response.body, null, 2));
        }

        expect(response.status).toBe(200);
        
        // Sesuai dengan Controller: res.json({ data: { todayTotalSteps: result.stepsWalked } })
        const stepsReceived = response.body.data.todayTotalSteps;
        
        expect(stepsReceived).toBeDefined();
        expect(Number(stepsReceived)).toBe(500);

        // Verifikasi Database (Bukti paling valid)
        const user = await prismaClient.user.findUnique({ where: { id: userId } });
        expect(user?.totalSteps.toString()).toBe("500");
    });

    /**
     * Scenario: Anti-cheat protection against impossible step increases
     */
    it("should reject sync if steps increase is physically impossible (Anti-Cheat)", async () => {
        // First sync (Initial)
        await supertest(app)
            .post("/walkcore-backend/activities/sync")
            .set("Authorization", `Bearer ${token}`)
            .send({ steps: 100 });

        // Second sync (Impossible jump in milliseconds)
        const response = await supertest(app)
            .post("/walkcore-backend/activities/sync")
            .set("Authorization", `Bearer ${token}`)
            .send({ steps: 50000 });

        expect(response.status).toBe(400);
        
        // Controller menggunakan next(e) -> errorMiddleware mengembalikan { errors: "..." } atau { error: "..." }
        const errorMessage = response.body.error || response.body.errors;
        expect(errorMessage).toBeDefined();
        expect(errorMessage).toContain("Unnatural step activity detected");
    });
});