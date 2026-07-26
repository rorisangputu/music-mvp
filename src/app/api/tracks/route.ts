// app/api/tracks/route.ts
import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const tracks = await db.track.findMany({
      orderBy: { title: "asc" },
      include: {
        album: {
          select: { coverImage: true, title: true },
        },
      },
    });

    // console.log(tracks)

    // Format duration from seconds to "3:03" and join coverImage from album
    const formatted = tracks.map((t) => ({
      id:                t.id,
      title:             t.title,
      composer:          t.composer,
      trackNumber:       t.trackNumber,
      duration:          fmtDuration(t.duration),
      version:           t.version,
      isrc:              t.isrc,
      releaseDate:       t.releaseDate,
      genre:             t.genre,
      subGenre:          t.subGenre,
      mood:              t.mood,
      energy:            t.energy,
      bpm:               t.bpm,
      musicalKey:        t.musicalKey,
      instruments:       t.instruments,
      vocals:            t.vocals,
      vocalLanguage:     t.vocalLanguage,
      featuredInstrument:t.featuredInstrument,
      category:          t.category,
      usageTags:         t.usageTags,
      downloadable:      t.downloadable,
      licenseTier:       t.licenseTier,
      exclusive:         t.exclusive,
      cueSheetUrl:       t.cueSheetUrl,
      audioUrl:          t.audioUrl,
      previewUrl:        t.previewUrl,
      waveformUrl:       t.waveformUrl,
      format:            t.format,
      fileSize:          t.fileSize,
      bitrate:           t.bitrate,
      playCount:         t.playCount,
      downloadCount:     t.downloadCount,
      featured:          t.featured,
      newRelease:        t.newRelease,
      tags:              t.tags,
      albumId:           t.albumId,
      createdAt:         t.createdAt.toISOString().split("T")[0],
      updatedAt:         t.updatedAt?.toISOString().split("T")[0] ?? null,
      // Joined from album
      coverImage:        t.album?.coverImage ?? null,
    }));
    console.log(formatted)
    return NextResponse.json({ tracks: formatted });

  } catch (err) {
    console.error("GET /api/tracks error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}

function fmtDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}