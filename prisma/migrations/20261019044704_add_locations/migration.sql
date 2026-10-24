/*
  Warnings:

  - You are about to drop the column `city` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `User` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Request_country_province_city_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "province",
ADD COLUMN     "cityId" TEXT NOT NULL,
ADD COLUMN     "countryId" TEXT DEFAULT '',
ADD COLUMN     "provinceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "province",
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "countryId" TEXT DEFAULT '',
ADD COLUMN     "provinceId" TEXT;

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provinceId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_countryId_key" ON "Province"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_provinceId_key" ON "City"("name", "provinceId");

-- CreateIndex
CREATE INDEX "Request_provinceId_cityId_idx" ON "Request"("provinceId", "cityId");

-- AddForeignKey
ALTER TABLE "Province" ADD CONSTRAINT "Province_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
