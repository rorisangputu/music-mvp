// app/api/playlists/list/route.ts
import db from "@/db/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const playlists = await db.playlist.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        coverColor: true,
        trackIds: true,
      }
    });

    // Add track count to each playlist
    const playlistsWithCount = playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      coverColor: playlist.coverColor,
      trackCount: playlist.trackIds.length
    }));

    return NextResponse.json({ 
      success: true,
      playlists: playlistsWithCount 
    });

  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { message: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}