import Hero from "@/components/home/Hero";
import Image from "next/image";
import Link from "next/link";
import bg from "../../public/bg.png";
import NewReleases from "@/components/home/NewReleases";
import TrendingPlaylist from "@/components/home/TrendingPlaylist";
import NoSearch from "@/components/home/NoSearch";
import HomeTrackSearch from "@/components/home/HomeTrackSearch";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="w-full mx-auto">
      <div className="">
        {/* Background Image Layer */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={bg} // replace with your image path
            alt="Background"
            className="w-full h-[100vh] object-cover opacity-50"
          />
        </div>
        <Hero />
      </div>

      <div className="bg-gray-50">
        <Suspense fallback={null}>
          <HomeTrackSearch />
        </Suspense>
        <NewReleases />
        <TrendingPlaylist />
        <NoSearch />
      </div>
    </div>
  );
}
