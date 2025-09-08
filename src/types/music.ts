export interface AlbumMetadata {
  title: string;
  artist: string; // same as composer
  category: string;
  genre: string;
  description: string;
  releaseDate: string;
  coverImage?: string;
  cueSheet?: string;
  trackIds: string[];
}

export interface TrackMetadata {
  title: string;
  albumId?: string;
  audioUrl: string;
  bpm?: number;
  category: string;
  composer: string; // same as artist
  createdAt: string;
  cueSheet?: string;
  downloadable: boolean;
  duration?: number;
  genre?: string;
  mood?: string;
  tags?: string[];
  trackNumber?: number;
  catalogNumber?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export const CATEGORIES = [
  "Cinematic",
  "Corporate",
  "Electronic",
  "Hip Hop",
  "House",
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
