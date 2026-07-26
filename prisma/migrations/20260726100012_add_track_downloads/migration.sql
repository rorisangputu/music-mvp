/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `bitrate` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `Track` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DownloadFormat" AS ENUM ('MP3', 'WAV', 'AIFF');

-- AlterTable
ALTER TABLE "public"."Track" DROP COLUMN "audioUrl",
DROP COLUMN "bitrate",
DROP COLUMN "fileSize",
DROP COLUMN "format";

-- CreateTable
CREATE TABLE "public"."TrackDownload" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "format" "public"."DownloadFormat" NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER,
    "bitrate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackDownload_trackId_idx" ON "public"."TrackDownload"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackDownload_trackId_format_key" ON "public"."TrackDownload"("trackId", "format");

-- AddForeignKey
ALTER TABLE "public"."TrackDownload" ADD CONSTRAINT "TrackDownload_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
