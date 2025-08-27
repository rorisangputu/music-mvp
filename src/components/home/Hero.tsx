import Image from "next/image";
import Link from "next/link";
import React from "react";
import heroIllustration from "../../../public/note.png";
import { Check } from "lucide-react";
type Props = {};

const Hero = (props: Props) => {
  return (
    <section className="relative w-[90%] xl:w-[80%] mx-auto py-20">
      {/* CONTENT */}
      <div className="w-full z-10 relative rounded-md grid grid-cols-1 lg:grid-cols-2 justify-between items-center">
        {/* Hero Content */}
        <div className=" h-full flex flex-col justify-end">
          <div className="space-y-8">
            <h1 className="text-slate-100 text-6xl font-semibold">
              <span className="text-orange-500">High-Quality</span> Sound and
              Music Library
            </h1>
            <p className="text-slate-100 font-light text-lg">
              The ultimate resource for professional sound designers, video
              producers, podcasters, musicians, and anyone who needs top-notch
              audio quality for their projects
            </p>
          </div>
          <div className="flex gap-3 my-10 ">
            <Link
              href={"/library"}
              className="bg-[#ec7027] text-black font-medium p-3 rounded-md"
            >
              Browse Trends
            </Link>
            <Link
              href={"/signup"}
              className="bg-transparent border text-white font-medium p-3 rounded-md"
            >
              Sign Up
            </Link>
          </div>
          <div className="flex space-x-5 py-5">
            <div className="flex space-x-2 items-center">
              <Check className="text-[#ec7027]" size={20} />
              <p className="text-slate-200 text-sm">High-Quality</p>
            </div>
            <div className="flex space-x-2 items-center">
              <Check className="text-[#ec7027]" size={20} />
              <p className="text-slate-200 text-sm">Easy Licensing</p>
            </div>
            <div className="flex space-x-2 items-center">
              <Check className="text-[#ec7027]" size={20} />
              <p className="text-slate-200  text-sm">Regular Availability</p>
            </div>
          </div>
        </div>
        {/* Hero Image */}
        <div className="hidden lg:flex justify-center h-full">
          <Image src={heroIllustration} alt="image" className="w-92" />
          {/* <a href="https://storyset.com/music">
            Music illustrations by Storyset
          </a> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
