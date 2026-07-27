// hooks/useFavourites.ts
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

export const useFavourites = () => {
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const [favouriteTracks, setFavouriteTracks] = useState<Track[]>([]);
    const [tracksLoading, setTracksLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFavourites = async () => {
        try {
            setError(null);
            const response = await fetch("/api/user/favourites");

            if (response.ok) {
                const data = await response.json();
                //console.log(data);
                setFavourites(data.favourites);

                if (data.favourites.length > 0) {
                    await fetchTrackDetails(data.favourites);
                }
            } else {
                throw new Error('Failed to fetch favourites');
            }
        } catch (error) {
            console.error("Error fetching favourites:", error);
            setError("Failed to load favourites");
        }
    };

    const fetchTrackDetails = async (favourites: Favourite[]) => {
    setTracksLoading(true);
    try {
        const fetchedTracks: Track[] = [];

        for (const fav of favourites) {
            try {
                // Use doc() and getDoc() since trackId is the Firestore document ID
                const trackDocRef = doc(db, "tracks", fav.trackId);
                const trackDoc = await getDoc(trackDocRef);
                
                if (trackDoc.exists()) {
                    fetchedTracks.push({
                        id: trackDoc.id,
                        ...trackDoc.data(),
                    } as Track);
                } else {
                    console.warn("Track not found for trackId:", fav.trackId);
                }
            } catch (error) {
                console.error("Error fetching track:", fav.trackId, error);
            }
        }

        setFavouriteTracks(fetchedTracks);
    } catch (error) {
        console.error("Error fetching track details:", error);
        setError("Failed to load track details");
    } finally {
        setTracksLoading(false);
    }
};
    // const fetchTrackDetails = async (favourites: Favourite[]) => {
    //     setTracksLoading(true);
    //     try {
    //         const fetchedTracks: Track[] = [];

    //         for (const fav of favourites) {
    //             try {
    //                 const q = query(
    //                     collection(db, "tracks"),
    //                     where("id", "==", fav.trackId)
    //                 );
    //                 const querySnapshot = await getDocs(q);

    //                 if (!querySnapshot.empty) {
    //                     querySnapshot.forEach((doc) => {
    //                         fetchedTracks.push({
    //                             id: doc.id,
    //                             ...doc.data(),
    //                         } as Track);
    //                     });
    //                 } else {
    //                     console.warn("Track not found for admin trackId:", fav.trackId);
    //                 }
    //             } catch (error) {
    //                 console.error("Error querying track by trackId:", fav.trackId, error);
    //             }
    //         }

    //         setFavouriteTracks(fetchedTracks);
    //     } catch (error) {
    //         console.error("Error fetching track details:", error);
    //         setError("Failed to load track details");
    //     } finally {
    //         setTracksLoading(false);
    //     }
    // };

    useEffect(() => {
        fetchFavourites();
    }, []);

    return {
        favourites,
        favouriteTracks,
        tracksLoading,
        error,
        refetch: fetchFavourites,
    };
};