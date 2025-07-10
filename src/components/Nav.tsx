import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Nav = () => {
  return (
    <div className="w-[90%] xl:w-[80%] mx-auto mt-10 text-white">
      <div className="flex items-center justify-between">
        <div className="">
          <Image
            src={
              "https://cmmg.co.za/wp-content/uploads/2025/03/music-content-1-300x169.png"
            }
            alt="cmmg"
            width={150}
            height={150}
          />
        </div>
        <div className="flex w-[60%]">
          <div className="w-full flex items-center justify-between">
            <div className="flex">
              <ul className="hidden md:flex space-x-4">
                <li className="text-md">
                  <Link href={"/"}>Home</Link>
                </li>
                <li className="text-md">
                  <Link href={"/albums"}>Library</Link>
                </li>
                <li className="text-md">
                  <Link href={"/licensing"}>Licensing</Link>
                </li>
              </ul>
            </div>
            <div className="hidden md:flex">
              <Button className="text-md">Sign Up</Button>
              <Button className="bg-[#ec7027] text-md text-black">
                Sign In
              </Button>
            </div>
          </div>
          <div className="flex md:hidden">
            <Menu size={33} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
