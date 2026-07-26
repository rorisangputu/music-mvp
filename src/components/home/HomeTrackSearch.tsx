"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Play,
  Pause,
  Download,
  ArrowRight,
  X,
  Share2,
  Check,
} from "lucide-react";
import { Track } from "@/types/music";
import { useRouter, useSearchParams } from "next/navigation";
import PlayerBar from "../playbar";

const PREVIEW_COUNT = 6;
const CACHE_KEY = "music_lib_tracks_v3";

export default function HomeTrackSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // 1. Try cache first
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const { tracks } = JSON.parse(raw) as { tracks: Track[]; ts: number };
          setAllTracks(tracks);
          setLoading(false);
          return;
        }
      } catch {}

      // 2. Fetch from API — single res.json() call
      try {
        const res = await fetch("/api/tracks");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = (await res.json()) as { tracks: Track[] };
        setAllTracks(data.tracks ?? []);
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ tracks: data.tracks, ts: Date.now() }),
          );
        } catch {}
      } catch (err) {
        console.error("HomeTrackSearch fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // console.log(allTracks);
  // ── Sync query → URL ──────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    const newUrl = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [query, searchParams]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter ────────────────────────────────────────────────────────────────
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
    async (track: Track) => {
      // Same track -> toggle pause/play
      if (audioRef.current && playingId === track.id) {
        if (audioRef.current.paused) {
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (err) {
            console.error(err);
          }
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }

      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio =
        preloadCache.current.get(track.id) ?? new Audio(track.audioUrl);

      audioRef.current = audio;
      setPlayingId(track.id);

      audio.onended = stopAudio;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error(err);
        stopAudio();
      }
    },
    [playingId, stopAudio],
  );

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async (track: Track) => {
    const url = `${window.location.origin}/library?search=${encodeURIComponent(track.title)}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {}
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Check out "${track.title}" by ${track.composer}`,
          url,
        });
      } catch {}
    }
    setCopiedId(track.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // ── Download ──────────────────────────────────────────────────────────────
  const incrementDownloadCount = async (
    trackId: string,
    title: string,
    url: string,
  ) => {
    try {
      const res = await fetch("/api/tracks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, title, url }),
      });
      if (!res.ok) {
        const e = await res.json();
        return { success: false, message: e.message || "Error" };
      }
      return { success: true };
    } catch {
      return { success: false, message: "Server Error" };
    }
  };

  const handleDownload = async (track: Track) => {
    if (!track.downloadable) {
      alert("This track is not available for download.");
      return;
    }
    const filename = `${track.title} - ${track.composer}.mp3`;
    const proxyUrl = `/api/tracks/download?url=${encodeURIComponent(track.audioUrl)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    const inc = await incrementDownloadCount(
      track.id,
      track.title,
      track.audioUrl,
    );
    if (inc.success) setDownloaded(track.id);
    else alert(inc.message || "Failed to record download.");
  };

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

        .hts-search-row { display:flex; gap:.75rem; align-items:stretch; margin-bottom:2rem; }
        .hts-search-wrap {
          position:relative; flex:1; border:1px solid #ccc5b9; background:#fffcf2;
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
          position:absolute; right:.75rem; background:none; border:none;
          cursor:pointer; color:#ccc5b9; display:flex; align-items:center; transition:color .15s;
        }
        .hts-clear-btn:hover { color:#eb5e28; }
        .hts-library-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.7rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#252422; border:none;
          padding:.85rem 1.75rem; cursor:pointer; white-space:nowrap;
          display:inline-flex; align-items:center; gap:.5rem;
          transition:background .2s; text-decoration:none;
        }
        .hts-library-btn:hover { background:#eb5e28; }

        .hts-list { border:1px solid #ccc5b9; border-bottom:none; }
        .hts-row {
          display:grid; grid-template-columns: 44px 1.8fr 1fr auto auto auto;
          gap:.75rem 1rem; padding:.8rem 1.25rem; border-bottom:1px solid #ccc5b9;
          align-items:center; position:relative; cursor:pointer; transition:background .15s;
        }
        .hts-row:hover { background:#f9f6ef; }
        .hts-row.playing { background:#fff5f0; }
        .hts-row::before {
          content:''; position:absolute; left:0; top:0;
          width:3px; height:100%; background:#eb5e28;
          transform:scaleY(0); transform-origin:top;
          transition:transform .25s cubic-bezier(.16,1,.3,1);
        }
        .hts-row:hover::before, .hts-row.playing::before { transform:scaleY(1); }

        .hts-thumb {
          width:44px; height:44px; flex-shrink:0;
          overflow:hidden; background:#252422; position:relative; cursor:pointer;
        }
        .hts-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .hts-thumb-ph {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
          font-family:'Manrope',sans-serif; font-size:.45rem;
          color:rgba(255,252,242,.2); letter-spacing:.1em;
        }
        .hts-thumb-overlay {
          position:absolute; inset:0; background:rgba(37,36,34,.55);
          display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity .2s;
        }
        .hts-row:hover .hts-thumb-overlay, .hts-row.playing .hts-thumb-overlay { opacity:1; }

        .hts-meta { min-width:0; }
        .hts-track-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.8rem; letter-spacing:-.01em; text-transform:uppercase;
          color:#252422; line-height:1.1;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:color .15s;
        }
        .hts-row:hover .hts-track-title, .hts-row.playing .hts-track-title { color:#eb5e28; }
        .hts-track-sub {
          font-family:'Manrope',sans-serif; font-size:.65rem;
          color:#403d39; opacity:.45; margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        .hts-tags { display:flex; gap:.3rem; overflow:hidden; min-width:0; }
        .hts-tag {
          font-family:'Manrope',sans-serif; font-size:.52rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; border:1px solid #ccc5b9;
          padding:.2rem .45rem; line-height:1; white-space:nowrap;
        }
        .hts-dur {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:500;
          color:#403d39; opacity:.35; white-space:nowrap;
        }
        .hts-share-btn {
          width:30px; height:30px; background:none; border:1px solid #ccc5b9; cursor:pointer;
          display:flex; align-items:center; justify-content:center; color:#403d39; flex-shrink:0;
          transition:border-color .2s,color .2s,background .2s;
        }
        .hts-share-btn:hover { border-color:#eb5e28; color:#eb5e28; }
        .hts-share-btn.copied { border-color:#eb5e28; background:#eb5e28; color:#fffcf2; }
        .hts-dl-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:1px solid #eb5e28;
          padding:.3rem .65rem; cursor:pointer;
          display:flex; align-items:center; gap:.3rem;
          transition:background .2s; white-space:nowrap;
        }
        .hts-dl-btn:hover { background:#d44c10; border-color:#d44c10; }
        .hts-dl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .hts-footer {
          border:1px solid #ccc5b9; border-top:none; padding:1.25rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;
        }
        .hts-footer-text { font-family:'Manrope',sans-serif; font-size:.72rem; color:#403d39; opacity:.5; }
        .hts-footer-text strong { color:#252422; opacity:1; font-weight:700; }
        .hts-goto-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none; padding:.75rem 1.5rem; cursor:pointer;
          display:inline-flex; align-items:center; gap:.5rem; transition:background .2s; text-decoration:none;
        }
        .hts-goto-btn:hover { background:#d44c10; }
        .hts-spinner-wrap { display:flex; align-items:center; justify-content:center; padding:3rem; border:1px solid #ccc5b9; }
        .hts-spinner {
          width:28px; height:28px; border:2px solid rgba(235,94,40,.15);
          border-top-color:#eb5e28; border-radius:50%; animation:hts-spin .8s linear infinite;
        }
        @keyframes hts-spin { to { transform:rotate(360deg); } }
        .hts-empty {
          border:1px solid #ccc5b9; padding:3rem 2rem;
          display:flex; flex-direction:column; align-items:center; gap:.75rem; text-align:center;
        }
        .hts-empty-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.9rem; text-transform:uppercase; color:#252422; }
        .hts-empty-desc { font-family:'Manrope',sans-serif; font-size:.75rem; color:#403d39; opacity:.5; max-width:260px; line-height:1.6; }
        .hts-toast {
          position:fixed; bottom:5rem; left:50%; transform:translateX(-50%);
          background:#252422; color:#fffcf2; z-index:9999;
          font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:600;
          letter-spacing:.06em; padding:.6rem 1.25rem; border-left:3px solid #eb5e28;
          animation:hts-toast-in .2s ease;
        }
        @keyframes hts-toast-in { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @media(max-width:768px) {
          .hts-inner { padding:0 1.25rem; }
          .hts-row { grid-template-columns: 40px 1fr auto auto; gap:.5rem .75rem; }
          .hts-tags, .hts-dur { display:none; }
        }
        @media(max-width:480px) {
          .hts-search-row { flex-direction:column; }
          .hts-library-btn { justify-content:center; }
        }
      `}</style>

      {copiedId && <div className="hts-toast">Link copied to clipboard</div>}

      <section className="hts-root">
        <div className="hts-inner">
          <div className="hts-head">
            <div className="hts-eyebrow">
              <span className="hts-eyebrow-line" />
              <span className="hts-eyebrow-text">Browse Tracks</span>
            </div>
            <h2 className="hts-title">
              Find Your <em>Sound</em>
            </h2>
          </div>

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

                      <div className="hts-tags">
                        {moods.slice(0, 2).map((tag) => (
                          <span key={tag} className="hts-tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <span className="hts-dur">{track.duration}</span>

                      <button
                        className={`hts-share-btn${copiedId === track.id ? " copied" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(track);
                        }}
                        aria-label="Share track"
                        title="Share track"
                      >
                        {copiedId === track.id ? (
                          <Check size={13} />
                        ) : (
                          <Share2 size={13} />
                        )}
                      </button>

                      {track.downloadable && (
                        <button
                          className="hts-dl-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(track);
                          }}
                          disabled={downloaded === track.id}
                        >
                          <Download size={11} />{" "}
                          {downloaded === track.id ? "✓" : "DOWNLOAD"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

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
      <PlayerBar
        track={allTracks.find((t) => t.id === playingId) ?? null}
        album={
          playingId
            ? {
                id: allTracks.find((t) => t.id === playingId)?.albumId ?? "",
                title:
                  allTracks.find((t) => t.id === playingId)?.composer ?? "",
                coverImage:
                  allTracks.find((t) => t.id === playingId)?.coverImage ??
                  undefined,
              }
            : null
        }
        isPlaying={isPlaying}
        onPlayPause={() => {
          if (!audioRef.current) return;
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }}
        onNext={() => {
          const idx = allTracks.findIndex((t) => t.id === playingId);
          if (allTracks[idx + 1]) togglePlay(allTracks[idx + 1]);
        }}
        onPrev={() => {
          const idx = allTracks.findIndex((t) => t.id === playingId);
          if (allTracks[idx - 1]) togglePlay(allTracks[idx - 1]);
        }}
        onClose={stopAudio}
        onFavourite={async (track) => {
          const res = await fetch("/api/user/favourites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId: track.id }),
          });
          alert(res.ok ? "Added to favourites!" : "Failed.");
        }}
        audioRef={audioRef}
      />
    </>
  );
}
