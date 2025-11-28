// app/api/playlists/[playlistId]/route.ts
import db from "@/db/db";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const { playlistId } = await params;

    const playlist = await db.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { message: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      playlist
    });

  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { message: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}