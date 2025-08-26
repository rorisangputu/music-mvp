"use client";
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

type Album = {
  id: string;
  title: string;
  releaseDate: string;
  coverImage?: string;
  genre?: string;
};

const AlbumsList = () => {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const querySnapshot = await getDocs(collection(db, "albums"));
      const albums = querySnapshot.docs.map((doc) => {
        const { title, coverImage, releaseDate } = doc.data();
        return {
          id: doc.id,
          title,
          coverImage,
          releaseDate,
        };
      });
      setAlbums(albums);
    };

    fetchAlbums();
  }, []);



  return (
    <div className="flex flex-col gap-4">
      {albums.map((album) => (
        <div
          key={album.id}
          className="flex gap-4 border p-4 rounded shadow w-full justify-between items-start"
        >
          {album.coverImage && (
            <Image
              src={album.coverImage}
              alt={album.title}
              width={100}
              height={100}
              className="rounded object-cover"
              unoptimized
            />

          )}

          <div className="flex-1">
            <h2 className="font-semibold text-lg">{album.title}</h2>
            <p className="text-sm text-gray-600">{album.releaseDate}</p>
            {album.genre && <p className="text-sm italic">{album.genre}</p>}

            <div className="mt-4 flex gap-2">
              <Link
                href={`/albums/${album.id}`}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View
              </Link>
              <Link
                href={`/admin/albums/${album.id}/edit`}
                className="px-4 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumsList;
