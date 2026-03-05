import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react";

import amapiano from "../../../public/amapiano.jpg";
import classical from "../../../public/classical.webp";
import pop from "../../../public/pop.jpg";
import tv from "../../../public/tv.jpeg";
import victory from "../../../public/victory music.jpg";
import africa from "../../../public/africa.jpg";

const playlists = [
  {
    id: "afro-tech-house",
    title: "Afro Tech House",
    image: amapiano,
    description: "High-energy Afro Tech and House beats with African rhythms",
    category: "Electronic",
    popularity: "Hot",
  },
  {
    id: "african-rhythms",
    title: "African Rhythms",
    image: africa,
    description: "Traditional and contemporary sounds from across the continent",
    category: "World Music",
    popularity: "Global",
  },
  {
    id: "cinematic-orchestral",
    title: "Cinematic & Orchestral",
    image: tv,
    description: "Epic orchestral and dramatic cinematic compositions",
    category: "Cinematic",
    popularity: "Featured",
  },
  {
    id: "corporate-upbeat",
    title: "Corporate & Upbeat",
    image: victory,
    description: "Professional, motivational tracks for business and presentations",
    category: "Corporate",
    popularity: "Rising",
  },
  {
    id: "electronic-dance",
    title: "Electronic Dance",
    image: pop,
    description: "Energetic electronic, techno, and house music",
    category: "Electronic",
    popularity: "Energy",
  },
  {
    id: "ambient-chill",
    title: "Ambient & Chill",
    image: classical,
    description: "Mellow, atmospheric tracks for relaxation and focus",
    category: "Ambient",
    popularity: "Timeless",
  },
];

const TrendingPlaylists = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .lib-tp-root {
          width: 100%;
          background: #252422;
          border-top: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }

        /* Dot grid */
        .lib-tp-root::after {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(204,197,185,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0;
        }

        /* Orange left stripe */
        .lib-tp-root::before {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          background: linear-gradient(to bottom, transparent, #eb5e28 20%, #eb5e28 80%, transparent);
          pointer-events: none; z-index: 2;
        }

        .lib-tp-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 5rem 3rem;
          position: relative; z-index: 1;
        }

        /* ── Header ── */
        .lib-tp-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: flex-end;
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(204,197,185,0.12);
        }
        .lib-tp-eyebrow {
          display: flex; align-items: center;
          gap: 0.75rem; margin-bottom: 1.25rem;
        }
        .lib-tp-eyebrow-line { width: 28px; height: 1px; background: #eb5e28; flex-shrink: 0; }
        .lib-tp-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,252,242,0.4);
        }
        .lib-tp-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          letter-spacing: -0.02em; line-height: 0.95;
          text-transform: uppercase; color: #fffcf2;
        }
        .lib-tp-title em { font-style: normal; color: #eb5e28; }

        .lib-tp-header-right {
          display: flex; flex-direction: column;
          justify-content: flex-end; gap: 1.25rem;
        }
        .lib-tp-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem; font-weight: 400;
          line-height: 1.7; color: rgba(255,252,242,0.65);
          max-width: 380px;
        }
        .lib-tp-cta {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28; border: none;
          padding: 0.8rem 1.75rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          align-self: flex-start;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .lib-tp-cta:hover { background: #d44c10; transform: translateY(-1px); }

        /* ── Grid ── */
        .lib-tp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid rgba(204,197,185,0.1);
          border-top: 1px solid rgba(204,197,185,0.1);
        }

        /* ── Card ── */
        .lib-tp-card {
          border-right: 1px solid rgba(204,197,185,0.1);
          border-bottom: 1px solid rgba(204,197,185,0.1);
          display: flex; flex-direction: column;
          text-decoration: none;
          position: relative; overflow: hidden;
          background: #252422;
          transition: background 0.25s ease;
        }
        .lib-tp-card:hover { background: #2e2b28; }

        /* Orange top bar on hover */
        .lib-tp-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          z-index: 3;
        }
        .lib-tp-card:hover::before { transform: scaleX(1); }

        /* Image */
        .lib-tp-card-img {
          width: 100%;
          aspect-ratio: 16/10;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .lib-tp-card-img img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform 0.6s ease;
          filter: brightness(0.85) saturate(0.9);
        }
        .lib-tp-card:hover .lib-tp-card-img img {
          transform: scale(1.05);
          filter: brightness(0.75) saturate(1);
        }

        /* Trending badge */
        .lib-tp-badge {
          position: absolute; top: 0.85rem; right: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28;
          padding: 0.22rem 0.55rem;
          display: flex; align-items: center; gap: 0.3rem;
          z-index: 2;
        }

        /* Category tag on image bottom */
        .lib-tp-cat {
          position: absolute; bottom: 0.85rem; left: 0.85rem;
          font-family: 'Manrope', sans-serif;
          font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,252,242,0.9);
          background: rgba(37,36,34,0.75);
          border: 1px solid rgba(204,197,185,0.2);
          padding: 0.22rem 0.55rem;
          z-index: 2;
        }

        /* Card body */
        .lib-tp-card-body {
          padding: 1.5rem;
          display: flex; flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid rgba(204,197,185,0.08);
          flex: 1;
        }
        .lib-tp-card-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.95rem; letter-spacing: -0.01em;
          text-transform: uppercase; color: #fffcf2;
          line-height: 1.1;
          transition: color 0.2s ease;
        }
        .lib-tp-card:hover .lib-tp-card-title { color: #eb5e28; }

        .lib-tp-card-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem; font-weight: 400;
          line-height: 1.55; color: rgba(255,252,242,0.65);
          flex: 1;
        }

        .lib-tp-card-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(204,197,185,0.08);
          margin-top: auto;
        }
        .lib-tp-card-pop {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,252,242,0.65);
        }
        .lib-tp-card-arrow {
          color: rgba(255,252,242,0.2);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .lib-tp-card:hover .lib-tp-card-arrow {
          color: #eb5e28;
          transform: translateX(4px);
        }

        /* ── Bottom note ── */
        .lib-tp-bottom {
          border-left: 1px solid rgba(204,197,185,0.1);
          border-right: 1px solid rgba(204,197,185,0.1);
          border-bottom: 1px solid rgba(204,197,185,0.1);
          padding: 1.25rem 1.5rem;
          display: flex; align-items: center;
          justify-content: center; gap: 0.75rem;
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,252,242,0.9);
        }
        .lib-tp-bottom::before {
          content: ''; display: block;
          width: 20px; height: 1px; background: #eb5e28;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .lib-tp-header { grid-template-columns: 1fr; gap: 1.5rem; }
          .lib-tp-grid   { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .lib-tp-inner { padding: 3rem 1.5rem; }
          .lib-tp-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="lib-tp-root">
        <div className="lib-tp-inner">

          {/* Header */}
          <div className="lib-tp-header">
            <div>
              <div className="lib-tp-eyebrow">
                <span className="lib-tp-eyebrow-line" />
                <span className="lib-tp-eyebrow-text">Popular Right Now</span>
              </div>
              <h2 className="lib-tp-title">
                Trending <em>Playlists</em>
              </h2>
            </div>
            <div className="lib-tp-header-right">
              <p className="lib-tp-desc">
                The most popular music collections right now — curated by
                genre for film, advertising, and content creators.
              </p>
              <Link href="/playlists" className="lib-tp-cta">
                All Playlists
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="lib-tp-grid">
            {playlists.map((playlist, i) => (
              <Link key={i} href={`/playlists/${playlist.id}`} className="lib-tp-card">
                <div className="lib-tp-card-img">
                  <Image
                    src={playlist.image}
                    alt={playlist.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="lib-tp-badge">
                    <TrendingUp size={9} />
                    Trending
                  </span>
                  <span className="lib-tp-cat">{playlist.category}</span>
                </div>

                <div className="lib-tp-card-body">
                  <div className="lib-tp-card-title">{playlist.title}</div>
                  <p className="lib-tp-card-desc">{playlist.description}</p>
                  <div className="lib-tp-card-footer">
                    <span className="lib-tp-card-pop">{playlist.popularity}</span>
                    <ArrowRight size={14} className="lib-tp-card-arrow" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom note */}
          <div className="lib-tp-bottom">
            Discover new music daily — browse the full library
          </div>

        </div>
      </section>
    </>
  );
};

export default TrendingPlaylists;