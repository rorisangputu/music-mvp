// app/_components/Nav.tsx
"use client";

import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

type NavUser = {
  name: String;
  email: String;
  id: String;
  type: String;
}

export default function Nav() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<NavUser | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Get auth session on client side
    const getSession = async () => {
      const sessionData = await auth();
      setSession(sessionData);
      setUser(sessionData?.user as NavUser | undefined);
    };
    getSession();
  }, []);

  async function handleSignOut() {
    await signOut({ redirectTo: "/" });
    setMenuOpen(false);
  }

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Library", href: "/library" },
    { title: "Licensing", href: "/licensing" },
  ];

  return (
    <>
      <div className="w-[90%] xl:w-[80%] mx-auto mt-7 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Image
              src="https://cmmg.co.za/wp-content/uploads/2025/03/music-content-1-300x169.png"
              alt="cmmg"
              width={120}
              height={120}
            />
          </div>

          <div className="flex w-[60%]">
            <div className="w-full flex items-center justify-between">
              <ul className="hidden md:flex space-x-4 text-md">
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href}>{link.title}</Link>
                  </li>
                ))}
              </ul>

              <div className="md:flex items-center space-x-2">
                {!user ? (
                  <div className="hidden md:flex space-x-5 md:items-center">
                    <Link href="/signup" className="cursor-pointer hover:underline">
                      Sign Up
                    </Link>
                    <Link
                      href="/signin"
                      className="text-white bg-orange-600 hover:bg-orange-500 text-md text-black px-3 py-2 font-semibold"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className="hidden md:flex flex-row items-center space-x-5">
                    {user?.type === "admin" && (
                      <Link href="/admin/dashboard">Dashboard</Link>
                    )}
                    {user?.type === "user" && (
                      <Link href="/profile">Profile</Link>
                    )}
                    <form action={handleSignOut}>
                      <Button
                        type="submit"
                        className="bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Sign Out
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="flex md:hidden">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-white"
              >
                <Menu size={33} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex flex-col p-8 text-white transition-all duration-300">
          <div className="flex justify-between items-start mb-8">
            <Image
              src="https://cmmg.co.za/wp-content/uploads/2025/03/music-content-1-300x169.png"
              alt="cmmg"
              width={100}
              height={100}
            />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white"
            >
              <X size={33} />
            </button>
          </div>

          <div className="flex flex-col space-y-8">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-4xl font-light hover:text-orange-600 transition duration-200 border-b border-gray-800 pb-4"
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="mt-12 space-y-4">
            {!user ? (
              <div className="flex flex-col space-y-4">
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-xl text-center py-3 border border-white hover:bg-white hover:text-black transition duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="text-xl text-center py-3 bg-orange-600 hover:bg-orange-500 text-black font-semibold transition duration-200"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {user?.type === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-xl text-center py-3 border border-white hover:bg-white hover:text-black transition duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                {user?.type === "user" && (
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-xl text-center py-3 border border-white hover:bg-white hover:text-black transition duration-200"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-xl text-center py-3 bg-red-600 hover:bg-red-700 text-white transition duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}