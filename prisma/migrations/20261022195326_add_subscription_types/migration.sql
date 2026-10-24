/*
  Warnings:

  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('BASIC', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "credits",
ADD COLUMN     "monthlyContacts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionType" "SubscriptionType" NOT NULL DEFAULT 'BASIC';
