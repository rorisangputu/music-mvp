import React from "react";
import AudioPlayer from "./AudioPlayer";

type TrackCardProps = {
track: Track;
index: number;
onClick: (track : Track) => void;
};

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

const TrackCard = ({track, index, onClick}: TrackCardProps) => {
  return (
    <div
      key={track.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              {index + 1}
            </span>
            <h3 className="text-xl font-semibold text-gray-900">
              {track.title}
            </h3>
          </div>
          <p className="text-gray-600 mb-3">
            By <span className="font-medium">{track.composer}</span> •{" "}
            {track.duration}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {track.category}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
              {track.genre}
            </span>
          </div>
        </div>
      </div>

      <AudioPlayer src={track.audioUrl} className="w-full h-10 rounded-lg" />
      <button
        className="inline-flex items-center mt-5 px-4 py-2 border flex-wrap w-fit border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
        onClick={() => onClick(track)}
      >
        View Options
      </button>
    </div>
  );
};

export default TrackCard;
