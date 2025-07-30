// app/album/[albumId]/page.tsx
"use client";

import { useEffect, useState } from "react";
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
};

export const convertSecondsToMinutes = (seconds: number): string => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0)
    return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function AlbumPage() {
  const { albumId } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [albumTitle, setAlbumTitle] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

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
      setTracks(data);
    };

    if (albumId) fetchAlbumAndTracks();
  }, [albumId]);

  return (
    <div className="w-full bg-gray-50 py-10">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <h1 className="text-xl font-semibold py-5">Album</h1>
        {album && (
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-start">
            {album.coverImage && (
              <img
                src={album.coverImage}
                alt={album.title}
                className="w-full md:w-60 rounded shadow object-cover"
              />
            )}
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
          </div>
        )}

        <div className="space-y-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="border p-4 rounded shadow cursor-pointer hover:shadow-md transition"
              onClick={() => setSelectedTrack(track)}
            >
              <h2 className="text-lg font-semibold">{track.title}</h2>
              <p className="text-sm text-gray-600">
                By {track.composer} — {track.duration}
              </p>
              <audio controls className="mt-2 w-full">
                <source src={track.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          ))}

          {/* 🔥 Move modal here, not inside .map */}
          {selectedTrack && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setSelectedTrack(null)} // background click closes modal
            >
              <div
                className="bg-white max-w-md w-full p-6 rounded-lg relative shadow-xl"
                onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
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

                <audio controls className="w-full mb-4">
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
                    <strong>BPM:</strong> {selectedTrack.bpm}
                  </li>
                  <li>
                    <strong>Tags:</strong> {selectedTrack.tags.join(", ")}
                  </li>
                  <li>
                    <strong>Date Added:</strong> {selectedTrack.createdAt}
                  </li>
                </ul>

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
                  <a
                    href={`/license?trackId=${
                      selectedTrack.id
                    }&trackTitle=${encodeURIComponent(selectedTrack.title)}`}
                    className="text-green-600 underline"
                  >
                    Request License
                  </a>
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
  // Validate: Assume max track duration is 1 hour (3600 seconds)
  if (seconds < 0 || seconds > 3600) {
    console.log(
      `Invalid duration seconds: ${seconds} for timestamp:`,
      timestamp
    );
    return "0:00"; // Fallback for invalid duration
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`; // e.g., "2:35"
};

// Helper function to convert Timestamp to date string
const formatDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().split("T")[0]; // e.g., "2025-07-08"
};
