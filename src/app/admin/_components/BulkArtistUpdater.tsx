"use client";

import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BulkArtistUpdater() {
    const [artist, setArtist] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artist.trim()) {
            setMessage({ type: "error", text: "Please enter an artist name." });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const albumsCol = collection(db, "albums");
            const snapshot = await getDocs(albumsCol);

            if (snapshot.empty) {
                setMessage({ type: "error", text: "No albums found to update." });
                setSaving(false);
                return;
            }

            const batch = writeBatch(db);
            let updateCount = 0;

            snapshot.forEach((albumDoc) => {
                const albumRef = doc(db, "albums", albumDoc.id);
                batch.update(albumRef, { 
                    artist: artist.trim(), 
                    updatedAt: new Date().toISOString() 
                });
                updateCount++;
            });

            await batch.commit();

            setMessage({ 
                type: "success", 
                text: `Artist updated for ${updateCount} albums successfully!` 
            });
            setArtist("");
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to update albums. Try again." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto p-6 bg-white border rounded-md shadow-md space-y-4"
        >
            <label className="block text-sm font-medium text-gray-700">
                Artist Name for All Albums
            </label>
            <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={saving || !artist.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? "Updating..." : "Update All Album Artists"}
            </button>

            {message && (
                <p
                    className={`p-2 rounded-md ${
                        message.type === "success" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {message.text}
                </p>
            )}
        </form>
    );
}