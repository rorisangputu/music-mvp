// app/api/playlists/add-track/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLAYLIST_CONFIGS } from "@/scripts/palylistConfig";
import db from "@/db/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    }

    if (session.user.type !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { trackId, playlistId } = await request.json() as {
      trackId: string;
      playlistId: string;
    };

    if (!trackId || !playlistId) {
      return NextResponse.json(
        { message: "trackId and playlistId are required" },
        { status: 400 }
      );
    }

    // Find the playlist config
    const playlistConfig = PLAYLIST_CONFIGS.find((p) => p.id === playlistId);
    if (!playlistConfig) {
      return NextResponse.json(
        { message: "Invalid playlist ID" },
        { status: 400 }
      );
    }

    // Check if playlist exists — create it if not
    let playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      playlist = await db.playlist.create({
        data: {
          id:          playlistId,
          name:        playlistConfig.title,
          description: playlistConfig.description,
          coverColor:  playlistConfig.coverColor || "#6B7280",
        },
      });
    }

    // Check if track is already in the playlist via the join table
    const existing = await db.playlistTrack.findUnique({
      where: {
        playlistId_trackId: { playlistId, trackId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Track already in playlist" },
        { status: 400 }
      );
    }

    // Get current highest position so we append to the end
    const last = await db.playlistTrack.findFirst({
      where:   { playlistId },
      orderBy: { position: "desc" },
      select:  { position: true },
    });

    const nextPosition = (last?.position ?? 0) + 1;

    // Add track to playlist
    await db.playlistTrack.create({
      data: { playlistId, trackId, position: nextPosition },
    });

    return NextResponse.json({
      success:  true,
      message:  "Track added to playlist",
      playlist,
    });

  } catch (error) {
    console.error("Error adding track to playlist:", error);
    return NextResponse.json(
      { message: "Failed to add track to playlist" },
      { status: 500 }
    );
  }
}