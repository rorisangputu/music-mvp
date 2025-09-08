"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useAlbums } from "@/lib/useAlbums";
import { CATEGORIES, GENRES } from "@/types/music";
import { X, Play, Pause, Download, Heart, FileText, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from "firebase/firestore";
import AlbumCard from "./_components/AlbumCard";

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

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumsPage />
    </Suspense>
  );
}

const AlbumsPage = () => {
  const {
    albums,
    loading,
    error,
    search,
    categoryFilter,
    genreFilter,
    currentPage,
    totalPages,
    totalItems,
    handleSearchChange,
    handleCategoryChange,
    handleGenreChange,
    handlePageChange,
    clearFilters,
  } = useAlbums();

  const [searchInput, setSearchInput] = useState(search);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Helper functions
  const convertSecondsToMinutes = (seconds: number): string => {
    if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };


  const formatDuration = (timestamp: Timestamp): string => {
    const seconds = timestamp.seconds;
    if (seconds < 0 || seconds > 3600) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: Timestamp): string => {
    return timestamp.toDate().toISOString().split("T")[0];
  };

  const formatDateString = (timestamp: string): string => {
    return new Date(timestamp).toISOString().split("T")[0];
  };


  // Fetch album details and tracks
  const fetchAlbumDetails = async (albumId: string) => {
    setLoadingTracks(true);
    try {
      // Fetch album details
      const albumDoc = await getDoc(doc(db, "albums", albumId));
      if (albumDoc.exists()) {
        setSelectedAlbum({
          id: albumDoc.id,
          ...albumDoc.data(),
        } as Album);
      }

      // Fetch tracks
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
          createdAt: docData.createdAt instanceof Timestamp
            ? formatDate(docData.createdAt)
            : docData.createdAt,
          duration: docData.duration instanceof Timestamp
            ? formatDuration(docData.duration)
            : convertSecondsToMinutes(docData.duration),
        } as Track;
      });

      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setAlbumTracks(sorted);
    } catch (error) {
      console.error('Error fetching album details:', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleAlbumClick = (album: Album) => {
    fetchAlbumDetails(album.id);
  };

  const closeModal = () => {
    setSelectedAlbum(null);
    setAlbumTracks([]);
    setSelectedTrack(null);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setPlayingTrackId(null);
  };

  // Audio playback
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

      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setPlayingTrackId(null);
        setCurrentAudio(null);
      });

      audio.onended = () => {
        setPlayingTrackId(null);
        setCurrentAudio(null);
      };
    }
  };

  // User actions
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
    if (track.downloadable) {
      const link = document.createElement("a");
      link.href = track.audioUrl;
      link.download = `${track.title} - ${track.composer}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("This track is not available for download.");
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  if (loading) return <div className="flex justify-center py-44 bg-white text-blue-600">Loading albums...</div>;
  if (error) return <div className="flex justify-center py-44 bg-white text-red-500">{error}</div>;

  return (
    <div className="w-full bg-gray-50 py-10 min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Album Library</h1>
          <p className="text-sm text-gray-600">
            {totalItems} album{totalItems !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 md:flex-row mb-6 items-center">
          <input
            type="text"
            placeholder="Search albums, descriptions, categories, genres..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearchChange(e.target.value);
            }}
            className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={genreFilter}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="text-sm text-white px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Results Info */}
        {(search || categoryFilter || genreFilter) && (
          <div className="mb-4 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-700">
              Showing {albums.length} of {totalItems} results
              {search && ` for "${search}"`}
              {categoryFilter && ` in category "${categoryFilter}"`}
              {genreFilter && ` with genre "${genreFilter}"`}
            </p>
          </div>
        )}

        {/* Album Grid */}
        {albums.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} onClick={handleAlbumClick}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No albums found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-orange-600 hover:text-orange-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded bg-white border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded border ${page === currentPage
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded bg-white border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Album Details Modal */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold z-10">Album Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Album Info */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {selectedAlbum.coverImage && (
                  <img
                    src={selectedAlbum.coverImage}
                    alt={selectedAlbum.title}
                    className="w-full md:w-60 h-60 object-cover rounded shadow"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{selectedAlbum.title}</h1>
                  <p className="text-gray-700 text-sm mb-1">
                    <strong>Category:</strong> {selectedAlbum.category}
                  </p>
                  {selectedAlbum.genre && (
                    <p className="text-gray-700 text-sm mb-1">
                      <strong>Genre:</strong> {selectedAlbum.genre}
                    </p>
                  )}
                  <p className="text-gray-600 mt-2">{selectedAlbum.description}</p>

                  {selectedAlbum.cueSheet && (
                    <div className="mt-4">
                      <a
                        href={selectedAlbum.cueSheet}
                        className="bg-orange-600 py-2 px-3 text-white rounded hover:bg-orange-700 transition-colors"
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
                <div className="flex justify-center py-8 ">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : (
                <div className="space-y-4 ">
                  <h3 className="text-xl font-semibold mb-4">Tracks ({albumTracks.length})</h3>
                  {albumTracks.map((track) => (
                    <div
                      key={track.id}
                      className="border p-4 rounded shadow hover:shadow-md transition space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold">{track.title}</h4>
                          <p className="text-sm text-gray-600">
                            By {track.composer} — {track.duration}
                            {track.bpm && <span className="ml-2">{track.bpm} BPM</span>}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => togglePlayPause(track)}
                            className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                          >
                            {playingTrackId === track.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedTrack(track)}
                            className="py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                          >
                            Options
                          </button>
                        </div>
                      </div>
                      <audio controls controlsList="nodownload" className="w-full">
                        <source src={track.audioUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Track Details Modal */}
      {selectedTrack && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]"
          onClick={() => setSelectedTrack(null)}
        >
          <div
            className="bg-white max-w-md w-full p-6 rounded-lg relative shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTrack(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-2 pr-8">
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

            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <p><strong>Track Number:</strong> {selectedTrack.trackNumber}</p>
              <p><strong>Category:</strong> {selectedTrack.category}</p>
              <p><strong>Genre:</strong> {selectedTrack.genre}</p>
              <p><strong>Mood:</strong> {selectedTrack.mood}</p>
              <p><strong>Date Added:</strong> {formatDateString(selectedTrack.createdAt)}</p>
              <p><strong>ISRC No:</strong> {selectedTrack.isrc}</p>


            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="border-t pt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToFavorites(selectedTrack)}
                    className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Add to Favorites
                  </button>

                  {selectedTrack.downloadable && (
                    <button
                      onClick={() => handleDownload(selectedTrack)}
                      className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Track
                    </button>
                  )}

                  {selectedTrack.cueSheetUrl && (
                    <button
                      onClick={() => handleDownloadCueSheet(selectedTrack)}
                      className="w-full py-2 px-3 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download Cue Sheet
                    </button>
                  )}
                </div>
              </div>

              {selectedTrack.cueSheetUrl && (
                <div className="mt-4 pt-3 border-t">
                  <a
                    href={selectedTrack.cueSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 underline text-sm"
                  >
                    View Cue Sheet Online
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};