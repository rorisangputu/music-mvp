import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") ?? "track.mp3";

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url" }), { status: 400 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Upstream fetch failed" }), { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
    const contentLength = upstream.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    console.error("Download proxy error:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch file" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { trackId, title, url } = await req.json();
    console.log("Track download logged:", { trackId, title, url });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400 });
  }
}