// app/albums/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
};

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const querySnapshot = await getDocs(collection(db, "albums"));
      const data = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Album)
      );
      setAlbums(data);
    };

    fetchAlbums();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Music Albums</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="p-4 border rounded shadow hover:shadow-lg transition"
          >
            <Image
              src={album.coverImage || ""}
              alt={album.title}
              width={400}
              height={400}
            />
            <div>
              <h2 className="text-lg font-semibold">{album.title}</h2>
              <p className="text-sm">{album.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
