import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest) {
    try {
        const LatestAlbums = await db.album.findMany({
            orderBy: {createdAt: "asc"}
        });
        
        return NextResponse.json({ albums: LatestAlbums });
    } catch (error) {
        console.error("GET /api/albums error:", error)
        return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
    }
}