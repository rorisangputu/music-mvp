// components/AlbumModal.tsx
import { X } from "lucide-react";

import { useRef } from "react";

type Track = {
  id: string;
  title: string;
  duration: string;
  composer: string;
  audioUrl: string;
  cueSheetUrl?: string;
  category: string;
  genre: string;
  mood: string[];
  tags: string[];
  bpm: number;
  isrc: string;
  trackNumber: number;
  downloadable: boolean;
  createdAt: string;
  albumId: string;
};

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  genre?: string;
  cueSheet?: string;
  releaseDate?: string;
};

interface AlbumModalProps {
  album: Album | null;
  tracks: Track[];
  loadingTracks: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onClose: () => void;
  onTrackClick: (track: Track) => void;
  onOptionsClick: (track: Track) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AlbumModal = ({
  album,
  tracks,
  loadingTracks,
  playingTrackId,
  isPlaying,
  onClose,
  onTrackClick,
  onOptionsClick,
  onPlayPause,
  onNext,
  onPrevious,
  audioRef,
}: AlbumModalProps) => {
  if (!album) return null;

  const currentTrack = tracks.find((t) => t.id === playingTrackId) || tracks[0];

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] flex flex-col rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold z-10">Album Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Album Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {album.coverImage && (
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full md:w-60 h-60 object-cover rounded shadow"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
              <p className="text-gray-700 text-sm mb-1">
                <strong>Category:</strong> {album.category}
              </p>
              {album.genre && (
                <p className="text-gray-700 text-sm mb-1">
                  <strong>Genre:</strong> {album.genre}
                </p>
              )}
              <p className="text-gray-600 mt-2">{album.description}</p>

              {album.cueSheet && (
                <div className="mt-4">
                  <a
                    href={album.cueSheet}
                    className="inline-block bg-orange-600 py-2 px-3 text-white rounded hover:bg-orange-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Cue Sheet
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tracks Section */}
          {loadingTracks ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : ( ""
            // <TrackList
            //   tracks={tracks}
            //   playingTrackId={playingTrackId}
            //   onTrackClick={onTrackClick}
            //   onOptionsClick={onOptionsClick}
            // />
          )}
        </div>

        {/* Music Player */}
        {tracks.length > 0 && ( ""
          // <MusicPlayer
          //   currentTrack={currentTrack}
          //   tracks={tracks}
          //   isPlaying={isPlaying}
          //   onPlayPause={onPlayPause}
          //   onNext={onNext}
          //   onPrevious={onPrevious}
          //   onTrackSelect={onTrackClick}
          //   audioRef={audioRef}
          // />
        )}
      </div>
    </div>
  );
};