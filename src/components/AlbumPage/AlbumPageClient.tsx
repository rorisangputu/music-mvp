// app/album/[albumId]/AlbumPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import { deleteAlbum, DeleteProgress } from "@/lib/music-delete";

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
  downloadable: boolean;
  createdAt: string;
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

const convertSecondsToMinutes = (seconds: number): string => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0)
    return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface AlbumPageClientProps {
  isAdmin: boolean | null;
  isUser: boolean | null;
}

export default function AlbumPageClient({
  isAdmin,
  isUser,
}: AlbumPageClientProps) {
  const { albumId } = useParams();
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<DeleteProgress[]>([]);
  const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchAlbumAndTracks = async () => {
      const albumDoc = await getDoc(doc(db, "albums", albumId as string));
      if (albumDoc.exists()) {
        setAlbum({
          id: albumDoc.id,
          ...albumDoc.data(),
        } as Album);
      }

      // Fetch tracks by albumId
      const q = query(
        collection(db, "tracks"),
        where("albumId", "==", albumId)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          createdAt:
            docData.createdAt instanceof Timestamp
              ? formatDate(docData.createdAt)
              : docData.createdAt,
          duration:
            docData.duration instanceof Timestamp
              ? formatDuration(docData.duration)
              : convertSecondsToMinutes(docData.duration),
        } as Track;
      });
      // Extract leading number from title (if present), otherwise fallback to Infinity

      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setTracks(sorted);

    };

    if (albumId) {
      fetchAlbumAndTracks();
    }
  }, [albumId]);

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

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/albums"); // Adjust to your albums list page
      }, 2000);
    } catch (error) {
      setDeleteMessage({
        type: "error",
        text: `Delete failed: ${error instanceof Error ? error.message : "Unknown error"
          }`,
      });
    }

    setIsDeleting(false);
  };

  // User action handlers
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

  const handleDownload = (track: Track) => {
    // Create a download link for the audio file
    const link = document.createElement("a");
    link.href = track.audioUrl;
    link.download = `${track.title} - ${track.composer}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCueSheet = (track: Track) => {
    if (track.cueSheetUrl) {
      const link = document.createElement("a");
      link.href = track.cueSheetUrl;
      link.download = `${track.title} - cue sheet.cue`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  console.log(album);
  return (
    <div className="w-full bg-gray-50 py-10">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-semibold">Album</h1>
          {isAdmin && album && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/albums/${albumId}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Edit Album
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isDeleting ? "Deleting..." : "Delete Album"}
              </button>
            </div>
          )}
        </div>

        {album && (
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-start">
            {album.coverImage && (
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full md:w-60 rounded shadow object-cover"
              />
            )}
            <div className="flex flex-col space-y-5">
              <div>
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
              </div>
              {isUser ?? <div>
                <a href={album.cueSheet} className="bg-orange-600 py-2 px-3 text-white">Cue Sheet</a>
              </div>}
            </div>
          </div>
        )}

        {/* Delete Progress */}
        {deleteProgress.length > 0 && (
          <div className="bg-white p-4 rounded-md shadow mb-6">
            <h3 className="font-medium mb-2">Deletion Progress</h3>
            {deleteProgress.map((progress, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{progress.fileName}</span>
                  <span
                    className={`font-medium ${progress.status === "completed"
                      ? "text-green-600"
                      : progress.status === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                      }`}
                  >
                    {progress.status === "completed"
                      ? "✅"
                      : progress.status === "error"
                        ? "❌"
                        : progress.status === "deleting"
                          ? "🗑️"
                          : "⏳"}
                    {progress.status}
                  </span>
                </div>
                {progress.error && (
                  <p className="text-red-600 text-xs">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Message */}
        {deleteMessage.text && (
          <div
            className={`p-4 rounded-md mb-6 ${deleteMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {deleteMessage.text}
          </div>
        )}

        <div className="space-y-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="border p-4 rounded shadow hover:shadow-md transition space-y-3"
            >
              <h2 className="text-lg font-semibold">{track.title}</h2>
              <p className="text-sm text-gray-600">
                By {track.composer} — {track.duration}
              </p>
              <audio controls controlsList="nodownload" className="mt-2 w-full">
                <source src={track.audioUrl} type="audio/mpeg" />
              </audio>
              <button
                className="py-2 px-3 bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                onClick={() => setSelectedTrack(track)}
              >
                Options
              </button>
            </div>
          ))}

          {/* Track Details Modal */}
          {selectedTrack && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setSelectedTrack(null)}
            >
              <div
                className="bg-white max-w-md w-full p-6 rounded-lg relative shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                  ✕
                </button>

                <h2 className="text-xl font-bold mb-2">
                  {selectedTrack.title}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  By {selectedTrack.composer}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Duration: {selectedTrack.duration}
                </p>

                <audio
                  controls
                  controlsList="nodownload"
                  className="w-full mb-4"
                >
                  <source src={selectedTrack.audioUrl} type="audio/mpeg" />
                </audio>

                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    <strong>Category:</strong> {selectedTrack.category}
                  </li>
                  <li>
                    <strong>Genre:</strong> {selectedTrack.genre}
                  </li>
                  <li>
                    <strong>Date Added:</strong> {selectedTrack.createdAt}
                  </li>
                </ul>

                {/* User Actions - Only show if user is signed in */}
                {isUser && (
                  <div className="mt-4 space-y-2">
                    <div className="border-t pt-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Actions
                      </h3>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToFavorites(selectedTrack)}
                          className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Add to Favorites
                        </button>

                        {selectedTrack.downloadable && (
                          <button
                            onClick={() => handleDownload(selectedTrack)}
                            className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            Download Track
                          </button>
                        )}

                        {selectedTrack.cueSheetUrl && (
                          <button
                            onClick={() =>
                              handleDownloadCueSheet(selectedTrack)
                            }
                            className="w-full py-2 px-3 bg-black text-white rounded transition-colors text-sm font-medium"
                          >
                            📋 Download Cue Sheet
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-between items-center">
                  {selectedTrack.cueSheetUrl && (
                    <a
                      href={selectedTrack.cueSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Cue Sheet
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                className="bg-white max-w-md w-full p-6 rounded-lg relative shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4 text-red-600">
                  Delete Album
                </h2>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete "{album?.title}"? This action
                  will:
                </p>
                <ul className="text-sm text-gray-600 mb-6 space-y-1">
                  <li>• Delete all {tracks.length} tracks</li>
                  <li>• Remove all audio files from storage</li>
                  <li>• Delete the album cover image</li>
                  <li>• Remove all database records</li>
                </ul>
                <p className="text-red-600 font-medium mb-6">
                  This action cannot be undone!
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAlbum}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Album
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to convert Timestamp to MM:SS format for duration
const formatDuration = (timestamp: Timestamp): string => {
  const seconds = timestamp.seconds;
  if (seconds < 0 || seconds > 3600) {
    console.log(
      `Invalid duration seconds: ${seconds} for timestamp:`,
      timestamp
    );
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Helper function to convert Timestamp to date string
const formatDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().split("T")[0];
};
