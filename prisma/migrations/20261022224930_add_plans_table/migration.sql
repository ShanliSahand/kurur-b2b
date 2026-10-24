-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_type_key" ON "Plan"("type");
