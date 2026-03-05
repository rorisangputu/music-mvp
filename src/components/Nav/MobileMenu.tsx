"use client";

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";

type NavUser = {
  name: string;
  email: string;
  id: string;
  type: string;
};

interface MobileMenuProps {
  user?: NavUser;
  onSignOut: () => void;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Licensing", href: "/licensing" },
];

export default function MobileMenu({ user, onSignOut }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        /* ── Hamburger button ── */
        .lib-mob-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border: 1px solid #ccc5b9;
          background: none; cursor: pointer;
          color: #403d39;
          transition: border-color 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }
        .lib-mob-btn:hover { border-color: #eb5e28; color: #eb5e28; }

        /* Only show on mobile */
        @media (min-width: 768px) { .lib-mob-btn { display: none; } }

        /* ── Overlay ── */
        .lib-mob-overlay {
          position: fixed; inset: 0;
          z-index: 9999;
          background: #fffcf2;
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        /* Orange top stripe */
        .lib-mob-overlay::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
        }

        /* ── Top bar ── */
        .lib-mob-topbar {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 64px;
          border-bottom: 1px solid #ccc5b9;
          flex-shrink: 0;
        }
        .lib-mob-topbar-label {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #ccc5b9;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .lib-mob-topbar-label::before {
          content: ''; display: block;
          width: 20px; height: 1px; background: #eb5e28;
        }
        .lib-mob-close {
          width: 40px; height: 40px;
          border: 1px solid #ccc5b9;
          background: none; cursor: pointer;
          color: #403d39;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .lib-mob-close:hover { border-color: #eb5e28; background: #eb5e28; color: #fffcf2; }

        /* ── Nav links ── */
        .lib-mob-links {
          flex: 1;
          display: flex; flex-direction: column;
          border-bottom: 1px solid #ccc5b9;
          overflow-y: auto;
        }
        .lib-mob-link {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 8vw, 3.5rem);
          letter-spacing: -0.02em; text-transform: uppercase;
          color: #252422; text-decoration: none;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #ccc5b9;
          display: flex; align-items: center;
          justify-content: space-between;
          position: relative; overflow: hidden;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .lib-mob-link:last-child { border-bottom: none; }
        .lib-mob-link:hover { color: #eb5e28; background: rgba(235,94,40,0.04); }
        .lib-mob-link svg { opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; }
        .lib-mob-link:hover svg { opacity: 1; transform: translateX(4px); }

        /* ── Auth section ── */
        .lib-mob-auth {
          padding: 2rem 1.5rem;
          display: flex; flex-direction: column;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .lib-mob-signup {
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; text-decoration: none;
          padding: 0.9rem 1.25rem;
          border: 1px solid #ccc5b9;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .lib-mob-signup:hover { border-color: #eb5e28; color: #eb5e28; }

        .lib-mob-signin {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28;
          border: none; padding: 0.9rem 1.25rem;
          text-decoration: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem;
          transition: background 0.2s ease;
        }
        .lib-mob-signin:hover { background: #d44c10; }

        .lib-mob-user-link {
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; text-decoration: none;
          padding: 0.9rem 1.25rem;
          border: 1px solid #ccc5b9;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .lib-mob-user-link:hover { border-color: #eb5e28; color: #eb5e28; }

        .lib-mob-signout {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #252422;
          border: none; padding: 0.9rem 1.25rem;
          cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
        }
        .lib-mob-signout:hover { background: #403d39; }

        /* ── Footer note ── */
        .lib-mob-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #ccc5b9;
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #ccc5b9;
          display: flex; align-items: center; gap: 0.6rem;
          flex-shrink: 0;
        }
        .lib-mob-footer::before {
          content: ''; display: block;
          width: 16px; height: 1px; background: #eb5e28;
        }
      `}</style>

      {/* Hamburger */}
      <button
        className="lib-mob-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="lib-mob-overlay">

          {/* Top bar */}
          <div className="lib-mob-topbar">
            <span className="lib-mob-topbar-label">Menu</span>
            <button
              className="lib-mob-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="lib-mob-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="lib-mob-link"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
                <ArrowRight size={20} />
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="lib-mob-auth">
            {!user ? (
              <>
                <Link href="/signup" className="lib-mob-signup" onClick={() => setIsOpen(false)}>
                  Create Account
                </Link>
                <Link href="/signin" className="lib-mob-signin" onClick={() => setIsOpen(false)}>
                  Sign In
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                {user.type === "admin" && (
                  <Link href="/admin/dashboard" className="lib-mob-user-link" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                )}
                {user.type === "user" && (
                  <Link href="/profile" className="lib-mob-user-link" onClick={() => setIsOpen(false)}>
                    Profile
                  </Link>
                )}
                <form action={onSignOut}>
                  <button
                    type="submit"
                    className="lib-mob-signout"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Out
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="lib-mob-footer">
            CMMG Production Music Library
          </div>

        </div>
      )}
    </>
  );
}