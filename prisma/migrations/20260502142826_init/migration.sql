-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "emissionFactor" DOUBLE PRECISION NOT NULL,
    "emission" DOUBLE PRECISION NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmissionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactorVersion" (
    "id" TEXT NOT NULL,
    "emissionFactorId" TEXT NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmissionFactorVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_activityType_idx" ON "Activity"("activityType");

-- CreateIndex
CREATE INDEX "Activity_date_idx" ON "Activity"("date");

-- CreateIndex
CREATE INDEX "Activity_scope_idx" ON "Activity"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "EmissionFactor_key_key" ON "EmissionFactor"("key");

-- CreateIndex
CREATE INDEX "EmissionFactorVersion_emissionFactorId_idx" ON "EmissionFactorVersion"("emissionFactorId");

-- CreateIndex
CREATE INDEX "EmissionFactorVersion_validFrom_idx" ON "EmissionFactorVersion"("validFrom");

-- AddForeignKey
ALTER TABLE "EmissionFactorVersion" ADD CONSTRAINT "EmissionFactorVersion_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
