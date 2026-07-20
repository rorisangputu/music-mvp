// app/api/tracks/play/route.ts
import db from "@/db/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { trackId } = await req.json() as { trackId: string };

    if (!trackId) {
      return NextResponse.json({ error: "trackId is required" }, { status: 400 });
    }

    const track = await db.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    await db.track.update({
      where: { id: trackId },
      data:  { playCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("play route error:", error);
    return NextResponse.json(
      { error: "Failed to record play" },
      { status: 500 }
    );
  }
}