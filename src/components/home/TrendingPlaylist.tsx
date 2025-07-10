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

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = {};

const TrendingPlaylist = (props: Props) => {
  return (
    <div className="w-full py-10">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="space-y-5">
          <div className="flex justify-between">
            <h1 className="text-xl lg:text-2xl font-semibold">
              Trending Playlists
            </h1>
            <Button className="bg-transparent text-black shadow-none">
              <Link href={"/albums"} className="uppercase">
                Show all
              </Link>
            </Button>
          </div>

          {/* Carousel */}
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {playlists.map((playlist, i) => (
                <CarouselItem
                  key={i}
                  className="pl-1 md:basis-1/2 lg:basis-1/4"
                >
                  <div className="relative border h-[50vh] w-full">
                    <Image
                      src={playlist.image}
                      alt={playlist.title}
                      fill
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end">
                      <div className="w-full px-4 py-4 h-[20%] bg-gradient-to-t from-black/90 to-transparent">
                        <p className="text-white font-semibold uppercase">
                          {playlist.title}
                        </p>
                        <p className="text-white text-sm">
                          {playlist.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default TrendingPlaylist;

const playlists = [
  {
    title: "Amapiano",
    image: amapiano,
    description: "The best of amapiano sounds",
  },
  {
    title: "Pop",
    image: pop,
    description: "The best of amapiano sounds",
  },
  {
    title: "TV",
    image: tv,
    description: "The best of amapiano sounds",
  },
  {
    title: "Africa",
    image: africa,
    description: "The best of amapiano sounds",
  },
  {
    title: "Victory Music",
    image: victory,
    description: "The best of amapiano sounds",
  },
  {
    title: "Classical",
    image: classical,
    description: "The best of amapiano sounds",
  },
];
