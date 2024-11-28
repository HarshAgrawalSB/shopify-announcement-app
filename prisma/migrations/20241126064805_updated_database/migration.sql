/*
  Warnings:

  - You are about to drop the column `customText` on the `announcement` table. All the data in the column will be lost.
  - Added the required column `data` to the `announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcement" DROP COLUMN "customText",
ADD COLUMN     "data" JSONB NOT NULL;
