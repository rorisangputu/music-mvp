// app/api/playlists/list/route.ts
import db from "@/db/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const playlists = await db.playlist.findMany({
      select: {
        id:          true,
        name:        true,
        description: true,
        coverColor:  true,
        _count: {
          select: { tracks: true },
        },
      },
    });

    const formatted = playlists.map((p) => ({
      id:          p.id,
      name:        p.name,
      description: p.description,
      coverColor:  p.coverColor,
      trackCount:  p._count.tracks,
    }));

    return NextResponse.json({ success: true, playlists: formatted });

  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { message: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}