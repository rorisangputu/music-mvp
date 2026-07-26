// app/api/admin/albums/create/route.ts

import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      album: {
        title: string;
        composer: string;
        category: string;
        genre: string;
        description: string;
        releaseDate: string;
        mood: string[];
        featured?: boolean;
        coverImage: string;
        cueSheet?: string;
        trackCount: number;
      };
      tracks: Array<{
        title: string;
        trackNumber: number;
        composer: string;
        genre: string;
        subGenre?: string;
        category: string;
        mood: string[];
        energy: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
        bpm: number;
        musicalKey?: string;
        instruments: string[];
        vocals: "NONE" | "MALE" | "FEMALE" | "CHOIR" | "SPOKEN_WORD" | "CHANT" | "AD_LIBS_ONLY";
        vocalLanguage?: string;
        featuredInstrument?: string;
        usageTags: string[];
        downloadable: boolean;
        licenseTier: "FREE" | "STANDARD" | "PREMIUM" | "EXCLUSIVE";
        version: "FULL_MIX" | "UNDERSCORE" | "STEMS" | "EDIT_60" | "EDIT_30" | "STING" | "LOOP";
        exclusive?: boolean;
        featured?: boolean;
        newRelease?: boolean;
        tags?: string[];
        audioUrl: string;
        duration: number;
      }>;
    };

    const { album, tracks } = body;

    // Validate required fields
    if (!album.title || !album.coverImage || !album.category || !album.genre) {
      return NextResponse.json(
        { error: "Missing required album fields: title, coverImage, category, genre" },
        { status: 400 }
      );
    }

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: "At least one track is required" },
        { status: 400 }
      );
    }

    // Run everything in a single transaction
    // If any step fails, nothing is saved
    const result = await db.$transaction(async (tx) => {

      // 1. Create the album
      const createdAlbum = await tx.album.create({
        data: {
          title:       album.title,
          description: album.description,
          category:    album.category,
          genre:       album.genre,
          composer:    album.composer,
          coverImage:  album.coverImage,
          releaseDate: album.releaseDate || null,
          mood:        album.mood ?? [],
          cueSheet:    album.cueSheet ?? null,
          featured:    album.featured ?? false,
          trackCount:  tracks.length,
        },
      });

      // 2. Create all tracks referencing the new album
      await tx.track.createMany({
        data: tracks.map((t) => ({
          title:              t.title,
          composer:           t.composer,
          trackNumber:        t.trackNumber,
          duration:           t.duration,
          version:            t.version      ?? "FULL_MIX",
          isrc:               null,
          releaseDate:        album.releaseDate ?? null,
          genre:              t.genre,
          subGenre:           t.subGenre        ?? null,
          mood:               t.mood            ?? [],
          energy:             t.energy          ?? "MEDIUM",
          bpm:                t.bpm             ?? 0,
          musicalKey:         t.musicalKey      ?? null,
          instruments:        t.instruments     ?? [],
          vocals:             t.vocals          ?? "NONE",
          vocalLanguage:      t.vocalLanguage   ?? null,
          featuredInstrument: t.featuredInstrument ?? null,
          category:           t.category,
          usageTags:          t.usageTags       ?? [],
          downloadable:       t.downloadable    ?? false,
          licenseTier:        t.licenseTier     ?? "FREE",
          exclusive:          t.exclusive       ?? false,
          cueSheetUrl:        null,
          audioUrl:           t.audioUrl,
          waveformUrl:        null,
          playCount:          0,
          downloadCount:      0,
          featured:           t.featured        ?? false,
          newRelease:         t.newRelease      ?? false,
          tags:               t.tags            ?? [],
          albumId:            createdAlbum.id,
        })),
      });

      return { albumId: createdAlbum.id };
    });

    console.log("Album created:", result.albumId, "with", tracks.length, "tracks");

    return NextResponse.json({
      success: true,
      albumId: result.albumId,
    });

  } catch (err) {
    console.error("Album create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}