/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Track" DROP COLUMN "previewUrl",
ADD COLUMN     "audioUrl" TEXT;
