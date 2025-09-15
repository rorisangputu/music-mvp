import React from "react";
import { Download, Heart } from "lucide-react";

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

type TrackModalProps = {
  track: Track;
  onClick: (track: Track | null) => void;
  onFavClick: (track: Track) => void;
  onDownloadClick: (track: Track) => void;
  isUser: boolean | null;
  
};

const TrackModal = ({
  track,
  onClick,
  onFavClick,
  onDownloadClick,
  isUser,
  
}: TrackModalProps) => {
  const formatDateString = (timestamp: string): string => {
    return new Date(timestamp).toISOString().split("T")[0];
  };
  return (
    <div
      className="fixed inset-0  bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={() => onClick(null)}
    >
      <div
        className="bg-white max-w-lg w-full rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {track.title}
              </h2>
              <p className="text-gray-600">
                By {track.composer} • {track.duration}
              </p>
            </div>
            <button
              onClick={() => onClick(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-500 text-xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Track Number:</strong> {track.trackNumber}
            </p>
            <p>
              <strong>Category:</strong> {track.category}
            </p>
            <p>
              <strong>Genre:</strong> {track.genre}
            </p>
            <p>
              <strong>Mood:</strong> {track.mood}
            </p>
            <p>
              <strong>Date Added:</strong> {formatDateString(track.createdAt)}
            </p>
            <p>
              <strong>ISRC No:</strong> {track.isrc}
            </p>
          </div>

          {/* User Actions */}
          {isUser && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => onFavClick(track)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 gap-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                    <Heart className="w-4 h-4" />
                    Add to Favorites
                </button>

                {track.downloadable && (
                  <button
                    onClick={() => onDownloadClick(track)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 gap-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                      Download Track
                  </button>
                )}

                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackModal;
