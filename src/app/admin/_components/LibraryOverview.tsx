// components/LibraryOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

interface LibraryStats {
  totalAlbums: number;
  totalTracks: number;
  totalSizeGB: number;
  recentUploads: number;
  loading: boolean;
}

export default function LibraryOverview() {
  const [stats, setStats] = useState<LibraryStats>({
    totalAlbums: 0,
    totalTracks: 0,
    totalSizeGB: 0,
    recentUploads: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchLibraryStats = async () => {
      try {
        // Get total albums
        const albumsSnapshot = await getDocs(collection(db, "albums"));
        const totalAlbums = albumsSnapshot.size;

        // Get total tracks
        const tracksSnapshot = await getDocs(collection(db, "tracks"));
        const totalTracks = tracksSnapshot.size;

        // Calculate total storage size (estimate from track durations)
        let totalSizeBytes = 0;
        tracksSnapshot.docs.forEach((doc) => {
          const trackData = doc.data();
          // Rough estimation: 1 minute of audio ≈ 1MB (128kbps MP3)
          const durationMinutes = trackData.duration
            ? Math.ceil(trackData.duration / 60)
            : 3;
          totalSizeBytes += durationMinutes * 1024 * 1024; // Convert to bytes
        });
        const totalSizeGB =
          Math.round((totalSizeBytes / (1024 * 1024 * 1024)) * 10) / 10;

        // Get recent uploads (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentQuery = query(
          collection(db, "albums"),
          where("createdAt", ">=", sevenDaysAgo.toISOString())
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentUploads = recentSnapshot.size;

        setStats({
          totalAlbums,
          totalTracks,
          totalSizeGB,
          recentUploads,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching library stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchLibraryStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Library Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Library Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalAlbums.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Albums</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalTracks.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Tracks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalSizeGB}GB
          </div>
          <div className="text-sm text-gray-500">Storage Used</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.recentUploads}
          </div>
          <div className="text-sm text-gray-500">Recent Uploads</div>
          <div className="text-xs text-gray-400 mt-1">(Last 7 days)</div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stats.totalTracks > 0
                ? Math.round((stats.totalTracks / stats.totalAlbums) * 10) / 10
                : 0}
            </div>
            <div>Avg Tracks per Album</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stats.totalTracks > 0
                ? Math.round((stats.totalSizeGB / stats.totalTracks) * 1000) /
                  1000
                : 0}
              GB
            </div>
            <div>Avg Size per Track</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {stats.totalAlbums > 0
                ? Math.round((stats.totalSizeGB / stats.totalAlbums) * 100) /
                  100
                : 0}
              GB
            </div>
            <div>Avg Size per Album</div>
          </div>
        </div>
      </div>
    </div>
  );
}
