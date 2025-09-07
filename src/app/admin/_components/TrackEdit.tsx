"use client";

import { TrackMetadata } from "@/types/music";
import { useState } from "react";


interface TrackEditProps {
    track: TrackMetadata & { id: string };
    onSave: (id: string, data: Partial<TrackMetadata>) => Promise<{ success: boolean; error?: string }>;
}


export default function TrackEdit({ track, onSave }: TrackEditProps) {
    const [trackData, setTrackData] = useState(track);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(track.id, trackData);
        setSaving(false);
    };

    return (
        <div className="p-4 border rounded mb-2">
            <input
                type="text"
                value={trackData.title}
                onChange={e => setTrackData({ ...trackData, title: e.target.value })}
                placeholder="Track Title"
                className="border p-1 mb-1 w-full"
            />
            <input
                type="text"
                value={trackData.composer || ""}
                onChange={e => setTrackData({ ...trackData, composer: e.target.value })}
                placeholder="Track Number"
                className="border p-1 mb-1 w-full"
            />
            <input
                type="number"
                value={trackData.trackNumber || ""}
                onChange={e => setTrackData({ ...trackData, trackNumber: parseInt(e.target.value) || undefined })}
                placeholder="Track Number"
                className="border p-1 mb-1 w-full"
            />
            <input
                type="text"
                value={trackData.mood || ""}
                onChange={e => setTrackData({ ...trackData, mood: e.target.value || undefined })}
                placeholder="Mood"
                className="border p-1 mb-1 w-full"
            />
            <input
                type="text"
                value={trackData.bpm}
                onChange={e => setTrackData({ ...trackData, bpm: parseInt(e.target.value) || undefined })}
                placeholder="BPM"
                className="border p-1 mb-1 w-full"
            />

            <input
                type="text"
                value={trackData.catalogNumber || ""}
                onChange={e => setTrackData({ ...trackData, catalogNumber: e.target.value })}
                placeholder="Catalog Number"
                className="border p-1 mb-1 w-full"
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-1 rounded mt-1"
            >
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
}
