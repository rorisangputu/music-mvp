// app/admin/edit-album/[albumId]/EditAlbumClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { CATEGORIES, GENRES } from "@/lib/music-upload";

interface AlbumData {
  title: string;
  artist: string;
  category: string;
  genre: string;
  description: string;
  releaseDate: string;
}

export default function EditAlbumClient() {
  const { albumId } = useParams();
  const router = useRouter();

  const [albumData, setAlbumData] = useState<AlbumData>({
    title: "",
    artist: "",
    category: "",
    genre: "",
    description: "",
    releaseDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [originalData, setOriginalData] = useState<AlbumData | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!albumId) return;

      try {
        const albumDoc = await getDoc(doc(db, "albums", albumId as string));

        if (albumDoc.exists()) {
          const data = albumDoc.data();
          const albumInfo: AlbumData = {
            title: data.title || "",
            artist: data.artist || "",
            category: data.category || "",
            genre: data.genre || "",
            description: data.description || "",
            releaseDate: data.releaseDate || "",
          };

          setAlbumData(albumInfo);
          setOriginalData(albumInfo);
        } else {
          setMessage({
            type: "error",
            text: "Album not found",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: `Error loading album: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }

      setLoading(false);
    };

    fetchAlbum();
  }, [albumId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!albumId) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateDoc(doc(db, "albums", albumId as string), {
        title: albumData.title,
        artist: albumData.artist,
        category: albumData.category,
        genre: albumData.genre,
        description: albumData.description,
        releaseDate: albumData.releaseDate,
        updatedAt: new Date().toISOString(),
      });

      setMessage({
        type: "success",
        text: "Album updated successfully!",
      });

      // Update original data to reflect changes
      setOriginalData({ ...albumData });

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/albums/${albumId}`);
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }

    setSaving(false);
  };

  const handleCancel = () => {
    if (originalData) {
      setAlbumData({ ...originalData });
    }
    router.back();
  };

  const hasChanges =
    originalData && JSON.stringify(albumData) !== JSON.stringify(originalData);

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

        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
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
