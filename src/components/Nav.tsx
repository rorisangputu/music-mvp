import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import MobileMenu from "../components/Nav/MobileMenu";
import logo from "../../public/cmmg-logo.png";

type NavUser = {
  name: string;
  email: string;
  id: string;
  type: string;
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Licensing", href: "/licensing" },
];

export default async function Nav() {
  const session = await auth();
  const user = session?.user as NavUser | undefined;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        /* ── Root ── */
        .lib-nav-root {
          width: 100%;
          background: #fffcf2;
          border-bottom: 1px solid #ccc5b9;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        /* Orange top stripe */
        .lib-nav-root::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
          pointer-events: none;
        }

        .lib-nav-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 3rem;
          height: 64px;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
        }

        /* ── Logo ── */
        .lib-nav-logo {
          display: flex;
          align-items: center;
          border-right: 1px solid #ccc5b9;
          padding-right: 2rem;
          margin-right: 2rem;
          flex-shrink: 0;
        }
        .lib-nav-logo img {
          height: 32px;
          width: auto;
          filter: brightness(0);
          opacity: 0.85;
        }

        /* Library badge */
        .lib-nav-badge {
          font-family: 'Manrope', sans-serif;
          font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #eb5e28;
          border: 1px solid rgba(235,94,40,0.35);
          padding: 0.15rem 0.5rem;
          align-self: center;
          margin-left: 0.75rem;
          flex-shrink: 0;
        }

        /* ── Center links ── */
        .lib-nav-links {
          display: flex;
          align-items: stretch;
          gap: 0;
          flex: 1;
        }
        .lib-nav-link {
          font-family: 'Manrope', sans-serif;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39;
          text-decoration: none;
          display: flex; align-items: center;
          padding: 0 1.25rem;
          position: relative;
          transition: color 0.2s ease;
          border-right: 1px solid transparent;
        }
        .lib-nav-link::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .lib-nav-link:hover { color: #eb5e28; }
        .lib-nav-link:hover::after { transform: scaleX(1); }

        /* ── Right: auth ── */
        .lib-nav-auth {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-left: 1px solid #ccc5b9;
          padding-left: 2rem;
          flex-shrink: 0;
        }

        .lib-nav-signup {
          font-family: 'Manrope', sans-serif;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; text-decoration: none;
          transition: color 0.2s ease;
        }
        .lib-nav-signup:hover { color: #eb5e28; }

        .lib-nav-signin {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28;
          border: none; padding: 0.55rem 1.25rem;
          text-decoration: none;
          display: inline-flex; align-items: center;
          transition: background 0.2s ease, transform 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .lib-nav-signin:hover { background: #d44c10; transform: translateY(-1px); }

        /* User actions */
        .lib-nav-user {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .lib-nav-user-link {
          font-family: 'Manrope', sans-serif;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; text-decoration: none;
          transition: color 0.2s ease;
        }
        .lib-nav-user-link:hover { color: #eb5e28; }

        .lib-nav-signout {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #252422;
          border: none; padding: 0.55rem 1.25rem;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: background 0.2s ease;
        }
        .lib-nav-signout:hover { background: #403d39; }

        /* ── Mobile: hide links, show hamburger ── */
        .lib-nav-links   { display: none; }
        .lib-nav-auth    { display: none; }

        @media (min-width: 768px) {
          .lib-nav-links { display: flex; }
          .lib-nav-auth  { display: flex; }
        }

        @media (max-width: 767px) {
          .lib-nav-inner { padding: 0 1.5rem; }
          .lib-nav-logo  { border-right: none; padding-right: 0; margin-right: 0; }
        }
      `}</style>

      <nav className="lib-nav-root">
        <div className="lib-nav-inner">

          {/* Logo */}
          <div className="lib-nav-logo">
            <Link href="/" aria-label="CMMG Home">
              <Image src={logo} alt="CMMG Logo" height={32} style={{ width: "auto", height: 32 }} />
            </Link>
            <span className="lib-nav-badge">Library</span>
          </div>

          {/* Center nav links */}
          <div className="lib-nav-links">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="lib-nav-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="lib-nav-auth">
            {!user ? (
              <>
                <Link href="/signup" className="lib-nav-signup">Sign Up</Link>
                <Link href="/signin" className="lib-nav-signin">Sign In</Link>
              </>
            ) : (
              <div className="lib-nav-user">
                {user.type === "admin" && (
                  <Link href="/admin/dashboard" className="lib-nav-user-link">
                    Dashboard
                  </Link>
                )}
                {user.type === "user" && (
                  <Link href="/profile" className="lib-nav-user-link">
                    Profile
                  </Link>
                )}
                <form action={handleSignOut}>
                  <button type="submit" className="lib-nav-signout">
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Mobile menu — unchanged behaviour */}
          <MobileMenu
            user={user}
            onSignOut={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />

        </div>
      </nav>
    </>
  );
}