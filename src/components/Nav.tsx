import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Nav = () => {
  return (
    <div className="w-[90%] md:w-[80%] mx-auto mt-10 text-white">
      <div className="flex items-center justify-between pb-2 ">
        <div>
          <Image
            src={
              "https://cmmg.co.za/wp-content/uploads/2025/03/music-content-1-300x169.png"
            }
            alt="cmmg"
            width={150}
            height={150}
          />
        </div>
        <div>
          <ul className="hidden md:flex space-x-4">
            <li>
              <Link href={"/"}>Home</Link>
            </li>
            <li>
              <Link href={"/albums"}>Library</Link>
            </li>
            <li>
              <Link href={"/licensing"}>Licensing</Link>
            </li>
          </ul>
          <div className="flex md:hidden">
            <Menu size={33} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
