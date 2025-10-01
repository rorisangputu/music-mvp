// lib/music-delete.ts
import { storage, db } from "./firebase";
import { ref, deleteObject } from "firebase/storage";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

export interface DeleteProgress {
  fileName: string;
  status: "pending" | "deleting" | "completed" | "error";
  error?: string;
}

interface TrackData {
  id: string;
  title?: string;
  audioUrl?: string;
  cueSheetUrl?: string;
  [key: string]: any;
}

// Extract file path from Firebase Storage URL
function getStoragePathFromUrl(url: string): string {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.+?)\?/);
    return match ? match[1] : "";
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return "";
  }
}

// Delete file from Firebase Storage
async function deleteFileFromStorage(url: string): Promise<void> {
  try {
    const filePath = getStoragePathFromUrl(url);
    if (!filePath) {
      throw new Error("Could not extract file path from URL");
    }

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw error;
  }
}

// Main album deletion function
export async function deleteAlbum(
  albumId: string,
  onProgress?: (progress: DeleteProgress[]) => void
): Promise<void> {
  console.log(`🗑️ Starting deletion of album: ${albumId}`);

  try {
    // 1. Get album document
    const albumDoc = await getDoc(doc(db, "albums", albumId));
    if (!albumDoc.exists()) {
      throw new Error("Album not found");
    }

    const albumData = albumDoc.data();
    console.log(`📀 Found album: ${albumData.title}`);

    // 2. Get all tracks for this album
    const tracksQuery = query(
      collection(db, "tracks"),
      where("albumId", "==", albumId)
    );
    const tracksSnapshot = await getDocs(tracksQuery);
    const tracks = tracksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TrackData[];

    console.log(`🎵 Found ${tracks.length} tracks to delete`);

    // 3. Initialize progress tracking
    const progressArray: DeleteProgress[] = [
      { fileName: "Album cover", status: "pending" },
      ...tracks.map((track) => ({
        fileName: track.title || track.id,
        status: "pending" as const,
      })),
    ];
    onProgress?.(progressArray);

    // 4. Delete cover image from storage
    if (albumData.coverImage) {
      try {
        progressArray[0].status = "deleting";
        onProgress?.(progressArray);

        await deleteFileFromStorage(albumData.coverImage);

        progressArray[0].status = "completed";
        onProgress?.(progressArray);
        console.log("✅ Album cover deleted");
      } catch (error) {
        progressArray[0].status = "error";
        progressArray[0].error =
          error instanceof Error ? error.message : "Failed to delete cover";
        onProgress?.(progressArray);
        console.error("❌ Failed to delete album cover:", error);
      }
    } else {
      progressArray[0].status = "completed";
      onProgress?.(progressArray);
    }

    // 5. Delete tracks (files + documents) in parallel
    const trackDeletionPromises = tracks.map(async (track, index) => {
      const progressIndex = index + 1; // +1 because cover image is at index 0

      try {
        progressArray[progressIndex].status = "deleting";
        onProgress?.(progressArray);

        // Delete audio file from storage
        if (track.audioUrl) {
          await deleteFileFromStorage(track.audioUrl);
        }

        // Delete cue sheet if exists
        if (track.cueSheetUrl) {
          await deleteFileFromStorage(track.cueSheetUrl);
        }

        // Delete track document from Firestore
        console.log(`Attempting to delete track doc: ${track.id}`);
        await deleteDoc(doc(db, "tracks", track.id));
        console.log(`Deleted track doc: ${track.id}`);

        progressArray[progressIndex].status = "completed";
        onProgress?.(progressArray);
        console.log(`✅ Track deleted: ${track.title || track.id}`);
      } catch (error) {
        progressArray[progressIndex].status = "error";
        progressArray[progressIndex].error =
          error instanceof Error ? error.message : "Deletion failed";
        onProgress?.(progressArray);
        console.error(`❌ Failed to delete track ${track.title}:`, error);
        throw error;
      }
    });

    // Wait for all tracks to be deleted
    await Promise.allSettled(trackDeletionPromises);

    // 6. Finally, delete the album document
    await deleteDoc(doc(db, "albums", albumId));

    console.log("🎉 Album deletion completed successfully!");
  } catch (error) {
    console.error("❌ Album deletion failed:", error);
    throw error;
  }
}

// Alternative batch deletion (more efficient for large albums)
export async function deleteAlbumBatch(
  albumId: string,
  onProgress?: (progress: DeleteProgress[]) => void
): Promise<void> {
  console.log(`🗑️ Starting batch deletion of album: ${albumId}`);

  try {
    // Get album and tracks
    const albumDoc = await getDoc(doc(db, "albums", albumId));
    if (!albumDoc.exists()) {
      throw new Error("Album not found");
    }

    const albumData = albumDoc.data();
    const tracksQuery = query(
      collection(db, "tracks"),
      where("albumId", "==", albumId)
    );
    const tracksSnapshot = await getDocs(tracksQuery);
    const tracks = tracksSnapshot.docs;

    // Initialize progress
    const progressArray: DeleteProgress[] = [
      { fileName: "Album cover", status: "pending" },
      ...tracks.map((doc) => ({
        fileName: doc.data().title || doc.id,
        status: "pending" as const,
      })),
    ];
    onProgress?.(progressArray);

    // Delete files from storage first
    const fileDeletionPromises = [];

    // Cover image
    if (albumData.coverImage) {
      fileDeletionPromises.push(
        deleteFileFromStorage(albumData.coverImage).catch((error) => {
          progressArray[0].status = "error";
          progressArray[0].error = error.message;
          onProgress?.(progressArray);
        })
      );
    }

    // Track files
    tracks.forEach((trackDoc, index) => {
      const track = trackDoc.data() as TrackData;
      const progressIndex = index + 1;

      progressArray[progressIndex].status = "deleting";

      if (track.audioUrl) {
        fileDeletionPromises.push(
          deleteFileFromStorage(track.audioUrl).catch((error) => {
            progressArray[progressIndex].status = "error";
            progressArray[progressIndex].error = error.message;
            onProgress?.(progressArray);
          })
        );
      }

      if (track.cueSheetUrl) {
        fileDeletionPromises.push(
          deleteFileFromStorage(track.cueSheetUrl).catch((error) => {
            console.error(
              `Failed to delete cue sheet for ${track.title}:`,
              error
            );
          })
        );
      }
    });

    // Wait for all file deletions
    await Promise.allSettled(fileDeletionPromises);

    // Update progress for completed file deletions
    progressArray.forEach((item, index) => {
      if (item.status === "deleting") {
        item.status = "completed";
      }
    });
    onProgress?.(progressArray);

    // Batch delete Firestore documents
    const batch = writeBatch(db);

    // Add track deletions to batch
    tracks.forEach((trackDoc) => {
      batch.delete(doc(db, "tracks", trackDoc.id));
    });

    // Add album deletion to batch
    batch.delete(doc(db, "albums", albumId));

    // Commit batch
    await batch.commit();

    console.log("🎉 Batch album deletion completed!");
  } catch (error) {
    console.error("❌ Batch album deletion failed:", error);
    throw error;
  }
}
