import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import free from "../../../public/rat.webp";
import middle from "../../../public/middle.webp";
import lost from "../../../public/lost.webp";
import inmyhead from "../../../public/inmyhead.webp";
import band from "../../../public/band.webp";
import balads from "../../../public/balads.webp";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type Props = {};

const Albums = [
  {
    title: "Free",
    image: free,
    artist: "Leighton Lucas",
  },
  {
    title: "Nocturne Ballads",
    image: balads,
    artist: "Crystal Lake",
  },
  {
    title: "BandOf4",
    image: band,
    artist: "Gilbert Winter",
  },
  {
    title: "In My Head",
    image: inmyhead,
    artist: "max.exe",
  },
  {
    title: "Mid East",
    image: middle,
    artist: "Kyle Wright",
  },
  {
    title: "Lost Highway",
    image: lost,
    artist: "Amanda Brown",
  },
];

const NewReleases = (props: Props) => {
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

          {/* Carousel */}
          <Carousel>
            <CarouselContent className="-ml-1">
              {Albums.map((album, index) => (
                <CarouselItem
                  key={index}
                  className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="space-y-3">
                    <Image
                      src={album.image}
                      alt={album.title}
                      width={300}
                      height={300}
                    />
                    <div>
                      <p className="uppercase font-semibold">{album.title}</p>
                      <p className="text-xs font-light uppercase">
                        {album.artist}
                      </p>
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

export default NewReleases;
