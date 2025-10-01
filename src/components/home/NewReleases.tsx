"use client";

import React, { cache, useEffect, useState } from "react";
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
import { MoveRight, Music, Calendar, User } from "lucide-react";

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

interface NewReleasesProps {
  className?: string;
}

const NewReleases: React.FC<NewReleasesProps> = ({ className = "" }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAlbums = cache(async () => {
      try {
        // Create a query to get the latest albums (ordered by creation date, limited to 6)
        const albumsQuery = query(
          collection(db, "albums"),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const querySnapshot = await getDocs(albumsQuery);
        const data = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              category: doc.data().category, // Access category from doc.data()
              coverImage: doc.data().coverImage, // Access category from doc.data()
              genre: doc.data().genre, // Access category from doc.data()
              title: doc.data().title, // Access category from doc.data()
              artist: doc.data().artist, // Access category from doc.data()
            }) as Album
        );
        console.log(data)

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
    });

    fetchLatestAlbums();
  }, []);

  // Loading Skeleton Component
  const AlbumSkeleton = () => (
    <div className="space-y-4">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className={`w-full py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Music className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Latest Albums
                  </h2>
                </div>
                <p className="text-gray-600 text-lg">
                  Discover our newest additions to the collection
                </p>
              </div>

              <Button
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/library" className="flex items-center gap-2">
                  <span>Show All</span>
                  <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Loading Skeletons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, index) => (
                <AlbumSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Music className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Latest Albums
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Discover our newest additions to the collection
              </p>
            </div>

            <Button
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href="/library" className="flex items-center gap-2">
                <span>Show All</span>
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Albums Content */}
          {albums.length > 0 ? (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {albums.map((album, index) => (
                    <CarouselItem
                      key={album.id}
                      className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                    >
                      <Link href={`/library/${album.id}`}>
                        <div className="group space-y-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]">
                          {/* Album Cover */}
                          <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
                            <Image
                              src={album.coverImage || "/placeholder-album.jpg"}
                              alt={`${album.title} album cover`}
                              width={300}
                              unoptimized
                              height={300}
                              className="aspect-square object-cover transition-transform duration-500 group-hover:scale-110"

                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center gap-2 text-white text-sm">
                                  <Calendar className="h-4 w-4" />
                                  <span>New Release</span>
                                </div>
                              </div>
                            </div>

                            {/* Genre Badge */}
                            {album.genre && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                                  {album.genre}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Album Info */}
                          <div className="space-y-2 px-1">
                            <h3 className="font-bold text-gray-900 text-sm lg:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                              {album.title}
                            </h3>

                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="h-3 w-3" />
                              <p className="text-xs lg:text-sm font-medium truncate">
                                {album.artist || "Unknown Artist"}
                              </p>
                            </div>

                            {album.category && (
                              <div className="inline-block">
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                                  {album.category}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Navigation */}
                <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all" />
                <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all" />
              </Carousel>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Music className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No Albums Found</h3>
                <p className="text-gray-600">
                  We're working on adding new albums to our collection. Check back soon!
                </p>
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/library">Browse All Music</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewReleases;