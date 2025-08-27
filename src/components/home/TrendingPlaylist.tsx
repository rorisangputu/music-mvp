import React from "react";
import africa from "../../../public/africa.jpg";
import amapiano from "../../../public/amapiano.jpg";
import classical from "../../../public/classical.webp";
import pop from "../../../public/pop.jpg";
import tv from "../../../public/tv.jpeg";
import victory from "../../../public/victory music.jpg";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { Play, TrendingUp, MoveRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TrendingPlaylistProps {
  className?: string;
}

const TrendingPlaylist: React.FC<TrendingPlaylistProps> = ({ className = "" }) => {
  return (
    <section className={`w-full py-12 lg:py-16 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Trending Playlists
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Discover the most popular music collections right now
              </p>
            </div>

            <Button
              variant="outline"
              className="group border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <Link href="/albums" className="flex items-center gap-2 uppercase font-semibold">
                <span>Show All</span>
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {playlists.map((playlist, i) => (
                  <CarouselItem
                    key={i}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="group relative h-[450px] w-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02]">
                      {/* Background Image */}
                      <Image
                        src={playlist.image}
                        alt={`${playlist.title} playlist cover`}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40"></div>

                      {/* Play Button - Appears on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="h-8 w-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                      </div>

                      {/* Trending Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          TRENDING
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="p-6 space-y-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          {/* Category Tag */}
                          <div className="inline-block">
                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md border border-white/30">
                              {playlist.category || "Playlist"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-white font-bold text-xl lg:text-2xl uppercase tracking-wide drop-shadow-lg">
                            {playlist.title}
                          </h3>

                          {/* Description */}
                          <p className="text-white/90 text-sm lg:text-base leading-relaxed drop-shadow-sm">
                            {playlist.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-white/80 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span>{playlist.trackCount || "25+"} tracks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{playlist.popularity || "Hot"}</span>
                            </div>
                          </div>

                          {/* Action Button - Hidden by default, shows on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2">
                            <Button
                              size="sm"
                              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                            >
                              Explore Playlist
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation */}
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all shadow-lg" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all shadow-lg" />
            </Carousel>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span className="text-sm font-medium">
                Join thousands discovering new music daily
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingPlaylist;

const playlists = [
  {
    title: "Amapiano",
    image: amapiano,
    description: "The infectious beats and soulful melodies of South Africa's hottest genre",
    category: "Electronic",
    trackCount: "32",
    popularity: "🔥 Hot"
  },
  {
    title: "Pop Hits",
    image: pop,
    description: "Chart-topping anthems and unforgettable pop classics",
    category: "Pop",
    trackCount: "28",
    popularity: "📈 Rising"
  },
  {
    title: "TV & Film",
    image: tv,
    description: "Cinematic scores and memorable TV show soundtracks",
    category: "Soundtrack",
    trackCount: "45",
    popularity: "🎬 Featured"
  },
  {
    title: "African Rhythms",
    image: africa,
    description: "Traditional and contemporary sounds from across the continent",
    category: "World Music",
    trackCount: "38",
    popularity: "🌍 Global"
  },
  {
    title: "Victory Anthems",
    image: victory,
    description: "Triumphant orchestral pieces for your most epic moments",
    category: "Orchestral",
    trackCount: "24",
    popularity: "🏆 Epic"
  },
  {
    title: "Classical Elegance",
    image: classical,
    description: "Timeless masterpieces from the world's greatest composers",
    category: "Classical",
    trackCount: "52",
    popularity: "🎼 Timeless"
  },
];