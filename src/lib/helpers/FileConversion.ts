// trimConvertFlac.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { NormalizedTrack } from "./NormalizeTrackFile";

// Create a single FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoading: Promise<void> | null = null;

export interface ProcessedTrack {
  flacName: string;
  data: Uint8Array;
}

async function getFFmpegInstance(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  // If already loading, wait for it
  if (ffmpegLoading) {
    await ffmpegLoading;
    return ffmpegInstance!;
  }

  // Start loading
  ffmpegLoading = (async () => {
    ffmpegInstance = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    
    ffmpegInstance.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  })();

  await ffmpegLoading;
  ffmpegLoading = null;
  return ffmpegInstance!;
}

export async function trimAndConvertToFlac(
  normalizedTrack: NormalizedTrack
): Promise<ProcessedTrack> {
  const ffmpeg = await getFFmpegInstance();
  
  const inputName = normalizedTrack.normalizedName;
  const flacName = inputName.replace(/\.[^/.]+$/, ".flac");

  try {
    // Check if files exist and clean them up first
    try {
      await ffmpeg.deleteFile(inputName);
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    try {
      await ffmpeg.deleteFile(flacName);
    } catch (e) {
      // File doesn't exist, that's fine
    }

    // Write input file to FFmpeg filesystem
    await ffmpeg.writeFile(inputName, normalizedTrack.data);

    // Execute FFmpeg command
    await ffmpeg.exec([
      "-i",
      inputName,
      "-c:a",
      "flac",
      "-compression_level",
      "5", // Faster compression, less memory
      flacName,
    ]);

    // Read the output file
    const flacData = (await ffmpeg.readFile(flacName)) as Uint8Array;
    
    // Make a copy of the data before cleaning up
    const flacDataCopy = new Uint8Array(flacData);

    // Clean up files from FFmpeg filesystem
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(flacName);

    return {
      flacName,
      data: flacDataCopy,
    };
  } catch (error) {
    // Clean up on error
    try {
      await ffmpeg.deleteFile(inputName);
    } catch (e) {
      // Ignore cleanup errors
    }
    try {
      await ffmpeg.deleteFile(flacName);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}