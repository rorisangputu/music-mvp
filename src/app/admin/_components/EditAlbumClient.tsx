"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";


import { useAlbumEdit } from "@/lib/hooks/adminPanel/useAlbumEdit";
import TrackEdit from "./TrackEdit";
import { CATEGORIES, GENRES } from "@/types/music";

export default function EditAlbumClient() {
  const { albumId } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    albumData,
    setAlbumData,
    tracks, updateTrack,
    loading,
    saving,
    error,
    hasChanges,
    updateAlbum,
    resetToOriginal,
  } = useAlbumEdit(albumId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const result = await updateAlbum(albumData);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Album updated successfully!",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/admin/dashboard/manage-library`);
      }, 1500);
    } else {
      setMessage({
        type: "error",
        text: result.error || "Update failed",
      });
    }
  };

  const handleCancel = () => {
    resetToOriginal();
    router.back();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !albumData.title) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">{error}</div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Edit Album Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Album Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Album Title
            </label>
            <input
              type="text"
              required
              value={albumData.title}
              onChange={(e) =>
                setAlbumData({ ...albumData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Artist/Composer
            </label>
            <input
              type="text"
              required
              value={albumData.artist}
              onChange={(e) =>
                setAlbumData({ ...albumData, artist: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              required
              value={albumData.category}
              onChange={(e) =>
                setAlbumData({ ...albumData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              required
              value={albumData.genre}
              onChange={(e) =>
                setAlbumData({ ...albumData, genre: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Genre</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Release Date
            </label>
            <input
              type="date"
              required
              value={albumData.releaseDate}
              onChange={(e) =>
                setAlbumData({ ...albumData, releaseDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            rows={4}
            value={albumData.description}
            onChange={(e) =>
              setAlbumData({ ...albumData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <h2 className="mt-4 font-semibold text-lg">Tracks</h2>
        {tracks.map(track => (
          <TrackEdit key={track.id} track={track} onSave={updateTrack} />
        ))}


        {message.text && (
          <div
            className={`p-4 rounded-md ${message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

        {/* Show changes indicator */}
        {hasChanges && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
            ⚠️ You have unsaved changes
          </div>
        )}
      </form>
    </div>
  );
}