// trimConvertFlac.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { NormalizedTrack } from "./NormalizeTrackFile"; // <-- import from step 1

const ffmpeg = new FFmpeg();

export interface ProcessedTrack {
  flacName: string;
  data: Uint8Array; // in-memory FLAC file
}

export async function trimAndConvertToFlac(
  normalizedTrack: NormalizedTrack
): Promise<ProcessedTrack> {
  if (!ffmpeg.loaded) {
    // Load FFmpeg core and wasm files
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
  }

  const inputName = normalizedTrack.normalizedName;
  
  // Write input file to FFmpeg filesystem
  await ffmpeg.writeFile(inputName, normalizedTrack.data);

  const flacName = inputName.replace(/\.[^/.]+$/, ".flac");

  // Execute FFmpeg command
  await ffmpeg.exec([
    "-i",
    inputName,
    "-t",
    "30",
    "-c:a",
    "flac",
    flacName
  ]);

  // Read the output file
  const flacData = await ffmpeg.readFile(flacName) as Uint8Array;

  // Clean up files from FFmpeg filesystem
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(flacName);

  return {
    flacName,
    data: flacData,
  };
}