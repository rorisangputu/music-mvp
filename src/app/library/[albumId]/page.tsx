// app/album/[albumId]/page.tsx
import AlbumPageClient from "@/components/AlbumPage/AlbumPageClient";
import { getAlbumData } from "@/lib/albums/albumFunc";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";


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



interface AlbumPageProps {
  params: Promise<{ albumId: string }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { albumId } = await params;
  
  const session = await auth();
  const isAdmin = session && (session.user as any)?.type === "admin";
  const isUser = session && (session.user as any)?.type === "user";
  

  const { album, tracks } = await getAlbumData(albumId);

  if (!album) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Album Not Found</h1>
          <p className="text-gray-600">The album you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <AlbumPageClient
      album={album}
      initialTracks={tracks}
      isAdmin={isAdmin}
      isUser={isUser}
    />
  );
}