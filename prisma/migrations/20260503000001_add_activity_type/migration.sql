-- CreateTable
CREATE TABLE "ActivityType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_key_key" ON "ActivityType"("key");

-- AlterTable: add activityType to EmissionFactor
ALTER TABLE "EmissionFactor" ADD COLUMN "activityType" TEXT NOT NULL DEFAULT 'electricity';

-- Update existing rows based on key prefix
UPDATE "EmissionFactor" SET "activityType" = 'electricity', "name" = '한국전력'   WHERE "key" = 'electricity_kepco';
UPDATE "EmissionFactor" SET "activityType" = 'material',    "name" = '플라스틱 1' WHERE "key" = 'material_plastic1';
UPDATE "EmissionFactor" SET "activityType" = 'material',    "name" = '플라스틱 2' WHERE "key" = 'material_plastic2';
UPDATE "EmissionFactor" SET "activityType" = 'transport',   "name" = '트럭'       WHERE "key" = 'transport_truck';
