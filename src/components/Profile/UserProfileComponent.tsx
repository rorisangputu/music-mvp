"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type User = {
  id: string;
  name: string | null;
  email: string;
};

type Favourite = {
  id: string;
  trackId: string;
  createdAt: string;
};

type Track = {
  id: string;
  title: string;
  composer: string;
  duration: string;
  audioUrl: string;
  genre: string;
  category: string;
};

export default function UserProfileComponent({ user }: { user: User }) {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [favouriteTracks, setFavouriteTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await fetch("/api/user/favourites");

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setFavourites(data.favourites); // Typo fix: backend returns `favorites` not `favourites`

          if (data.favourites.length > 0) {
            await fetchTrackDetails(data.favourites);
          }
        }
      } catch (error) {
        console.error("Error fetching favourites:", error);
      }
    };

    const fetchTrackDetails = async (favourites: Favourite[]) => {
      setTracksLoading(true);

      const fetchedTracks: Track[] = [];

      for (const fav of favourites) {
        try {
          const q = query(
            collection(db, "tracks"),
            where("id", "==", fav.trackId) // ✅ match by field
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              fetchedTracks.push({
                id: doc.id,
                ...doc.data(),
              } as Track);
            });
          } else {
            console.warn("Track not found for admin trackId:", fav.trackId);
          }
        } catch (error) {
          console.error("Error querying track by trackId:", fav.trackId, error);
        }
      }

      setFavouriteTracks(fetchedTracks);
      setTracksLoading(false);
    };

    fetchFavourites();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="w-[90%] lg:w-[80%] max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name || "User"}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            My Favourite Tracks ({favourites?.length || 0})
          </h2>

          {tracksLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : favouriteTracks.length === 0 ? (
            <p className="text-gray-600">No favourites yet.</p>
          ) : (
            <ul className="space-y-4">
              {favouriteTracks.map((track) => (
                <li key={track.id} className="border rounded p-4">
                  <h3 className="font-semibold">{track.title}</h3>
                  <p className="text-sm text-gray-600">By {track.composer}</p>
                  <audio controls className="w-full mt-2">
                    <source src={track.audioUrl} type="audio/mpeg" />
                  </audio>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
