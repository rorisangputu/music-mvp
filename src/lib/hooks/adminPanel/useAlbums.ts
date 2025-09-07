
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Album = {
    id: string;
    title: string;
    releaseDate: string;
    coverImage?: string;
    genre?: string;
};

export const useAlbums = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                setLoading(true);
                setError(null);
                const querySnapshot = await getDocs(collection(db, "albums"));
                const albums = querySnapshot.docs.map((doc) => {
                    const { title, coverImage, releaseDate, genre } = doc.data();
                    return {
                        id: doc.id,
                        title,
                        coverImage,
                        releaseDate,
                        genre,
                    };
                });
                setAlbums(albums);
            } catch (error) {
                console.error("Error fetching albums:", error);
                setError("Failed to fetch albums");
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    return { albums, loading, error };
};