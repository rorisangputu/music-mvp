import Link from "next/link";
import React from "react";

type Props = {};

const Nav = (props: Props) => {
  return (
    <div className="w-[70%] mx-auto mt-10">
      <div className="flex justify-between pb-2">
        <h1>CMMG Music Library</h1>
        <div>
          <ul className="flex space-x-4">
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
        </div>
      </div>
    </div>
  );
};

export default Nav;
