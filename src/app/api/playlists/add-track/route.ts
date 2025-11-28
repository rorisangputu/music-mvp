
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from '@/db/db'; // Your Prisma client
import { PLAYLIST_CONFIGS } from "@/scripts/palylistConfig";


export async function POST(request: Request) {
  try {
    const session = await auth();
    if(!session || !session.user){
        return NextResponse.json({message: "Unauthorised"}, {status: 401})
    }
    
    // Check if user is admin
    if (session.user.type !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { trackId, playlistId } = await request.json();

     // Find the playlist config
    const playlistConfig = PLAYLIST_CONFIGS.find(p => p.id === playlistId);
    if (!playlistConfig) {
      return NextResponse.json(
        { message: "Invalid playlist ID" },
        { status: 400 }
      );
    }

      // Check if playlist exists, if not create it
    let playlist = await db.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      // Create the playlist with config data
      playlist = await db.playlist.create({
        data: {
          id: playlistId,
          name: playlistConfig.title,
          description: playlistConfig.description,
          coverColor: playlistConfig.coverColor || "#6B7280",
          trackIds: [trackId], // Initialize with the first track
          targetGenres: playlistConfig.targetGenres,
          targetCategories: playlistConfig.targetCategories,
        }
      });

    return NextResponse.json({ 
        success: true, 
        message: "Playlist created and track added",
        playlist
      });
    }

    // Playlist exists - check if track is already in it
    if (playlist.trackIds.includes(trackId)) {
      return NextResponse.json(
        { message: "Track already in playlist" },
        { status: 400 }
      );
    }

    // Add track to existing playlist
    const updatedPlaylist = await db.playlist.update({
      where: { id: playlistId },
      data: {
        trackIds: {
          push: trackId
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Track added to playlist",
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    return NextResponse.json(
      { message: "Failed to add track to playlist" },
      { status: 500 }
    );
  }
}