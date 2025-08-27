"use client";

import { useFavourites } from "@/lib/useFavourites";



type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function UserProfileComponent({ user }: { user: User }) {
  const {
    favourites,
    favouriteTracks,
    tracksLoading,
    error,
    refetch
  } = useFavourites();

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              My Favourite Tracks ({favourites?.length || 0})
            </h2>
            <button
              onClick={refetch}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

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