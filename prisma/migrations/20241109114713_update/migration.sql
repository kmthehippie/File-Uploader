/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt";

-- CreateIndex
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");
