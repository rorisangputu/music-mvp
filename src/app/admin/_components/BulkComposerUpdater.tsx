"use client";

import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BulkComposerUpdater() {
    const [composer, setComposer] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!composer.trim()) {
            setMessage({ type: "error", text: "Please enter a composer name." });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const tracksCol = collection(db, "tracks");
            const snapshot = await getDocs(tracksCol);

            if (snapshot.empty) {
                setMessage({ type: "error", text: "No tracks found to update." });
                setSaving(false);
                return;
            }

            const batch = writeBatch(db);
            let updateCount = 0;

            snapshot.forEach((trackDoc) => {
                const trackRef = doc(db, "tracks", trackDoc.id);
                batch.update(trackRef, { 
                    composer: composer.trim(), 
                    updatedAt: new Date().toISOString() 
                });
                updateCount++;
            });

            await batch.commit();

            setMessage({ 
                type: "success", 
                text: `Composer updated for ${updateCount} tracks successfully!` 
            });
            setComposer("");
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to update tracks. Try again." });
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
                Composer Name for All Tracks
            </label>
            <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Enter composer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={saving || !composer.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? "Updating..." : "Update All Track Composers"}
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