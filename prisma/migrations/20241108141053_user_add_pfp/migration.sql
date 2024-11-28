/*
  Warnings:

  - You are about to drop the column `title` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "File_title_createdAt_id_idx";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "profilePicture" TEXT;

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE INDEX "File_name_createdAt_id_idx" ON "File"("name", "createdAt", "id");
