import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";

type albumProps={
    albumId: string;

}

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
  isrc: string;
  trackNumber: number;
  downloadable: boolean;
  createdAt: string;
  albumId: string;
};

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  genre?: string;
  cueSheet: string;
};

const convertSecondsToMinutes = (seconds: number): string => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0)
    return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatDuration = (timestamp: Timestamp): string => {
  const seconds = timestamp.seconds;
  if (seconds < 0 || seconds > 3600) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString().split("T")[0];
};

export async function getAlbumData(albumId: string) {
  const albumDoc = await getDoc(doc(db, "albums", albumId));
  
  if (!albumDoc.exists()) {
    return { album: null, tracks: [] };
  }

  const album = {
    id: albumDoc.id,
    ...albumDoc.data(),
  } as Album;

  // Fetch tracks by albumId
  const q = query(
    collection(db, "tracks"),
    where("albumId", "==", albumId)
  );
  
  const querySnapshot = await getDocs(q);
  const tracks = querySnapshot.docs.map((doc) => {
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

  const sortedTracks = tracks.sort((a, b) => a.title.localeCompare(b.title));

  return { album, tracks: sortedTracks };
}

 // Server-side authentication check
