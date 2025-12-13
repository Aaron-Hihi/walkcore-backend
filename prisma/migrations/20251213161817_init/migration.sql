-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('SOLO', 'REMOTE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ONGOING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'FRIENDONLY', 'INVITEONLY');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('JOINED', 'LEFT', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "height" DECIMAL(10,2),
    "weight" DECIMAL(10,2),
    "currency" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" BIGINT NOT NULL DEFAULT 0,
    "totalDistance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalActiveTime" INTEGER NOT NULL DEFAULT 0,
    "totalSessionTime" INTEGER NOT NULL DEFAULT 0,
    "totalSessionCount" INTEGER NOT NULL DEFAULT 0,
    "totalCaloriesBurned" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDailyActivity" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "stepsWalked" INTEGER NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "activeTime" INTEGER NOT NULL,
    "sessionTime" INTEGER NOT NULL,
    "sessionCount" INTEGER NOT NULL,
    "caloriesBurned" INTEGER NOT NULL,
    "currencyEarned" INTEGER NOT NULL,

    CONSTRAINT "UserDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" BIGSERIAL NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" "SessionMode" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "maxParticipants" INTEGER NOT NULL,
    "stepTarget" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "startLat" DECIMAL(10,7),
    "startLong" DECIMAL(10,7),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" BIGSERIAL NOT NULL,
    "sessionId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "status" "ParticipantStatus" NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "stepTarget" INTEGER,
    "totalSteps" INTEGER,
    "joinTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaveTime" TIMESTAMP(3),
    "currencyEarned" INTEGER,
    "caloriesBurned" INTEGER,
    "approxDistanceKm" DECIMAL(65,30),

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyActivity_userId_date_key" ON "UserDailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_userId_key" ON "SessionParticipant"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "UserDailyActivity" ADD CONSTRAINT "UserDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
