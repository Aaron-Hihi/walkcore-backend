/*
  Warnings:

  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isOpen` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `customer_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerId",
DROP COLUMN "restaurantId",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
ADD COLUMN     "restaurant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "isOpen",
ADD COLUMN     "is_open" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
