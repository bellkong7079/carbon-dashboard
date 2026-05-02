-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "emissionFactor" REAL NOT NULL,
    "emission" REAL NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmissionFactorVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emissionFactorId" TEXT NOT NULL,
    "factor" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmissionFactorVersion_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
