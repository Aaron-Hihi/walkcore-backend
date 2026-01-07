-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('AVATAR', 'FRAME', 'BACKGROUND', 'CONSUMABLE');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('TOTAL_STEPS', 'TOTAL_DISTANCE', 'TOTAL_CALORIES', 'TOTAL_SESSIONS', 'LONGEST_STREAK');

-- CreateTable
CREATE TABLE "User_Item" (
    "id" SERIAL NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "isEquipped" BOOLEAN NOT NULL,
    "userId" BIGINT NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "User_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop_Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Shop_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Achievement" (
    "id" SERIAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" BIGINT NOT NULL,
    "achievementId" INTEGER NOT NULL,

    CONSTRAINT "User_Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirementType" "RequirementType" NOT NULL,
    "requirementValue" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop_Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Achievement" ADD CONSTRAINT "User_Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Achievement" ADD CONSTRAINT "User_Achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
