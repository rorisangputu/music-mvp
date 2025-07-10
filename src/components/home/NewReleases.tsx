import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

type Props = {};

const NewReleases = (props: Props) => {
  return (
    <div className="w-full bg-gray-50 py-5">
      <div className="w-[90%] mx-auto">
        <div className="space-y-5">
          <div className="flex justify-between">
            <h1 className="text-xl lg:text-2xl font-semibold">Latest Albums</h1>
            <Button className="bg-transparent text-black shadow-none">
              <Link href={"/albums"} className="uppercase">
                Show all
              </Link>
            </Button>
          </div>
                  <div>
                      
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReleases;
