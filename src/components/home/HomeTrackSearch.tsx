"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Play, Pause, Download, ArrowRight, X } from "lucide-react";
import { Track } from "@/types/music";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PREVIEW_COUNT = 6;
const CACHE_KEY = "music_lib_tracks_v2";

interface HomeTrackSearchProps {
  isUser: boolean | null;
  isAdmin: boolean | null;
}

export default function HomeTrackSearch() {
  const router = useRouter();
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // ── Load from sessionStorage cache (shared with useTracks) ───────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { tracks } = JSON.parse(raw) as { tracks: Track[]; ts: number };
        setAllTracks(tracks);
        setLoading(false);
        return;
      }
    } catch {}

    // Cache miss — fetch directly
    import("@/lib/firebase").then(({ db }) => {
      import("firebase/firestore").then(
        async ({ collection, getDocs, orderBy, query: fsQuery }) => {
          try {
            const [tracksSnap, albumsSnap] = await Promise.all([
              getDocs(
                fsQuery(collection(db, "tracks"), orderBy("title", "asc")),
              ),
              getDocs(collection(db, "albums")),
            ]);
            const albumCovers = new Map<string, string>();
            albumsSnap.docs.forEach((d) => {
              const cover = d.data().coverImage;
              if (cover) albumCovers.set(d.id, cover);
            });
            const data = tracksSnap.docs.map((d) => {
              const dd = d.data();
              return {
                id: d.id,
                ...dd,
                coverImage: albumCovers.get(dd.albumId) ?? undefined,
              } as Track;
            });
            // Write to cache so useTracks benefits too
            try {
              sessionStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ tracks: data, ts: Date.now() }),
              );
            } catch {}
            setAllTracks(data);
          } catch (e) {
            console.error("HomeTrackSearch fetch error:", e);
          } finally {
            setLoading(false);
          }
        },
      );
    });
  }, []);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? allTracks.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.title?.toLowerCase().includes(q) ||
          t.composer?.toLowerCase().includes(q) ||
          t.genre?.toLowerCase().includes(q) ||
          (Array.isArray(t.mood) ? t.mood : []).some((m) =>
            m.toLowerCase().includes(q),
          )
        );
      })
    : allTracks.slice(0, PREVIEW_COUNT);

  const displayed = filtered.slice(0, PREVIEW_COUNT);
  const hasMore = filtered.length > PREVIEW_COUNT;

  // ── Audio ─────────────────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setPlayingId(null);
  }, []);

  const handleHover = useCallback((track: Track) => {
    if (preloadCache.current.has(track.id)) return;
    const a = new Audio();
    a.preload = "auto";
    a.src = track.audioUrl;
    preloadCache.current.set(track.id, a);
  }, []);

  const togglePlay = useCallback(
    (track: Track) => {
      if (playingId === track.id) {
        stopAudio();
        return;
      }
      audioRef.current?.pause();
      const audio =
        preloadCache.current.get(track.id) ?? new Audio(track.audioUrl);
      audioRef.current = audio;
      setPlayingId(track.id);
      setIsPlaying(true);
      audio.play().catch(() => stopAudio());
      audio.onended = () => stopAudio();
    },
    [playingId, stopAudio],
  );

  // Go to library with search pre-filled
  const goToLibrary = () => {
    const params = query.trim()
      ? `?search=${encodeURIComponent(query.trim())}`
      : "";
    router.push(`/library${params}`);
  };

  useEffect(() => () => stopAudio(), [stopAudio]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .hts-root { width:100%; background:#fffcf2; padding:4rem 0 0; }
        .hts-inner { max-width:1440px; margin:0 auto; padding:0 3rem; }

        /* ── Header ── */
        .hts-head { margin-bottom:2rem; }
        .hts-eyebrow { display:flex; align-items:center; gap:.75rem; margin-bottom:.75rem; }
        .hts-eyebrow-line { width:28px; height:1px; background:#eb5e28; }
        .hts-eyebrow-text {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase; color:#403d39; opacity:.5;
        }
        .hts-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:clamp(1.75rem,3vw,3rem); letter-spacing:-.02em; line-height:.95;
          text-transform:uppercase; color:#252422;
        }
        .hts-title em { font-style:normal; color:#eb5e28; }

        /* ── Search ── */
        .hts-search-row {
          display:flex; gap:.75rem; align-items:stretch;
          margin-bottom:2rem;
        }
        .hts-search-wrap {
          position:relative; flex:1;
          border:1px solid #ccc5b9; background:#fffcf2;
          display:flex; align-items:center;
        }
        .hts-search-wrap:focus-within { border-color:#eb5e28; }
        .hts-search-wrap svg { position:absolute; left:.9rem; color:#ccc5b9; }
        .hts-search-wrap:focus-within svg { color:#eb5e28; }
        .hts-search-input {
          font-family:'Manrope',sans-serif; font-size:.85rem; font-weight:500;
          color:#252422; background:transparent; border:none; outline:none;
          width:100%; padding:.85rem .9rem .85rem 2.6rem;
        }
        .hts-search-input::placeholder { color:#ccc5b9; }
        .hts-clear-btn {
          position:absolute; right:.75rem;
          background:none; border:none; cursor:pointer;
          color:#ccc5b9; display:flex; align-items:center;
          transition:color .15s;
        }
        .hts-clear-btn:hover { color:#eb5e28; }
        .hts-library-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.7rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#252422; border:none;
          padding:.85rem 1.75rem; cursor:pointer; white-space:nowrap;
          display:inline-flex; align-items:center; gap:.5rem;
          transition:background .2s;
          text-decoration:none;
        }
        .hts-library-btn:hover { background:#eb5e28; }

        /* ── Track list ── */
        .hts-list { border:1px solid #ccc5b9; border-bottom:none; }

        .hts-row {
          display:grid;
          grid-template-columns: 44px 400px 1fr auto auto;
          gap:.75rem 1rem;
          padding:.8rem 1.25rem;
          border-bottom:1px solid #ccc5b9;
          align-items:center;
          position:relative; cursor:pointer;
          transition:background .15s;
        }
        .hts-row:hover { background:#f9f6ef; }
        .hts-row.playing { background:#fff5f0; }
        .hts-row::before {
          content:''; position:absolute; left:0; top:0;
          width:3px; height:100%; background:#eb5e28;
          transform:scaleY(0); transform-origin:top;
          transition:transform .25s cubic-bezier(.16,1,.3,1);
        }
        .hts-row:hover::before,
        .hts-row.playing::before { transform:scaleY(1); }

        /* Cover thumb */
        .hts-thumb {
          width:44px; height:44px; flex-shrink:0;
          overflow:hidden; background:#252422;
          position:relative; cursor:pointer;
        }
        .hts-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .hts-thumb-ph {
          width:100%; height:100%; display:flex;
          align-items:center; justify-content:center;
          font-family:'Manrope',sans-serif; font-size:.45rem;
          color:rgba(255,252,242,.2); letter-spacing:.1em;
        }
        .hts-thumb-overlay {
          position:absolute; inset:0; background:rgba(37,36,34,.55);
          display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity .2s;
        }
        .hts-row:hover .hts-thumb-overlay,
        .hts-row.playing .hts-thumb-overlay { opacity:1; }

        /* Meta */
        .hts-meta { min-width:0; }
        .hts-track-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.8rem; letter-spacing:-.01em; text-transform:uppercase;
          color:#252422; line-height:1.1;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          transition:color .15s;
        }
        .hts-row:hover .hts-track-title,
        .hts-row.playing .hts-track-title { color:#eb5e28; }
        .hts-track-sub {
          font-family:'Manrope',sans-serif; font-size:.65rem;
          color:#403d39; opacity:.45; margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Tags */
        .hts-tags { display:flex; gap:.3rem; overflow:hidden; }
        .hts-tag {
          font-family:'Manrope',sans-serif; font-size:.52rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; border:1px solid #ccc5b9;
          padding:.2rem .45rem; line-height:1; white-space:nowrap;
        }

        /* Duration */
        .hts-dur {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:500;
          color:#403d39; opacity:.35; white-space:nowrap;
        }

        /* Actions */
        .hts-dl-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:1px solid #eb5e28;
          padding:.3rem .65rem; cursor:pointer;
          display:flex; align-items:center; gap:.3rem;
          transition:background .2s; white-space:nowrap;
        }
        .hts-dl-btn:hover { background:#d44c10; border-color:#d44c10; }
        .hts-signup-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.06em; text-transform:uppercase;
          color:#eb5e28; background:none; border:1px solid #eb5e28;
          padding:.3rem .65rem; cursor:pointer;
          display:flex; align-items:center; gap:.3rem;
          transition:background .2s,color .2s; white-space:nowrap;
          text-decoration:none;
        }
        .hts-signup-btn:hover { background:#eb5e28; color:#fffcf2; }

        /* ── Footer row ── */
        .hts-footer {
          border:1px solid #ccc5b9; border-top:none;
          padding:1.25rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between;
          gap:1rem; flex-wrap:wrap;
        }
        .hts-footer-text {
          font-family:'Manrope',sans-serif; font-size:.72rem;
          color:#403d39; opacity:.5;
        }
        .hts-footer-text strong { color:#252422; opacity:1; font-weight:700; }
        .hts-goto-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.75rem 1.5rem; cursor:pointer;
          display:inline-flex; align-items:center; gap:.5rem;
          transition:background .2s; text-decoration:none;
        }
        .hts-goto-btn:hover { background:#d44c10; }

        /* ── Loading / empty ── */
        .hts-spinner-wrap {
          display:flex; align-items:center; justify-content:center;
          padding:3rem; border:1px solid #ccc5b9;
        }
        .hts-spinner {
          width:28px; height:28px;
          border:2px solid rgba(235,94,40,.15);
          border-top-color:#eb5e28; border-radius:50%;
          animation:hts-spin .8s linear infinite;
        }
        @keyframes hts-spin { to { transform:rotate(360deg); } }

        .hts-empty {
          border:1px solid #ccc5b9; padding:3rem 2rem;
          display:flex; flex-direction:column; align-items:center; gap:.75rem; text-align:center;
        }
        .hts-empty-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.9rem; text-transform:uppercase; color:#252422;
        }
        .hts-empty-desc {
          font-family:'Manrope',sans-serif; font-size:.75rem;
          color:#403d39; opacity:.5; max-width:260px; line-height:1.6;
        }

        /* ── Responsive ── */
        @media(max-width:768px) {
          .hts-inner { padding:0 1.25rem; }
          .hts-row { grid-template-columns: 40px 1fr auto; gap:.5rem .75rem; }
          .hts-thumb { grid-column:1; grid-row:1/3; width:40px; height:40px; }
          .hts-meta { grid-column:2; }
          .hts-tags { grid-column:2; }
          .hts-dur { display:none; }
          .hts-dl-btn, .hts-signup-btn { grid-column:3; grid-row:1/3; }
        }
        @media(max-width:480px) {
          .hts-search-row { flex-direction:column; }
          .hts-library-btn { justify-content:center; }
        }
      `}</style>

      <section className="hts-root">
        <div className="hts-inner">
          {/* Header */}
          <div className="hts-head">
            <div className="hts-eyebrow">
              <span className="hts-eyebrow-line" />
              <span className="hts-eyebrow-text">Browse Tracks</span>
            </div>
            <h2 className="hts-title">
              Find Your <em>Sound</em>
            </h2>
          </div>

          {/* Search + library button */}
          <div className="hts-search-row">
            <div className="hts-search-wrap">
              <Search size={14} />
              <input
                type="text"
                className="hts-search-input"
                placeholder="Search by title, composer, mood, genre…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="hts-clear-btn"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button className="hts-library-btn" onClick={goToLibrary}>
              Full Library <ArrowRight size={13} />
            </button>
          </div>

          {/* Track list */}
          {loading ? (
            <div className="hts-spinner-wrap">
              <div className="hts-spinner" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="hts-empty">
              <div className="hts-empty-title">No tracks found</div>
              <p className="hts-empty-desc">
                Try a different search or browse the full library.
              </p>
              <button className="hts-goto-btn" onClick={goToLibrary}>
                Go to Library <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <>
              <div className="hts-list">
                {displayed.map((track) => {
                  const isActive = playingId === track.id;
                  const moods: string[] = Array.isArray(track.mood)
                    ? track.mood
                    : track.mood
                      ? [track.mood]
                      : [];

                  return (
                    <div
                      key={track.id}
                      className={`hts-row${isActive ? " playing" : ""}`}
                      onMouseEnter={() => handleHover(track)}
                    >
                      {/* Cover / play */}
                      <div
                        className="hts-thumb"
                        onClick={() => togglePlay(track)}
                      >
                        {track.coverImage ? (
                          <img src={track.coverImage} alt={track.title} />
                        ) : (
                          <div className="hts-thumb-ph">NO ART</div>
                        )}
                        <div className="hts-thumb-overlay">
                          {isActive ? (
                            <Pause size={14} fill="#fffcf2" color="#fffcf2" />
                          ) : (
                            <Play
                              size={14}
                              fill="#fffcf2"
                              color="#fffcf2"
                              style={{ marginLeft: 2 }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Meta */}
                      <div
                        className="hts-meta"
                        onClick={() => togglePlay(track)}
                      >
                        <div className="hts-track-title">{track.title}</div>
                        <div className="hts-track-sub">
                          {track.composer}
                          {track.genre ? ` · ${track.genre}` : ""}
                        </div>
                      </div>

                      {/* Mood tags */}
                      <div className="hts-tags">
                        {moods.slice(0, 2).map((tag) => (
                          <span key={tag} className="hts-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Duration */}
                      <span className="hts-dur">{track.duration}</span>

                      {/* Action */}
                      {track.downloadable && (
                        <button
                          className="hts-dl-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Download size={11} /> DL
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="hts-footer">
                <p className="hts-footer-text">
                  Showing <strong>{displayed.length}</strong> of{" "}
                  <strong>{query ? filtered.length : allTracks.length}</strong>{" "}
                  tracks
                  {hasMore && query && ` matching "${query}"`}
                </p>
                <button className="hts-goto-btn" onClick={goToLibrary}>
                  {query
                    ? `See all ${filtered.length} results`
                    : "Go to Library"}
                  <ArrowRight size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
