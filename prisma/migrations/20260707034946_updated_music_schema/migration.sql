/*
  Warnings:

  - You are about to drop the column `targetCategories` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `targetGenres` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `trackIds` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `audio_url` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `play_count` on the `Track` table. All the data in the column will be lost.
  - Added the required column `albumId` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `audioUrl` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bpm` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `composer` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackNumber` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TrackVersion" AS ENUM ('FULL_MIX', 'UNDERSCORE', 'STEMS', 'EDIT_60', 'EDIT_30', 'STING', 'LOOP');

-- CreateEnum
CREATE TYPE "public"."Energy" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "public"."LicenseTier" AS ENUM ('FREE', 'STANDARD', 'PREMIUM', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "public"."VocalType" AS ENUM ('NONE', 'MALE', 'FEMALE', 'CHOIR', 'SPOKEN_WORD', 'CHANT', 'AD_LIBS_ONLY');

-- AlterTable
ALTER TABLE "public"."Playlist" DROP COLUMN "targetCategories",
DROP COLUMN "targetGenres",
DROP COLUMN "trackIds",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "coverColor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Track" DROP COLUMN "audio_url",
DROP COLUMN "play_count",
ADD COLUMN     "albumId" TEXT NOT NULL,
ADD COLUMN     "audioUrl" TEXT NOT NULL,
ADD COLUMN     "bitrate" INTEGER,
ADD COLUMN     "bpm" INTEGER NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "composer" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cueSheetUrl" TEXT,
ADD COLUMN     "downloadable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "energy" "public"."Energy" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "exclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredInstrument" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "genre" TEXT NOT NULL,
ADD COLUMN     "instruments" TEXT[],
ADD COLUMN     "isrc" TEXT,
ADD COLUMN     "licenseTier" "public"."LicenseTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "mood" TEXT[],
ADD COLUMN     "musicalKey" TEXT,
ADD COLUMN     "newRelease" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentTrackId" TEXT,
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "subGenre" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "trackNumber" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usageTags" TEXT[],
ADD COLUMN     "version" "public"."TrackVersion" NOT NULL DEFAULT 'FULL_MIX',
ADD COLUMN     "vocalLanguage" TEXT,
ADD COLUMN     "vocals" "public"."VocalType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "waveformUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."Album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "composer" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "releaseDate" TEXT,
    "mood" TEXT[],
    "cueSheet" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trackCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlaylistTrack" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaylistTrack_playlistId_idx" ON "public"."PlaylistTrack"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_trackId_key" ON "public"."PlaylistTrack"("playlistId", "trackId");

-- CreateIndex
CREATE INDEX "Track_albumId_idx" ON "public"."Track"("albumId");

-- CreateIndex
CREATE INDEX "Track_genre_idx" ON "public"."Track"("genre");

-- CreateIndex
CREATE INDEX "Track_energy_idx" ON "public"."Track"("energy");

-- CreateIndex
CREATE INDEX "Track_bpm_idx" ON "public"."Track"("bpm");

-- CreateIndex
CREATE INDEX "Track_featured_idx" ON "public"."Track"("featured");

-- CreateIndex
CREATE INDEX "Track_newRelease_idx" ON "public"."Track"("newRelease");

-- CreateIndex
CREATE INDEX "Track_downloadable_idx" ON "public"."Track"("downloadable");

-- CreateIndex
CREATE INDEX "Track_category_idx" ON "public"."Track"("category");

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favourite" ADD CONSTRAINT "Favourite_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
