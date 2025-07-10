import React from "react";

import Link from "next/link";
import Image from "next/image";
import composer from "../../../public/Composer-rafiki.png";
import { MoveRight } from "lucide-react";

type Props = {};

const NoSearch = (props: Props) => {
  return (
    <div className="w-[90%] lg:w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 px-10 rounded-xl shadow-xl bg-white ">
      <div className="flex flex-col justify-center p-5 space-y-5">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">
            Your Trusted Source for African and International Production Music
          </h1>
          <p className="text-sm text-gray-600">
            With decades of experience in the industry, CMMG connects
            filmmakers, broadcasters, and media creators with high-quality
            production music. Our close collaborations with African and global
            composers ensure an authentic and diverse catalog tailored for TV,
            radio, film, and multimedia projects.
          </p>
        </div>

        <Link
          href={"/about-us"}
          className="text-orange-500 font-medium text-lg flex gap-4 items-center"
        >
          About Us
          <MoveRight />
        </Link>
      </div>

      <div>
        <Image src={composer} alt="image" />
      </div>
    </div>
  );
};

export default NoSearch;
