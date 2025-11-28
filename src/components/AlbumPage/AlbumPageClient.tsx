// app/album/[albumId]/AlbumPageClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { deleteAlbum, DeleteProgress } from "@/lib/music-delete";
import { ArrowLeft } from "lucide-react";
import TrackCard from "@/app/library/_components/TrackCard";
import TrackModal from "@/app/library/_components/TrackModal";

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
  cueSheet: string;
};

interface AlbumPageClientProps {
  album: Album;
  initialTracks: Track[];
  isAdmin: boolean | null;
  isUser: boolean | null;
}

export default function AlbumPageClient({
  album,
  initialTracks,
  isAdmin,
  isUser,
}: AlbumPageClientProps) {
  const { albumId } = useParams();
  const router = useRouter();
  const [tracks] = useState<Track[]>(initialTracks);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<DeleteProgress[]>([]);
  const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const handleAddToPlaylist = async (trackId: string, playlistId: string) => {
    try {
      const response = await fetch("/api/playlists/add-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId,
          playlistId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add track to playlist");
      }

      return response.json();
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      throw error;
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album || !albumId) return;

    setIsDeleting(true);
    setDeleteMessage({ type: "", text: "" });
    setShowDeleteConfirm(false);

    try {
      await deleteAlbum(albumId as string, setDeleteProgress);

      setDeleteMessage({
        type: "success",
        text: "Album deleted successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/library");
      }, 2000);
    } catch (error) {
      setDeleteMessage({
        type: "error",
        text: `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    setIsDeleting(false);
  };

  const handleAddToFavorites = async (track: Track) => {
    try {
      const response = await fetch("/api/user/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId: track.id,
        }),
      });

      if (response.ok) {
        alert("Track added to favorites!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add to favorites");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites. Please try again.");
    }
  };

  const incrementPlayCount = async (trackId: string, title: string, url: string) => {
    try {
      const res = await fetch("/api/tracks/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, title, url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, message: errorData.message, code: 400 };
      }
      return { success: true, message: "Play count incremented", code: 200 };
    } catch (error) {
      return { success: false, message: "Server Error", code: 500 };
    }
  };

  const incrementDownloadCount = async (trackId: string, title: string, url: string) => {
    try {
      const response = await fetch("/api/tracks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, title, url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Error incrementing", code: 400 };
      }

      return { success: true, message: "Download Count incremented", code: 200 };
    } catch (error) {
      return { success: false, message: "Server Error", code: 500 };
    }
  };

  const handleDownload = async (track: Track) => {
    if (!track.downloadable) {
      alert("This track is not available for download");
      return;
    }

    const link = document.createElement("a");
    link.href = track.audioUrl;
    link.download = `${track.title} - ${track.composer}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const increment = await incrementDownloadCount(track.id, track.title, track.audioUrl);

    if (increment.success) {
      setDownloaded(true);
      alert("Track downloaded!");
    } else {
      alert(increment.message || "Failed to download");
    }
  };

  const handleDownloadCueSheet = (album: Album) => {
    if (album.cueSheet) {
      const link = document.createElement("a");
      link.href = album.cueSheet;
      link.download = `${album.title} - cue sheet.cue`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const togglePlayPause = (track: Track) => {
    if (playingTrackId === track.id) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      setPlayingTrackId(null);
    } else {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      const audio = new Audio(track.audioUrl);
      setCurrentAudio(audio);
      setPlayingTrackId(track.id);

      audio
        .play()
        .then(() => {
          incrementPlayCount(track.id, track.title, track.audioUrl);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setPlayingTrackId(null);
          setCurrentAudio(null);
        });

      audio.onended = () => {
        setPlayingTrackId(null);
        setCurrentAudio(null);
      };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex flex-row gap-5 items-center"
            >
              <ArrowLeft /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Album Details</h1>
          </div>

          {isAdmin && album && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/albums/${albumId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Edit Album
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Delete Album"}
              </button>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="bg-neutral-800 rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {album.coverImage && (
              <div className="flex-shrink-0">
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full lg:w-64 h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-neutral-50 mb-4">{album.title}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium bg-gray-100 text-gray-800">
                    {album.category}
                  </span>
                  {album.genre && (
                    <span className="inline-flex items-center px-3 py-1 rounded-sm text-sm font-medium bg-orange-100 text-orange-800">
                      {album.genre}
                    </span>
                  )}
                </div>
                <p className="text-neutral-100 text-lg leading-relaxed">{album.description}</p>
              </div>

              {isUser && (
                <div>
                  <button
                    onClick={() => handleDownloadCueSheet(album)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-neutral-50 bg-orange-600 w-fit hover:bg-orange-500 transition-colors"
                  >
                    📋 Download Cue Sheet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Progress */}
        {deleteProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deletion Progress</h3>
            <div className="space-y-3">
              {deleteProgress.map((progress, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{progress.fileName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {progress.status === "completed"
                        ? "✅"
                        : progress.status === "error"
                        ? "❌"
                        : progress.status === "deleting"
                        ? "🗑️"
                        : "⏳"}
                    </span>
                    <span
                      className={`text-sm font-medium capitalize ${
                        progress.status === "completed"
                          ? "text-green-600"
                          : progress.status === "error"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {progress.status}
                    </span>
                  </div>
                  {progress.error && <p className="text-red-600 text-xs mt-1">{progress.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Message */}
        {deleteMessage.text && (
          <div
            className={`rounded-xl p-4 mb-8 ${
              deleteMessage.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {deleteMessage.text}
          </div>
        )}

        {/* Tracks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tracks</h2>
            <span className="text-sm text-gray-500">
              {tracks.length} track{tracks.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-4">
            {tracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                onClick={setSelectedTrack}
                onPlayClick={togglePlayPause}
                playingTrackId={playingTrackId}
                isAdmin={!!isAdmin}
                onAddToPlaylist={handleAddToPlaylist}
              />
            ))}
          </div>
        </div>

        {/* Track Details Modal */}
        {selectedTrack && (
          <TrackModal
            track={selectedTrack}
            isUser={isUser}
            onClick={setSelectedTrack}
            onFavClick={handleAddToFavorites}
            onDownloadClick={handleDownload}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white max-w-md w-full rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Album</h2>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete "{album?.title}"? This action will:
                </p>
                <ul className="text-sm text-gray-600 mb-6 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Delete all {tracks.length} tracks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Remove all audio files from storage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Delete the album cover image
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    Remove all database records
                  </li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-red-700 text-sm font-medium">⚠️ This action cannot be undone!</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAlbum}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete Album
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}