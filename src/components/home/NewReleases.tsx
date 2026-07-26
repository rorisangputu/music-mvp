"use client";

import React, { useEffect, useState, cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Music } from "lucide-react";

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  genre: string;
  composer: string;
  coverImage: string;
  releaseDate: string;
  mood: string;
  cueSheet: string;
};

const LibNewReleases = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const CACHE_KEY = "music_lib_albums_v3";
  useEffect(() => {
    const fetchLatestAlbums = async () => {
      try {
        const res = await fetch("/api/albums");
        if (!res.ok) throw new Error(`Failed to fetch ${res.status}`);

        const data = (await res.json()) as { albums: Album[] };
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ albums: data.albums, ts: Date.now() }),
          );
        } catch {}

        setAlbums(data.albums);
        //console.log(albums);
      } catch (error) {
        try {
        } catch (e) {
          console.error("Error fetching albums:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLatestAlbums();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .lib-nr-root {
          width: 100%;
          background: #fffcf2;
          border-top: 1px solid #ccc5b9;
          position: relative;
        }

        .lib-nr-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 5rem 3rem;
        }

        /* ── Header ── */
        .lib-nr-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: flex-end;
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid #ccc5b9;
        }
        .lib-nr-eyebrow {
          display: flex; align-items: center;
          gap: 0.75rem; margin-bottom: 1.25rem;
        }
        .lib-nr-eyebrow-line { width: 28px; height: 1px; background: #eb5e28; flex-shrink: 0; }
        .lib-nr-eyebrow-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #403d39; opacity: 0.55;
        }
        .lib-nr-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          letter-spacing: -0.02em; line-height: 0.95;
          text-transform: uppercase; color: #252422;
        }
        .lib-nr-title em { font-style: normal; color: #eb5e28; }

        .lib-nr-header-right {
          display: flex; flex-direction: column;
          justify-content: flex-end; gap: 1.25rem;
        }
        .lib-nr-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem; font-weight: 400;
          line-height: 1.7; color: #403d39; opacity: 0.65;
          max-width: 380px;
        }
        .lib-nr-cta {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28; border: none;
          padding: 0.8rem 1.75rem; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          align-self: flex-start;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .lib-nr-cta:hover { background: #d44c10; transform: translateY(-1px); }

        /* ── Grid: no gaps, tight borders ── */
        .lib-nr-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-left: 1px solid #ccc5b9;
          border-top: 1px solid #ccc5b9;
        }

        .lib-nr-card {
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
          text-decoration: none;
          background: #fffcf2;
          transition: background 0.2s ease;
        }
        .lib-nr-card:hover { background: #f5f0e8; }

        /* Orange top bar on hover */
        .lib-nr-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 3px;
          background: #eb5e28;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          z-index: 3;
        }
        .lib-nr-card:hover::before { transform: scaleX(1); }

        /* Cover image */
        .lib-nr-cover {
          width: 100%;
          aspect-ratio: 1;
          position: relative;
          overflow: hidden;
          background: #e8e3da;
          flex-shrink: 0;
        }
        .lib-nr-cover img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform 0.5s ease;
        }
        .lib-nr-card:hover .lib-nr-cover img { transform: scale(1.05); }

        /* Genre badge on image */
        .lib-nr-genre-badge {
          position: absolute; top: 0.75rem; left: 0.75rem;
          font-family: 'Manrope', sans-serif;
          font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #fffcf2; background: #eb5e28;
          padding: 0.2rem 0.5rem;
          z-index: 2;
        }

        /* Cover placeholder */
        .lib-nr-cover-placeholder {
          width: 100%; aspect-ratio: 1;
          background: #e8e3da;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lib-nr-cover-placeholder svg { color: #ccc5b9; }

        /* Card body */
        .lib-nr-card-body {
          padding: 0.9rem;
          display: flex; flex-direction: column;
          gap: 0.2rem;
          border-top: 1px solid #ccc5b9;
        }
        .lib-nr-card-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.8rem; letter-spacing: -0.01em;
          text-transform: uppercase; color: #252422;
          line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .lib-nr-card:hover .lib-nr-card-title { color: #eb5e28; }
        .lib-nr-card-artist {
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem; font-weight: 500;
          color: #403d39; opacity: 0.55;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .lib-nr-card-category {
          font-family: 'Manrope', sans-serif;
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #403d39; opacity: 0.35;
          margin-top: 0.1rem;
        }

        /* ── Skeleton ── */
        .lib-nr-skeleton {
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
        }
        .lib-nr-skeleton-img {
          width: 100%; aspect-ratio: 1;
          background: linear-gradient(90deg, #e8e3da 25%, #f0ece4 50%, #e8e3da 75%);
          background-size: 200% 100%;
          animation: lib-shimmer 1.4s ease-in-out infinite;
        }
        .lib-nr-skeleton-body {
          padding: 0.9rem;
          display: flex; flex-direction: column; gap: 0.4rem;
          border-top: 1px solid #ccc5b9;
        }
        .lib-nr-skeleton-line {
          height: 10px; background: #e8e3da;
          animation: lib-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes lib-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty state ── */
        .lib-nr-empty {
          grid-column: span 5;
          border-right: 1px solid #ccc5b9;
          border-bottom: 1px solid #ccc5b9;
          padding: 5rem 2rem;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1rem; text-align: center;
        }
        .lib-nr-empty-icon {
          width: 56px; height: 56px;
          border: 1px solid #ccc5b9;
          display: flex; align-items: center; justify-content: center;
          color: #ccc5b9;
        }
        .lib-nr-empty-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 1rem; text-transform: uppercase;
          color: #252422;
        }
        .lib-nr-empty-desc {
          font-family: 'Manrope', sans-serif;
          font-size: 0.82rem; color: #403d39; opacity: 0.55;
          max-width: 320px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .lib-nr-header { grid-template-columns: 1fr; gap: 1.5rem; }
          .lib-nr-grid   { grid-template-columns: repeat(4, 1fr); }
          .lib-nr-empty  { grid-column: span 4; }
        }
        @media (max-width: 640px) {
          .lib-nr-inner  { padding: 3rem 1.5rem; }
          .lib-nr-grid   { grid-template-columns: repeat(2, 1fr); }
          .lib-nr-empty  { grid-column: span 2; }
        }
      `}</style>

      <section className="lib-nr-root">
        <div className="lib-nr-inner">
          {/* Header */}
          <div className="lib-nr-header">
            <div>
              <div className="lib-nr-eyebrow">
                <span className="lib-nr-eyebrow-line" />
                <span className="lib-nr-eyebrow-text">Latest Additions</span>
              </div>
              <h2 className="lib-nr-title">
                New <em>Releases</em>
              </h2>
            </div>
            <div className="lib-nr-header-right">
              <p className="lib-nr-desc">
                Fresh tracks added to the library — sync-cleared and ready for
                your next production.
              </p>
              <Link href="/library" className="lib-nr-cta">
                Browse Full Library
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="lib-nr-grid">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="lib-nr-skeleton">
                  <div
                    className="lib-nr-skeleton-img"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                  <div className="lib-nr-skeleton-body">
                    <div
                      className="lib-nr-skeleton-line"
                      style={{ width: "75%" }}
                    />
                    <div
                      className="lib-nr-skeleton-line"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              ))
            ) : albums ? (
              albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/library/${album.id}`}
                  className="lib-nr-card"
                >
                  <div className="lib-nr-cover">
                    {album.coverImage ? (
                      <Image
                        src={album.coverImage}
                        alt={album.title}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="lib-nr-cover-placeholder">
                        <Music size={28} />
                      </div>
                    )}
                    {album.genre && (
                      <span className="lib-nr-genre-badge">{album.genre}</span>
                    )}
                  </div>
                  <div className="lib-nr-card-body">
                    <div className="lib-nr-card-title">{album.title}</div>
                    <div className="lib-nr-card-artist">
                      {album.composer || "Unknown Artist"}
                    </div>
                    {album.category && (
                      <div className="lib-nr-card-category">
                        {album.category}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="lib-nr-empty">
                <div className="lib-nr-empty-icon">
                  <Music size={22} />
                </div>
                <div className="lib-nr-empty-title">No Albums Yet</div>
                <p className="lib-nr-empty-desc">
                  New tracks are being added to the library. Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default LibNewReleases;
