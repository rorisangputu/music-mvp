import { storage, db } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { AlbumMetadata, TrackMetadata, UploadProgress } from "@/types/music";

// Predefined categories and genres for production music
export const CATEGORIES = [
  "Cinematic",
  "Corporate",
  "Electronic",
  "Hip Hop",
  "House",
  "Techno",
  "Jazz",
  "Rock",
  "Pop",
  "Ambient",
  "Classical",
  "World Music",
];

export const GENRES = [
  "Orchestral",
  "Piano",
  "Guitar",
  "Synthesizer",
  "Drums",
  "Vocals",
  "Instrumental",
  "Upbeat",
  "Mellow",
  "Dramatic",
];

export const MOODS = [
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Dramatic",
  "Romantic",
  "Suspenseful",
  "Uplifting",
  "Dark",
  "Peaceful",
];

// Extract basic metadata from audio file
export async function extractAudioMetadata(
  file: File
): Promise<{ duration?: number }> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve({
        duration: Math.round(audio.duration),
      });
    });
    audio.addEventListener("error", () => {
      resolve({}); // Return empty if can't extract
    });
    audio.src = URL.createObjectURL(file);
  });
}

// Upload file to Firebase Storage with progress tracking
export function uploadFileToStorage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

// Clean filename for title (remove extension, clean up)
export function cleanTrackTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")              // remove extension
    .replace(/[_-]+/g, " ")                // underscores/hyphens → space
    .replace(/([a-z])([A-Z])/g, "$1 $2")   // split camelCase or mixed (StopUplifting -> Stop Uplifting)
    .replace(/\s+/g, " ")                  // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase()) // capitalize each word
    .replace(/\bCut(\d+)\b/i, "CUT$1");    // restore catalog code to uppercase
}



// Main album upload function
export async function uploadAlbum(
  albumData: Omit<AlbumMetadata, "coverImage" | "cueSheet" | "trackIds">,
  coverImageFile: File,
  cueSheetFile: File,
  trackFiles: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<{ albumId: string; trackIds: string[] }> {
  const albumId = uuidv4();
  const trackIds: string[] = [];
  const progressArray: UploadProgress[] = trackFiles.map((file) => ({
    fileName: file.name,
    progress: 0,
    status: "pending",
  }));

  try {
    // 1. Upload cover image
    console.log("📸 Uploading cover image...");
    const coverImagePath = `albums/${albumId}_cover.${coverImageFile.name
      .split(".")
      .pop()}`;
    const coverImageUrl = await uploadFileToStorage(
      coverImageFile,
      coverImagePath
    );

    // 2. Upload cue sheet (PDF Only)
    if (cueSheetFile.type !== "application/pdf") {
      throw new Error("Cue sheet must be a PDF file");
    }
    console.log("📸 Uploading cue sheet...");
    const cueSheetPath = `cueSheets/${albumId}_cueSheet.pdf`;
    const cueSheetUrl = await uploadFileToStorage(
      cueSheetFile,
      cueSheetPath
    );

    // 2. Create album document first (without trackIds)
    console.log("📝 Creating album document...");
    const albumDocRef = await addDoc(collection(db, "albums"), {
      ...albumData,
      coverImage: coverImageUrl,
      cueSheet: cueSheetUrl,
      trackIds: [], // Will update after tracks are uploaded
      createdAt: new Date().toISOString(),
    });

    console.log("🎵 Starting track uploads...");

    // 3. Upload tracks in parallel with progress tracking
    const trackUploadPromises = trackFiles.map(async (file, index) => {
      const trackId = uuidv4();
      trackIds.push(trackId);

      try {
        // Update progress
        progressArray[index].status = "uploading";
        onProgress?.(progressArray);

        // Extract audio metadata
        const audioMetadata = await extractAudioMetadata(file);

        // Upload track file
        const trackPath = `tracks/${trackId}_${file.name}`;
        const audioUrl = await uploadFileToStorage(
          file,
          trackPath,
          (progress) => {
            progressArray[index].progress = progress;
            onProgress?.(progressArray);
          }
        );

        // Create track document
        const trackData: TrackMetadata = {
          title: cleanTrackTitle(file.name),
          albumId: albumDocRef.id,
          audioUrl,
          category: albumData.category,
          composer: albumData.artist,
          genre: albumData.genre,
          createdAt: new Date().toISOString(),
          downloadable: true,
          duration: audioMetadata.duration,
          mood: "", // To be set later or via form
          tags: [],
          // bpm: will be extracted later if needed
        };

        await addDoc(collection(db, "tracks"), {
          ...trackData,
          id: trackId,
        });

        progressArray[index].status = "completed";
        progressArray[index].progress = 100;
        onProgress?.(progressArray);

        console.log(`✅ Track uploaded: ${file.name}`);
        return trackId;
      } catch (error) {
        progressArray[index].status = "error";
        progressArray[index].error =
          error instanceof Error ? error.message : "Upload failed";
        onProgress?.(progressArray);
        throw error;
      }
    });

    // Wait for all tracks to upload
    await Promise.all(trackUploadPromises);

    // 4. Update album with trackIds
    await updateDoc(albumDocRef, {
      trackIds: trackIds,
    });

    console.log("🎉 Album upload completed!");
    console.log(`📀 Album ID: ${albumDocRef.id}`);
    console.log(`🎵 Tracks uploaded: ${trackIds.length}`);

    return {
      albumId: albumDocRef.id,
      trackIds,
    };
  } catch (error) {
    console.error("❌ Album upload failed:", error);
    throw error;
  }
}
