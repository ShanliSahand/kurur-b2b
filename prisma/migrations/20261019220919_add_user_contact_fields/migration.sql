-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "countryId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "fixNumber" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "wechat" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ALTER COLUMN "countryId" DROP DEFAULT;
