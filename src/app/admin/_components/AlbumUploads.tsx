"use client";

import { useState } from "react";
import { AlbumMetadata, CATEGORIES, GENRES, UploadProgress } from "@/types/music";
import Link from "next/link";
import { uploadAlbum } from "@/lib/music-upload";



export default function AlbumUpload() {
  const [albumData, setAlbumData] = useState<
    Omit<AlbumMetadata, "coverImage" | "trackIds">
  >({
    title: "",
    artist: "",
    category: "",
    genre: "",
    description: "",
    releaseDate: "",
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [cueSheet, setCueSheet] = useState<File | null>();
  const [trackFiles, setTrackFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [albumId, setAlbumId] = useState("");

  const handleTrackFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("audio/")
      );
      setTrackFiles(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverImage || !cueSheet || trackFiles.length === 0) {
      setMessage({
        type: "error",
        text: "Please select cover image and tracks",
      });
      return;
    }

    setIsUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await uploadAlbum(
        albumData,
        coverImage,
        cueSheet,
        trackFiles,
        setUploadProgress
      );

      setMessage({
        type: "success",
        text: `Album uploaded successfully! Album ID: ${result.albumId}`,
      });
      setAlbumId(result.albumId);

      // Reset form
      setAlbumData({
        title: "",
        artist: "",
        category: "",
        genre: "",
        description: "",
        releaseDate: "",
      });
      setCoverImage(null);
      setCueSheet(null);
      setTrackFiles([]);
      setUploadProgress([]);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"
          }`,
      });
    }

    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Upload Album</h2>

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
            rows={3}
            value={albumData.description}
            onChange={(e) =>
              setAlbumData({ ...albumData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Cue Sheet (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setCueSheet(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Track Files
            </label>
            <input
              type="file"
              accept="audio/*"
              multiple
              required
              onChange={handleTrackFilesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Track Files Preview */}
        {trackFiles.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">
              Selected Tracks ({trackFiles.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {trackFiles.map((file, index) => (
                <div key={index} className="flex justify-between">
                  <span>{file.name}</span>
                  <span className="text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Upload Progress</h3>
            {uploadProgress.map((progress, index) => (
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
                        : progress.status === "uploading"
                          ? "⬆️"
                          : "⏳"}
                    {progress.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progress.status === "completed"
                      ? "bg-green-500"
                      : progress.status === "error"
                        ? "bg-red-500"
                        : "bg-blue-500"
                      }`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                {progress.error && (
                  <p className="text-red-600 text-xs mt-1">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {message.text && (
          <div
            className={`p-4 rounded-md ${message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message.text}
            {message.type === "success" && albumId && (
              <div className="mt-2">
                <Link
                  href={`/library/${albumId}`}
                  className="underline text-blue-600"
                >
                  View Album
                </Link>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isUploading ? "Uploading Album..." : "Upload Album"}
        </button>
      </form>
    </div>
  );
}
