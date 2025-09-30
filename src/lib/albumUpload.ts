//albumUpload.ts
import { cleanTrackTitle, extractAudioMetadata } from '@/lib/music-upload';
import { storage, db } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { AlbumMetadata, TrackMetadata, UploadProgress } from "@/types/music";

import { fileToUint8Array, NormalizedTrack, normalizedTrackFile } from "./helpers/NormalizeTrackFile";
import { trimAndConvertToFlac, ProcessedTrack } from "./helpers/FileConversion";



/**
 * Upload a processed track to Firebase Storage
 */
async function uploadProcessedTrack(
    track:ProcessedTrack,
    albumId: string,
    onProgress?: (progress: number) => void
): Promise<string>{
    return new Promise((resolve, reject) => {
      const path = `tracks/${albumId}_${track.flacName}`;
      const storageRef = ref(storage, path);
      
      const uploadTask = uploadBytesResumable(storageRef, track.data);

      uploadTask.on(
        "state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
        },
        (error) => reject(error),
        async() => {
            try{
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);

            }catch(err){
                reject(err);
            }
        }
      );
    });
}

/**
 * Main Album upload pipline
 */
export async function uploadAlbum(
    albumData: Omit<AlbumMetadata, "coverImage" | "cueSheet" | "trackIds">,
    coverImageFile: File,
    cueSheetFile: File,
    trackFiles: File[],
    onProgress?: (progress: UploadProgress[]) => void
): Promise<{ albumId: string; trackIds: string[] }>{
    const albumId = uuidv4();
    const trackIds : string[] =[];
    const progressArray: UploadProgress[] = trackFiles.map((file) => ({
        fileName: file.name,
        progress: 0,
        status: "pending",
    }));

    try{
        // 1. Upload Cover Image
        const coverExt = coverImageFile.name.split(".").pop();
        const coverPath = `albums/${albumId}_cover.${coverExt}`;
        const coverUrl = await uploadFileToStorage(coverImageFile, coverPath);

        // 2. Upload cue sheet
        if(cueSheetFile.type !== "application/pdf"){
            throw new Error("Cue sheet must be a pdf file");
        }
        const cuePath = `cueSheets/${albumId}_cueSheet.pdf`;
        const cueUrl = await uploadFileToStorage(cueSheetFile, cuePath);

        // 3. Create Album Document first
        const albumDocRef = await addDoc(collection(db, "albums"), {
            ...albumData,
            coverImage: coverUrl,
            cueSheet: cueUrl,
            trackIds: [],
            createdAt: new Date().toISOString(),
        });

        console.log("Processing tracks");

        // 4. Process tracks SEQUENTIALLY (not in parallel)
        for (let index = 0; index < trackFiles.length; index++) {
        const file = trackFiles[index];
        const trackId = uuidv4();
        trackIds.push(trackId);

        progressArray[index].status = "uploading";
        onProgress?.(progressArray);

        try {
            console.log(`🎵 Processing track ${index + 1}/${trackFiles.length}: ${file.name}`);

            // 4a. Convert File to Uint8Array
            const fileData = await fileToUint8Array(file);

            // 4b. Normalize
            const normalised: NormalizedTrack = normalizedTrackFile({
            originalName: file.name,
            data: fileData,
            mimeType: file.type,
            });

            // 4c. Trim + convert to FLAC
            console.log(`⚙️  Converting ${file.name} to FLAC...`);
            const processed: ProcessedTrack = await trimAndConvertToFlac(normalised);
            console.log(`✅ Conversion complete for ${file.name}`);

            // 4d. Upload FLAC
            console.log(`☁️  Uploading ${file.name}...`);
            const audioUrl = await uploadProcessedTrack(processed, albumId, (p) => {
            progressArray[index].progress = p;
            onProgress?.(progressArray);
            });

            // 4e. Extract audio metadata (duration in seconds)
            const audioMetdata = await extractAudioMetadata(file);

            // 4f. Create track document
            const trackData: TrackMetadata = {
            title: cleanTrackTitle(file.name),
            albumId: albumDocRef.id,
            audioUrl,
            category: albumData.category,
            composer: albumData.artist,
            genre: albumData.genre,
            createdAt: new Date().toISOString(),
            downloadable: true,
            duration: audioMetdata.duration,
            mood: "",
            tags: [],
            };

            await addDoc(collection(db, "tracks"), { ...trackData, id: trackId });

            progressArray[index].status = "completed";
            progressArray[index].progress = 100;
            onProgress?.(progressArray);

            console.log(`✅ Track ${index + 1}/${trackFiles.length} uploaded: ${file.name}`);
        } catch (err) {
            console.error(`❌ Failed to process ${file.name}:`, err);
            progressArray[index].status = "error";
            progressArray[index].error =
            err instanceof Error ? err.message : "Upload failed";
            onProgress?.(progressArray);
            throw err;
        }
        }


        // 5️. Update album with track IDs
        await updateDoc(albumDocRef, { trackIds });

        console.log("🎉 Album upload completed!");
        return { albumId: albumDocRef.id, trackIds };
    }catch (err) {
        console.log("❌ Album upload failed:", err);
        throw err;
    }

}

/**
 * Helper: upload generic file to Firebase Storage
 */
async function uploadFileToStorage(file: File, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      undefined,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}