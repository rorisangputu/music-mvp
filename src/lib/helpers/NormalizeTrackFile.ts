//NormalizeTrackFile.ts
import { Buffer } from "buffer";

//TrackFile represents a file coming from frontend
export interface TrackFile{
    originalName: string;     // original file name from user
    data: Uint8Array;       // file data
    mimeType: string;   // e.g., 'audio/wav'
}

// NormalizedTrack contains cleaned filename + file buffer
export interface NormalizedTrack {
  normalizedName: string;
  data: Uint8Array;
  mimeType: string;
}

export function normalizedTrackFile(file: TrackFile): NormalizedTrack{
    
    const {originalName, data, mimeType} = file;

    //Remove extension, replace underscores/spaces with hyphens
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    const cleanedName = nameWithoutExt
        .replace(/[_\s]+/g, "-")                // underscores/spaces → hyphens
        .replace(/([a-z])([A-Z])/g, "$1-$2")    // camelCase → hyphen
        .replace(/-+/g, "-")                    // collapse multiple hyphens
        .trim()
        .toLowerCase();
    
        // Preserve original extension for now
    const ext = originalName.split(".").pop()?.toLowerCase() || "wav";
    const normalizedName = `${cleanedName}.${ext}`;

    return {
        normalizedName,
        data, mimeType
    }
}

// Helper function to convert File to Uint8Array
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
