/*
  Warnings:

  - You are about to drop the column `category` on the `Request` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Request_category_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Request_categoryId_idx" ON "Request"("categoryId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
