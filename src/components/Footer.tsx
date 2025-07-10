import React from "react";
import Link from "next/link";

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="w-full text-white py-10">
      <div className="w-[90%] lg:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold mb-3">CMMG</h2>
          <p className="text-sm text-gray-400">
            Your trusted source for African and international production music
            for film, TV, radio, and media. Bringing authentic sounds to the
            world for over 20 years.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/albums" className="hover:underline">
                Albums
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <p className="text-sm text-gray-300">Johannesburg, South Africa</p>
          <p className="text-sm text-gray-300 mt-2">Email: info@cmmg.com</p>
          <p className="text-sm text-gray-300">Phone: +27 10 123 4567</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-10 border-t border-gray-700 pt-5 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} CMMG. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
