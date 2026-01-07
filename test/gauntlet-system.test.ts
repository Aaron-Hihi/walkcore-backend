import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import supertest from "supertest";
import { app } from "../src/main";
import { TestUtil } from "./test-util";
import { prismaClient } from "../src/utils/database-util";

/*
 * TEST SUITE SETUP
 * Prepares users, tokens, and master achievement data before each test case
 */
describe("THE GAUNTLET: 24 Critical Test Cases", () => {
    let token: string;
    let userId: bigint;
    let otherToken: string;
    let otherUserId: bigint;

    beforeEach(async () => {
        await TestUtil.cleanAll();
        const user = await TestUtil.createTestUser();
        userId = user.id;
        token = TestUtil.createTestToken(userId);

        const otherUser = await prismaClient.user.create({
            data: { username: "guest", email: "guest@test.com", password: "pwd", tokenVersion: 0 }
        });
        otherUserId = otherUser.id;
        otherToken = TestUtil.createTestToken(otherUserId);

        await prismaClient.achievement.createMany({
            data: [
                { title: "Session Pro", description: "First session", requirementType: "TOTAL_SESSIONS", requirementValue: 1, reward: 100 },
                { title: "Step Master", description: "5k steps", requirementType: "TOTAL_STEPS", requirementValue: 5000, reward: 200 }
            ]
        });
    });

    afterAll(async () => {
        await TestUtil.cleanAll();
        await prismaClient.$disconnect();
    });

    /*
     * PART 1: SESSION MANAGEMENT
     * Validates session creation, state transitions, and access control
     */
    it("1. Should create session successfully", async () => {
        const res = await supertest(app).post("/walkcore-backend/sessions").set("Authorization", `Bearer ${token}`)
            .send({ title: "Test", mode: "SOLO", visibility: "PUBLIC", maxParticipants: 10, stepTarget: 1000, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() });
        expect(res.status).toBe(201);
    });

    it("2. Should fail if endTime is before startTime", async () => {
        const res = await supertest(app).post("/walkcore-backend/sessions").set("Authorization", `Bearer ${token}`)
            .send({ title: "Bad Time", mode: "SOLO", visibility: "PUBLIC", maxParticipants: 5, stepTarget: 100, startTime: "2026-01-10T10:00:00Z", endTime: "2026-01-10T09:00:00Z" });
        expect(res.status).toBe(400);
    });

    it("3. Should update session when status is PLANNED", async () => {
        const session = await TestUtil.createTestSession(userId);
        const res = await supertest(app).patch(`/walkcore-backend/sessions/${session.id}`).set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated Title" });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Title");
    });

    it("4. Should fail to change title if status is ONGOING", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        const res = await supertest(app).patch(`/walkcore-backend/sessions/${session.id}`).set("Authorization", `Bearer ${token}`)
            .send({ title: "Illegal Change" });
        expect(res.status).toBe(400);
    });

    it("5. Should transition status: PLANNED -> ONGOING -> FINISHED", async () => {
        const session = await TestUtil.createTestSession(userId);
        await supertest(app).patch(`/walkcore-backend/sessions/${session.id}`).set("Authorization", `Bearer ${token}`).send({ status: "ONGOING" });
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    it("6. Should fail finish session if status is PLANNED", async () => {
        const session = await TestUtil.createTestSession(userId);
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    it("7. Should respect INVITEONLY visibility", async () => {
        const session = await prismaClient.session.create({ data: { title: "Private", mode: "SOLO", visibility: "INVITEONLY", maxParticipants: 5, stepTarget: 1000, startTime: new Date(), endTime: new Date(), creatorId: userId } });
        const res = await supertest(app).get(`/walkcore-backend/sessions/${session.id}`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    /*
     * PART 2: PARTICIPANTS
     * Handles joining logic, capacity limits, and step updates
     */
    it("8. Should join session as participant", async () => {
        const session = await TestUtil.createTestSession(userId);
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/participants`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(201);
    });

    it("9. Should prevent joining if session is FULL", async () => {
        const session = await prismaClient.session.create({ data: { title: "Full", mode: "REMOTE", visibility: "PUBLIC", maxParticipants: 1, stepTarget: 100, startTime: new Date(), endTime: new Date(), creatorId: userId } });
        await prismaClient.sessionParticipant.create({ data: { sessionId: session.id, userId: userId, status: "JOINED" } });
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/participants`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(400);
    });

    it("10. Should prevent joining same session twice", async () => {
        const session = await TestUtil.createTestSession(userId);
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/participants`).set("Authorization", `Bearer ${otherToken}`);
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/participants`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(400);
    });

    it("11. Should allow re-joining after leaving", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.sessionParticipant.create({ data: { sessionId: session.id, userId: otherUserId, status: "LEFT" } });
        const res = await supertest(app).post(`/walkcore-backend/sessions/${session.id}/participants`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(201);
    });

    it("12. Should update totalSteps in session", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        const res = await supertest(app).patch(`/walkcore-backend/sessions/${session.id}/participants/step`).set("Authorization", `Bearer ${token}`).send({ steps: 500 });
        expect(res.status).toBe(200);
    });

    /*
     * PART 3: LEADERBOARD
     * Validates data sorting and BigInt to string serialization
     */
    it("13. Should return sorted leaderboard", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.sessionParticipant.updateMany({ where: { sessionId: session.id }, data: { totalSteps: 1000 } });
        const res = await supertest(app).get(`/walkcore-backend/sessions/${session.id}/leaderboard`).set("Authorization", `Bearer ${token}`);
        expect(res.body.data[0].totalSteps).toBe(1000);
    });

    it("14. Should handle BigInt in leaderboard", async () => {
        const session = await TestUtil.createTestSession(userId);
        const res = await supertest(app).get(`/walkcore-backend/sessions/${session.id}/leaderboard`).set("Authorization", `Bearer ${token}`);
        expect(typeof res.body.data[0].userId).toBe("string");
    });

    it("15. Should block non-participants from leaderboard", async () => {
        const session = await TestUtil.createTestSession(userId);
        const res = await supertest(app).get(`/walkcore-backend/sessions/${session.id}/leaderboard`).set("Authorization", `Bearer ${otherToken}`);
        expect(res.status).toBe(403);
    });

    /*
     * PART 4: ACTIVITY SYNC
     * Tests daily activity logging and incremental step logic
     */
    it("16. Should sync daily steps", async () => {
        const res = await supertest(app).post("/walkcore-backend/activities/sync").set("Authorization", `Bearer ${token}`).send({ steps: 1000, distance: 1.0, calories: 50, date: "2026-01-07" });
        expect(res.status).toBe(200);
    });

    it("17. Should fail sync with bad date", async () => {
        const res = await supertest(app).post("/walkcore-backend/activities/sync").set("Authorization", `Bearer ${token}`).send({ steps: 100, date: "bad-date" });
        expect(res.status).toBe(400);
    });

    it("18. Should calculate calories correctly", async () => {
        const res = await supertest(app).post("/walkcore-backend/activities/sync").set("Authorization", `Bearer ${token}`).send({ steps: 2000, distance: 1.5, calories: 120, date: "2026-01-08" });
        expect(res.body.data.caloriesBurned).toBe(120);
    });

    it("19. Should increment steps on multiple syncs", async () => {
        await supertest(app).post("/walkcore-backend/activities/sync").set("Authorization", `Bearer ${token}`).send({ steps: 1000, date: "2026-01-09" });
        const res = await supertest(app).post("/walkcore-backend/activities/sync").set("Authorization", `Bearer ${token}`).send({ steps: 500, date: "2026-01-09" });
        expect(res.body.data.stepsWalked).toBe(1500);
    });

    /*
     * PART 5: ACHIEVEMENTS
     * Validates automated unlocks, rewards, and duplicate prevention
     */
    it("20. Should unlock SESSION achievement on finish", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        const ach = await prismaClient.userAchievement.findFirst({ where: { userId: userId, isCompleted: true } });
        expect(ach).not.toBeNull();
    });

    it("21. Should unlock STEP achievement", async () => {
        await prismaClient.user.update({ where: { id: userId }, data: { totalSteps: 5000 } });
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        const ach = await prismaClient.userAchievement.findFirst({ where: { userId: userId, achievement: { title: "Step Master" }, isCompleted: true } });
        expect(ach).not.toBeNull();
    });

    it("22. Should award currency on unlock", async () => {
        const startUser = await prismaClient.user.findUnique({ where: { id: userId } });
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        const endUser = await prismaClient.user.findUnique({ where: { id: userId } });
        expect(endUser!.currency).toBeGreaterThan(startUser!.currency);
    });

    it("23. Should award reward from steps", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.sessionParticipant.updateMany({ where: { sessionId: session.id }, data: { totalSteps: 1000 } });
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        const user = await prismaClient.user.findUnique({ where: { id: userId } });
        expect(user!.currency).toBeGreaterThanOrEqual(10);
    });

    it("24. Should not unlock same achievement twice", async () => {
        const session = await TestUtil.createTestSession(userId);
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`);
        const firstCount = await prismaClient.userAchievement.count({ where: { userId: userId, isCompleted: true } });
        await prismaClient.session.update({ where: { id: session.id }, data: { status: "ONGOING" } });
        await supertest(app).post(`/walkcore-backend/sessions/${session.id}/finish`).set("Authorization", `Bearer ${token}`).expect(400);
        const secondCount = await prismaClient.userAchievement.count({ where: { userId: userId, isCompleted: true } });
        expect(firstCount).toBe(secondCount);
    });
});