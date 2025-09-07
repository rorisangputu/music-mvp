// hooks/useAlbumEdit.ts
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { TrackMetadata } from "@/types/music";

export interface AlbumData {
    title: string;
    artist: string;
    category: string;
    genre: string;
    description: string;
    releaseDate: string;
}

export const useAlbumEdit = (albumId: string | string[] | undefined) => {
    const [tracks, setTracks] = useState<TrackMetadata[]>([]);
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
    const [error, setError] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<AlbumData | null>(null);

    useEffect(() => {
        const fetchAlbum = async () => {
            if (!albumId) return;

            try {
                setLoading(true);
                setError(null);
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
                    setError("Album not found");
                }
            } catch (error) {
                setError(`Error loading album: ${error instanceof Error ? error.message : "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };
        const fetchTracks = async () => {
            if (!albumId) return;
            try {
                const tracksQuery = query(
                    collection(db, "tracks"),
                    where("albumId", "==", albumId)
                );
                const querySnapshot = await getDocs(tracksQuery);
                const tracksData: TrackMetadata[] = [];
                querySnapshot.forEach(doc => {
                    tracksData.push({ ...doc.data(), id: doc.id } as TrackMetadata & { id: string });
                });
                setTracks(tracksData);
            } catch (err) {
                console.error("Failed to fetch tracks:", err);
            }
        };
        fetchTracks();
        fetchAlbum();
    }, [albumId]);

    const updateAlbum = async (data: AlbumData): Promise<{ success: boolean; error?: string }> => {
        if (!albumId) return { success: false, error: "No album ID provided" };

        try {
            setSaving(true);
            setError(null);

            await updateDoc(doc(db, "albums", albumId as string), {
                ...data,
                updatedAt: new Date().toISOString(),
            });

            setOriginalData({ ...data });
            return { success: true };
        } catch (error) {
            const errorMessage = `Update failed: ${error instanceof Error ? error.message : "Unknown error"}`;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    const updateTrack = async (trackId: string, data: Partial<TrackMetadata>) => {
        try {
            await updateDoc(doc(db, "tracks", trackId), data);
            setTracks(prev => prev.map(t => t.id === trackId ? { ...t, ...data } : t));
            return { success: true };
        } catch (err) {
            console.error("Update track failed:", err);
            return { success: false, error: err instanceof Error ? err.message : "Unknown" };
        }
    };

    const resetToOriginal = () => {
        if (originalData) {
            setAlbumData({ ...originalData });
        }
    };

    const hasChanges = originalData && JSON.stringify(albumData) !== JSON.stringify(originalData);

    return {
        albumData,
        setAlbumData,
        tracks,
        updateTrack,
        loading,
        saving,
        error,
        originalData,
        hasChanges,
        updateAlbum,
        resetToOriginal,
    };
};