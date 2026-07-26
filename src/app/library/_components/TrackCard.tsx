// app/library/_components/TrackCard.tsx
import React, { useState, useEffect } from "react";
import { Download, ListPlus, Pause, Play } from "lucide-react";
import { PLAYLIST_CONFIGS } from "@/scripts/palylistConfig";

type TrackCardProps = {
  track: Track;
  index: number;
  onClick: (track: Track) => void;
  onPlayClick: (track: Track) => void;
  playingTrackId: string | null;
  isAdmin?: boolean;
  isUser?: boolean | null;
  onDownloadClick?: (track: Track) => void;
  onAddToPlaylist?: (trackId: string, playlistId: string) => Promise<void>;
};

type Track = {
  id: string;
  title: string;
  composer: string;
  trackNumber: number;
  duration: string;

  version: string;
  isrc?: string | null;
  releaseDate?: string | null;
  parentTrackId?: string | null;

  genre: string;
  subGenre?: string | null;
  mood: string[];
  energy: string;
  bpm: number;
  musicalKey?: string | null;

  instruments: string[];
  vocals: string;
  vocalLanguage?: string | null;
  featuredInstrument?: string | null;

  category: string;
  usageTags: string[];

  downloadable: boolean;
  licenseTier: string;
  exclusive: boolean;

  cueSheetUrl?: string | null;
  audioUrl: string | null;
  waveformUrl?: string | null;

  playCount: number;
  downloadCount: number;

  featured: boolean;
  newRelease: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;

  albumId: string;

  downloads: {
    id: string;
    format: string;
    url: string;
    fileSize?: number | null;
    bitrate?: number | null;
  }[];
};

type ExistingPlaylist = {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  trackCount: number;
};

const TrackCard = ({
  track,
  index,
  onClick,
  onPlayClick,
  playingTrackId,
  isAdmin = false,
  isUser = false,
  onDownloadClick,
  onAddToPlaylist,
}: TrackCardProps) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [existingPlaylists, setExistingPlaylists] = useState<
    ExistingPlaylist[]
  >([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Fetch existing playlists when dropdown opens
  useEffect(() => {
    if (showPlaylistSelector && isAdmin) {
      fetchExistingPlaylists();
    }
  }, [showPlaylistSelector, isAdmin]);

  const fetchExistingPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await fetch("/api/playlists/list");
      if (response.ok) {
        const data = await response.json();
        setExistingPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!onAddToPlaylist) return;

    setIsAdding(true);
    setAddedMessage("");

    try {
      await onAddToPlaylist(track.id, playlistId);

      const playlist = PLAYLIST_CONFIGS.find((p) => p.id === playlistId);
      setAddedMessage(`✓ Added to ${playlist?.title || "playlist"}`);

      // Refresh playlist list to show updated track counts
      await fetchExistingPlaylists();

      setTimeout(() => {
        setShowPlaylistSelector(false);
        setAddedMessage("");
      }, 2000);
    } catch (error) {
      setAddedMessage("✗ Failed to add to playlist");
      console.error("Error adding to playlist:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Merge existing playlists with config playlists
  const allPlaylists = PLAYLIST_CONFIGS.map((config) => {
    const existing = existingPlaylists.find((p) => p.id === config.id);
    return {
      ...config,
      trackCount: existing?.trackCount || 0,
      exists: !!existing,
    };
  });
  const isLoggedOut = !isUser && !isAdmin;

  const handleSignUpForDownload = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

      <div className="flex flex-row flex-wrap justify-start items-center gap-3">
        <button
          onClick={() => onPlayClick(track)}
          className="px-2 py-2 bg-white text-orange-600 rounded hover:bg-orange-700 transition-colors"
        >
          {playingTrackId === track.id ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <button
          className="inline-flex items-center justify-center px-4 py-2 border w-fit max-sm:flex-1 max-sm:min-w-36 border-transparent text-sm font-medium rounded text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
          onClick={() => onClick(track)}
        >
          View Options
        </button>

        {isUser && track.downloadable && onDownloadClick && (
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-orange-600 text-sm font-medium rounded text-orange-600 bg-white hover:bg-orange-50 transition-colors shadow-sm max-sm:flex-1 max-sm:min-w-36"
            onClick={() => onDownloadClick(track)}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}

        {isLoggedOut && (
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-orange-600 text-sm font-medium rounded text-orange-600 bg-white hover:bg-orange-50 transition-colors shadow-sm max-sm:w-full"
            onClick={handleSignUpForDownload}
          >
            <Download className="w-4 h-4" />
            sign up for free download
          </button>
        )}

        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
              disabled={isAdding}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-sm font-medium rounded text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <ListPlus className="w-4 h-4" />
              Add to Playlist
            </button>

            {/* Playlist Selector Dropdown */}
            {showPlaylistSelector && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowPlaylistSelector(false)}
                />

                {/* Dropdown */}
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Select a Playlist
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Playlist will be created if it doesn't exist
                    </p>
                  </div>

                  {addedMessage && (
                    <div
                      className={`mx-3 mt-3 p-2 rounded text-sm text-center ${
                        addedMessage.startsWith("✓")
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {addedMessage}
                    </div>
                  )}

                  {loadingPlaylists ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading playlists...
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {allPlaylists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                          disabled={isAdding}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 disabled:opacity-50"
                        >
                          <div
                            className="w-10 h-10 rounded flex-shrink-0"
                            style={{ backgroundColor: playlist.coverColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {playlist.title}
                              </p>
                              {!playlist.exists && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {playlist.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {playlist.trackCount}{" "}
                              {playlist.trackCount === 1 ? "track" : "tracks"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
