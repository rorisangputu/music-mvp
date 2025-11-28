/*
  Warnings:

  - Made the column `coverColor` on table `Playlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Playlist" ADD COLUMN     "targetCategories" TEXT[],
ADD COLUMN     "targetGenres" TEXT[],
ALTER COLUMN "coverColor" SET NOT NULL;
