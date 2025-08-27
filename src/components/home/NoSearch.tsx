import React from "react";
import Link from "next/link";
import Image from "next/image";
import composer from "../../../public/Composer-rafiki.png";
import { MoveRight } from "lucide-react";

interface NoSearchProps {
  className?: string;
}

const NoSearch: React.FC<NoSearchProps> = ({ className = "" }) => {
  return (
    <section
      className={`w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 ${className}`}
      aria-labelledby="nosearch-heading"
    >
      <div className="bg-gradient-to-br from-white via-gray-50 to-orange-50/30 rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">

          {/* Content Section */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  Production Music Excellence
                </div>

                <h1
                  id="nosearch-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                >
                  Your Trusted Source for{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                    African
                  </span>{" "}
                  and International Production Music
                </h1>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                With decades of experience in the industry, CMMG connects
                filmmakers, broadcasters, and media creators with high-quality
                production music. Our close collaborations with African and global
                composers ensure an authentic and diverse catalog tailored for TV,
                radio, film, and multimedia projects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about-us"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/25"
                aria-label="Learn more about CMMG on our About Us page"
              >
                About Us
                <MoveRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  size={20}
                />
              </Link>

              <Link
                href="/catalog"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-orange-500 text-orange-600 font-semibold text-lg rounded-xl hover:bg-orange-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500/25"
              >
                Browse Catalog
                <MoveRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  size={20}
                />
              </Link>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative flex items-center justify-center p-8 sm:p-10 lg:p-12">
            <div className="relative w-full max-w-lg">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-orange-300/20 rounded-3xl transform rotate-3 scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-orange-100/40 to-transparent rounded-3xl transform -rotate-2 scale-110"></div>

              {/* Main image container */}
              <div className="relative bg-white rounded-2xl shadow-xl p-4 transform hover:scale-105 transition-transform duration-500">
                <Image
                  src={composer}
                  alt="Illustration of a composer creating music, representing CMMG's collaboration with African and international musicians"
                  className="w-full h-auto rounded-xl"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-orange-300 rounded-full opacity-60 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoSearch;