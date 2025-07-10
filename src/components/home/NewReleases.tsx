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

type Props = {};

const NewReleases = (props: Props) => {
  return (
    <div className="w-full  py-10 lg:py-12">
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
          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-6 gap-5">
            {Albums.map((album, i) => (
              <div key={i} className="space-y-3">
                <Image src={album.image} alt="free" width={200} height={200} />
                <div>
                  <p className="uppercase font-semibold">{album.title}</p>
                  <p className="text-xs font-light uppercase">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReleases;

const Albums = [
  {
    title: "Free",
    image: free, // ✅ Direct assignment
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
