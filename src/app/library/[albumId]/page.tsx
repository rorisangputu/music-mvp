// app/album/[albumId]/page.tsx
import AlbumPageClient from "@/components/AlbumPage/AlbumPageClient";
import { getAlbumData } from "@/lib/albums/albumFunc";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Music } from "lucide-react";

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
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

          .alb-nf-root {
            width: 100%; min-height: 100vh; background: #fffcf2;
            display: flex; align-items: center; justify-content: center;
            padding: 3rem;
          }
          .alb-nf-box {
            border: 1px solid #ccc5b9; background: #fffcf2;
            padding: 4rem 3rem; max-width: 420px; width: 100%;
            display: flex; flex-direction: column; align-items: center;
            text-align: center; gap: 1.25rem; position: relative; overflow: hidden;
          }
          .alb-nf-box::before {
            content: ''; position: absolute; top: 0; left: 0;
            width: 100%; height: 3px; background: #eb5e28;
          }
          .alb-nf-icon {
            width: 56px; height: 56px; border: 1px solid #ccc5b9;
            display: flex; align-items: center; justify-content: center;
            color: #ccc5b9;
          }
          .alb-nf-title {
            font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
            font-size: clamp(1.4rem, 2.6vw, 1.9rem); letter-spacing: -0.02em;
            text-transform: uppercase; color: #252422;
          }
          .alb-nf-desc {
            font-family: 'Manrope', sans-serif; font-size: 0.82rem;
            color: #403d39; opacity: 0.6; line-height: 1.6; max-width: 300px;
          }
        `}</style>

        <div className="alb-nf-root">
          <div className="alb-nf-box">
            <div className="alb-nf-icon">
              <Music size={22} />
            </div>
            <h1 className="alb-nf-title">Album Not Found</h1>
            <p className="alb-nf-desc">
              The album you&rsquo;re looking for doesn&rsquo;t exist or may have
              been removed.
            </p>
          </div>
        </div>
      </>
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
