// lib/music-upload.ts

import { ParsedTrack } from "./parseTrackFilename";

export type UploadProgress = {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
};

export type TrackUploadInput = {
  file: File;
  parsed: ParsedTrack;
  // Fields filled in by the admin in the UI
  title: string;
  albumId?: string;          // set after album is created
  trackNumber: number;
  composer: string;
  genre: string;
  subGenre?: string;
  category: string;
  mood: string[];
  energy: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  bpm: number;
  musicalKey?: string;
  instruments: string[];
  vocals: "NONE" | "MALE" | "FEMALE" | "CHOIR" | "SPOKEN_WORD" | "CHANT" | "AD_LIBS_ONLY";
  vocalLanguage?: string;
  featuredInstrument?: string;
  usageTags: string[];
  downloadable: boolean;
  licenseTier: "FREE" | "STANDARD" | "PREMIUM" | "EXCLUSIVE";
  version: "FULL_MIX" | "UNDERSCORE" | "STEMS" | "EDIT_60" | "EDIT_30" | "STING" | "LOOP";
  exclusive?: boolean;
  featured?: boolean;
  newRelease?: boolean;
  tags?: string[];
};

export type AlbumUploadInput = {
  title: string;
  composer: string;
  category: string;
  genre: string;
  description: string;
  releaseDate: string;
  mood: string[];
  featured?: boolean;
};

// ── Upload a single file to Bunny via our API route ───────────────────────────

export async function uploadFileToBunny(
  file: File,
  folder: "tracks" | "covers" | "cueSheets",
  onProgress?: (pct: number) => void
): Promise<string> {
  // Report start
  onProgress?.(5);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/admin/bunny/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error ?? `Bunny upload failed: ${res.status}`);
  }

  const data = await res.json() as { url: string };
  onProgress?.(100);
  return data.url;
}

// ── Extract duration from an audio File client-side ───────────────────────────

export function extractAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url   = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });

    audio.src = url;
  });
}

// ── Create album + all tracks in Postgres via one API call ────────────────────

export async function createAlbumInDB(
  album: AlbumUploadInput & { coverImage: string; cueSheet?: string; trackCount: number },
  tracks: Array<TrackUploadInput & { audioUrl: string; duration: number }>
): Promise<{ albumId: string }> {
  const res = await fetch("/api/admin/albums/create", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album, tracks }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to save album" }));
    throw new Error(err.error ?? "Failed to save album to database");
  }

  return res.json() as Promise<{ albumId: string }>;
}

// ── Main upload orchestrator ───────────────────────────────────────────────────
// Called when admin hits "Publish Album"
// Order: cover → cueSheet → tracks (parallel) → save to DB

export async function uploadAlbum(
  albumData: AlbumUploadInput,
  coverImageFile: File,
  cueSheetFile: File | null,
  trackInputs: TrackUploadInput[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<{ albumId: string }> {

  const progressArray: UploadProgress[] = trackInputs.map((t) => ({
    fileName: t.file.name,
    progress: 0,
    status:   "pending",
  }));

  const notify = () => onProgress?.([...progressArray]);

  // ── Step 1: Upload cover image ──────────────────────────────────────────
  console.log("Uploading cover image...");
  const coverImageUrl = await uploadFileToBunny(coverImageFile, "covers");
  console.log("Cover image uploaded:", coverImageUrl);

  // ── Step 2: Upload cue sheet if provided ───────────────────────────────
  let cueSheetUrl: string | undefined;
  if (cueSheetFile) {
    if (cueSheetFile.type !== "application/pdf") {
      throw new Error("Cue sheet must be a PDF file");
    }
    console.log("Uploading cue sheet...");
    cueSheetUrl = await uploadFileToBunny(cueSheetFile, "cueSheets");
    console.log("Cue sheet uploaded:", cueSheetUrl);
  }

  // ── Step 3: Upload all tracks to Bunny in parallel ─────────────────────
  console.log(`Uploading ${trackInputs.length} tracks...`);

  const trackResults = await Promise.all(
    trackInputs.map(async (input, i) => {
      progressArray[i].status = "uploading";
      notify();

      try {
        // Upload audio to Bunny
        const audioUrl = await uploadFileToBunny(
          input.file,
          "tracks",
          (pct) => {
            progressArray[i].progress = pct;
            notify();
          }
        );

        // Extract duration client-side
        const duration = await extractAudioDuration(input.file);

        progressArray[i].status   = "completed";
        progressArray[i].progress = 100;
        notify();

        console.log(`Track uploaded: ${input.file.name}`);
        return { ...input, audioUrl, duration };

      } catch (err) {
        progressArray[i].status = "error";
        progressArray[i].error  = err instanceof Error ? err.message : "Upload failed";
        notify();
        throw err;
      }
    })
  );

  // ── Step 4: Save everything to Postgres ────────────────────────────────
  console.log("Saving album and tracks to database...");

  const result = await createAlbumInDB(
    {
      ...albumData,
      coverImage: coverImageUrl,
      cueSheet:   cueSheetUrl,
      trackCount: trackResults.length,
    },
    trackResults
  );

  console.log("Album saved. ID:", result.albumId);
  return result;
}