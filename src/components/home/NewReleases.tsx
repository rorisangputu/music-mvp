"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  genre?: string;
  artist?: string;
  createdAt?: any; // For ordering by creation date
};

type Props = {};

const NewReleases = (props: Props) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAlbums = async () => {
      try {
        // Create a query to get the latest albums (ordered by creation date, limited to 6)
        const albumsQuery = query(
          collection(db, "albums"),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const querySnapshot = await getDocs(albumsQuery);
        const data = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Album
        );

        setAlbums(data);
      } catch (error) {
        console.error("Error fetching albums:", error);
        // Fallback to getting all albums if orderBy fails (in case createdAt field doesn't exist)
        try {
          const fallbackQuery = query(collection(db, "albums"), limit(6));
          const querySnapshot = await getDocs(fallbackQuery);
          const data = querySnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Album
          );
          setAlbums(data);
        } catch (fallbackError) {
          console.error("Error with fallback query:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAlbums();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-10 lg:py-12">
        <div className="w-[90%] lg:w-[80%] mx-auto">
          <div className="space-y-5">
            <div className="flex justify-between">
              <h1 className="text-xl lg:text-2xl font-semibold">Latest Albums</h1>
              <Button className="bg-transparent text-black shadow-none">
                <Link href={"/albums"} className="uppercase">
                  Show all
                </Link>
              </Button>
            </div>
            <div className="text-center py-8">
              <p>Loading latest albums...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 lg:py-12">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="space-y-5">
          <div className="flex justify-between">
            <h1 className="text-xl lg:text-2xl font-semibold">Latest Albums</h1>
            <Button className="bg-transparent text-black shadow-none">
              <Link href={"/albums"} className="uppercase">
                Show all
              </Link>
            </Button>
          </div>

          {albums.length > 0 ? (
            <Carousel>
              <CarouselContent className="-ml-1">
                {albums.map((album) => (
                  <CarouselItem
                    key={album.id}
                    className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Link href={`/albums/${album.id}`}>
                      <div className="space-y-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <Image
                          src={album.coverImage || "/placeholder-album.jpg"}
                          alt={album.title}
                          width={300}
                          height={300}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <p className="uppercase font-semibold">{album.title}</p>
                          <p className="text-xs font-light uppercase">
                            {album.artist || "Unknown Artist"}
                          </p>
                          {album.genre && (
                            <p className="text-xs text-gray-500 mt-1">
                              {album.genre}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No albums found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewReleases;