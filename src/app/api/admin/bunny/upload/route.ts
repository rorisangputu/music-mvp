// app/api/admin/bunny/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

const BUNNY_STORAGE_ZONE     = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD!;
const BUNNY_CDN_HOSTNAME     = process.env.BUNNY_CDN_HOSTNAME!;
// Johannesburg primary region endpoint
const BUNNY_STORAGE_ENDPOINT = process.env.BUNNY_STORAGE_ENDPOINT ?? "https://jh.storage.bunnycdn.com";

if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_CDN_HOSTNAME) {
  throw new Error(
    "Missing Bunny.net env vars. Set BUNNY_STORAGE_ZONE, BUNNY_STORAGE_PASSWORD, and BUNNY_CDN_HOSTNAME in .env.local"
  );
}
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export const maxDuration = 300;
// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitiseFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")  // replace anything weird with a dash
    .replace(/-+/g, "-")              // collapse multiple dashes
    .replace(/^-|-$/g, "");           // trim leading/trailing dashes
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3:  "audio/mpeg",
    wav:  "audio/wav",
    aif:  "audio/aiff",
    aiff: "audio/aiff",
    flac: "audio/flac",
    m4a:  "audio/mp4",
    ogg:  "audio/ogg",
    // images
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
    // documents
    pdf:  "application/pdf",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const folder   = (formData.get("folder") as string) ?? "tracks"; // tracks | covers | cueSheets
    const albumFolder = (formData.get("albumFolder") as string) ?? "uncategorized";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Build a unique filename — {timestamp}-{sanitised-original-name}
    const timestamp     = Date.now();
    const safeName      = sanitiseFilename(file.name);
    const safeAlbumFolder = sanitiseFilename(albumFolder);
    const uniqueName    = `${timestamp}-${safeName}`;
    const uploadPath = `${folder}/${safeAlbumFolder}/${uniqueName}`;
    const contentType   = getContentType(file.name);

    // Convert File → ArrayBuffer → Buffer for streaming to Bunny
    

    const uploadUrl = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${uploadPath}`;

   const bunnyRes = await fetch(uploadUrl, {
    method:  "PUT",
    headers: {
      AccessKey:        BUNNY_STORAGE_PASSWORD,
      "Content-Type":   contentType,
      
    },
    body: file.stream() as unknown as BodyInit,
    // @ts-ignore
    duplex: "half",
  });

    if (!bunnyRes.ok) {
      const errText = await bunnyRes.text();
      console.error("Bunny upload error:", bunnyRes.status, errText);
      return NextResponse.json(
        { error: `Bunny upload failed: ${bunnyRes.status} ${errText}` },
        { status: 500 }
      );
    }

    // Build the CDN URL
    const cdnUrl = `${BUNNY_CDN_HOSTNAME}/${uploadPath}`;

    return NextResponse.json({
      success:  true,
      url:      cdnUrl,
      filename: uniqueName,
      folder,
      size:     file.size
    });

  } catch (err) {
    console.error("Bunny upload route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE — remove a file from Bunny ────────────────────────────────────────
// Pass { path: "tracks/filename.mp3" } in the body to delete a specific file

export async function DELETE(req: NextRequest) {
  try {
    const { path } = await req.json() as { path: string };

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const deleteUrl = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${path}`;

    const bunnyRes = await fetch(deleteUrl, {
      method:  "DELETE",
      headers: { AccessKey: BUNNY_STORAGE_PASSWORD },
    });

    if (!bunnyRes.ok) {
      return NextResponse.json(
        { error: `Delete failed: ${bunnyRes.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: path });

  } catch (err) {
    console.error("Bunny delete route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}