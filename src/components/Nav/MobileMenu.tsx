"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type NavUser = {
  name: String;
  email: String;
  id: String;
  type: String;
}

interface MobileMenuProps {
  user?: NavUser;
  onSignOut: () => void;
}

export default function MobileMenu({ user, onSignOut }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <div className="flex md:hidden">
        <button onClick={toggleMenu} className="text-white">
          <Menu size={33} />
        </button>
      </div>

      {/* Full Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button onClick={closeMenu} className="text-white">
              <X size={33} />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {/* Navigation Links */}
            <nav className="text-center">
              <ul className="space-y-6 text-2xl text-white">
                <li>
                  <Link 
                    href="/" 
                    onClick={closeMenu}
                    className="hover:text-orange-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/library" 
                    onClick={closeMenu}
                    className="hover:text-orange-400 transition-colors"
                  >
                    Library
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/licensing" 
                    onClick={closeMenu}
                    className="hover:text-orange-400 transition-colors"
                  >
                    Licensing
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Auth Section */}
            <div className="text-center space-y-4">
              {!user ? (
                <div className="space-y-4">
                  <Link 
                    href="/signup" 
                    onClick={closeMenu}
                    className="block text-white text-xl hover:text-orange-400 transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    className="block bg-orange-600 hover:bg-orange-500 text-black px-6 py-3 font-semibold text-xl transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user?.type === "admin" && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={closeMenu}
                      className="block text-white text-xl hover:text-orange-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.type === "user" && (
                    <Link 
                      href="/profile" 
                      onClick={closeMenu}
                      className="block text-white text-xl hover:text-orange-400 transition-colors"
                    >
                      Profile
                    </Link>
                  )}
                  <Button
                    onClick={() => {
                      onSignOut();
                      closeMenu();
                    }}
                    className="bg-red-600 text-white text-xl hover:bg-red-700 px-6 py-3"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}