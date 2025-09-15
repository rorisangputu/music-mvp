import db from "@/db/db";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { trackId, title, url  } = await req.json();

    const track = await db.track.findUnique({
        where: {id: trackId}
    })

    if(!track){
        await db.track.create({
            data: {
              id: trackId,
              title: title,
              audio_url: url,
              play_count: 1,
              downloadCount: 0,
            }
        })
    }else{
        await db.track.update({
            where: { id: trackId },
            data: { play_count: { increment: 1 } },
        });
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Track not found or update failed" }, { status: 400 });
  }
}