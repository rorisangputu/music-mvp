export interface AlbumMetadata {
  title: string;
  artist: string; // same as composer
  category: string;
  genre: string;
  description: string;
  releaseDate: string;
  coverImage?: string;
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
  genre: string;
  mood: string;
  tags: string[];
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}
