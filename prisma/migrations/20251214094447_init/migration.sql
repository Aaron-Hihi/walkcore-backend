/*
  Warnings:

  - You are about to drop the column `approxDistanceKm` on the `SessionParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SessionParticipant" DROP COLUMN "approxDistanceKm",
ADD COLUMN     "approxDistance" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
