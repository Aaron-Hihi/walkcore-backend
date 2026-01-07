/**
 * UNIT TEST: SESSION PARTICIPATION (JOIN & CONFLICT)
 * Location: test/session-join.test.ts
 */
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import supertest from "supertest";
import { app } from "../src/main";
import { TestUtil } from "./test-util";
import { prismaClient } from "../src/utils/database-util";

describe("POST /walkcore-backend/sessions/:sessionId/participants", () => {
    let token: string;
    let userId: bigint;

    /**
     * Setup: Clean DB and prepare authenticated user
     */
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

    /**
     * Scenario: User joins a session successfully
     */
    it("should be able to join a public session", async () => {
        const host = await prismaClient.user.create({
            data: { 
                username: "hoster", 
                email: "host@test.com", 
                password: "pwd", 
                tokenVersion: 0,
                gender: "MALE",
                height: 175,
                weight: 70
            }
        });
        
        const session = await prismaClient.session.create({
            data: {
                title: "Public Walk",
                startTime: new Date(Date.now() + 3600000),
                endTime: new Date(Date.now() + 7200000),
                visibility: "PUBLIC",
                creatorId: host.id,
                status: "PLANNED",
                mode: "REMOTE",         // Properti wajib
                maxParticipants: 10,     // Properti wajib
                stepTarget: 5000         // Properti wajib
            }
        });

        const response = await supertest(app)
            .post(`/walkcore-backend/sessions/${session.id}/participants`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(201);
    });

    /**
     * Scenario: Prevent joining if schedules overlap (Conflict)
     */
    it("should reject joining if user has another session at the same time", async () => {
        const now = Date.now();
        
        // 1. Setup Session A (User sebagai creator/host)
        const sessionA = await prismaClient.session.create({
            data: {
                title: "Session A",
                startTime: new Date(now + 3600000), 
                endTime: new Date(now + 7200000),
                creatorId: userId,
                status: "PLANNED",
                mode: "REMOTE",
                maxParticipants: 5,
                stepTarget: 1000
            }
        });

        // Pastikan user terdaftar di Session A
        await prismaClient.sessionParticipant.create({
            data: { sessionId: sessionA.id, userId, status: "JOINED" }
        });

        // 2. Setup Session B (Oleh host lain, waktu bentrok dengan A)
        const otherHost = await prismaClient.user.create({
            data: { 
                username: "other", 
                email: "other@test.com", 
                password: "pwd", 
                tokenVersion: 0,
                gender: "FEMALE",
                height: 160,
                weight: 50
            }
        });

        const sessionB = await prismaClient.session.create({
            data: {
                title: "Session B (Overlap)",
                startTime: new Date(now + 5400000), // Bentrok dengan Session A
                endTime: new Date(now + 9000000),
                creatorId: otherHost.id,
                status: "PLANNED",
                mode: "REMOTE",
                maxParticipants: 5,
                stepTarget: 1000
            }
        });

        // 3. Action: Coba join Session B
        const response = await supertest(app)
            .post(`/walkcore-backend/sessions/${sessionB.id}/participants`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        const errorMsg = response.body.error || response.body.errors;
        expect(errorMsg.toLowerCase()).toContain("conflict");
    });
});