
import db from "@/db/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const id= session.user.id as string;

        // Find user in DB
        const user = await db.user.findUnique({ where: { id: id } });
        if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = user.id;

        const { trackId, title, url } = await req.json();
        const track = await db.track.findUnique({
            where: {id: trackId}
        });

        if(!track){
            await db.track.create({
                data: {
                    id: trackId,
                    title: title,
                    audio_url: url,
                    play_count: 0,
                    downloadCount: 1,
                }
            })
        }else{
            await db.track.update({
                where: {id: trackId},
                data: {downloadCount: {increment: 1}}
            });
        }

        // Record the user download
        await db.download.create({
            data: { trackId, userId },
        });

        return NextResponse.json({track: track}, {status: 200},)
    } catch (error) {
        console.error("Updating Track Model error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}