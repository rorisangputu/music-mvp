"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTracks } from "@/lib/useTracks";
import { CATEGORIES, GENRES, Track } from "@/types/music";
import {
  X,
  Play,
  Pause,
  Download,
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Music,
} from "lucide-react";
import PlayerBar from "./PlayBar";
import { Share2, Check } from "lucide-react";

interface TracksPageProps {
  isAdmin: boolean | null;
  isUser: boolean | null;
}

const TracksPage = ({ isAdmin, isUser }: TracksPageProps) => {
  const {
    tracks,
    loading,
    error,
    search,
    categoryFilter,
    genreFilter,
    moodFilter,
    currentPage,
    totalPages,
    totalItems,
    availableMoods,
    handleSearchChange,
    handleCategoryChange,
    handleGenreChange,
    handleMoodChange,
    handlePageChange,
    clearFilters,
  } = useTracks();

  const [searchInput, setSearchInput] = useState(search);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload cache: store Audio objects keyed by track id so hover-preloads persist
  const preloadCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDateStr = (s: string) => {
    try {
      return new Date(s).toISOString().split("T")[0];
    } catch {
      return s;
    }
  };

  // ── Audio ─────────────────────────────────────────────────────────────────

  const stopAudio = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setPlayingTrackId(null);
  }, []);

  /** Hover over a track row → silently buffer the audio */
  const handleTrackHover = useCallback((track: Track) => {
    if (preloadCache.current.has(track.id)) return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = track.audioUrl;
    preloadCache.current.set(track.id, audio);
  }, []);

  const togglePlay = useCallback(
    (track: Track) => {
      // Pause current
      if (playingTrackId === track.id) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setPlayingTrackId(null);
        return;
      }

      if (audioRef.current) audioRef.current.pause();

      // Reuse preloaded audio if available, otherwise create fresh
      const audio =
        preloadCache.current.get(track.id) ?? new Audio(track.audioUrl);
      audioRef.current = audio;
      setPlayingTrackId(track.id);
      setIsPlaying(true);

      audio
        .play()
        .then(() =>
          fetch("/api/tracks/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trackId: track.id,
              title: track.title,
              url: track.audioUrl,
            }),
          }),
        )
        .catch(() => stopAudio());

      audio.onended = () => stopAudio();
    },
    [playingTrackId, stopAudio],
  );

  const handlePlayerPlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    const idx = tracks.findIndex((t) => t.id === playingTrackId);
    if (tracks[idx + 1]) togglePlay(tracks[idx + 1]);
  }, [tracks, playingTrackId, togglePlay]);

  const handlePrev = useCallback(() => {
    const idx = tracks.findIndex((t) => t.id === playingTrackId);
    if (tracks[idx - 1]) togglePlay(tracks[idx - 1]);
  }, [tracks, playingTrackId, togglePlay]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleFavourite = async (track: Track) => {
    const res = await fetch("/api/user/favourites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id }),
    });
    alert(res.ok ? "Added to favourites!" : "Failed to add to favourites.");
  };

  const handleDownload = async (track: Track) => {
    if (!track.downloadable)
      return alert("This track is not available for download.");
    const filename = `${track.title} - ${track.composer}.mp3`;
    const proxyUrl = `/api/tracks/download?url=${encodeURIComponent(track.audioUrl)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    await fetch("/api/tracks/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackId: track.id,
        title: track.title,
        url: track.audioUrl,
      }),
    });
  };

  const handleCueSheet = (track: Track) => {
    if (!track.cueSheetUrl) return;
    const a = document.createElement("a");
    a.href = track.cueSheetUrl;
    a.download = `${track.title} - cue sheet.cue`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleShare = useCallback(async (track: Track) => {
    const url = `${window.location.origin}/library?search=${encodeURIComponent(track.title)}`;
    try {
      await navigator.clipboard.writeText(url);
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
    alert("Link copied to clipboard!");
    setCopiedTrackId(track.id);
    setTimeout(() => setCopiedTrackId(null), 2000);
  }, []);

  // Sync search input with URL on back/forward nav
  useEffect(() => {
    setSearchInput(search);
  }, [search]);
  useEffect(() => () => stopAudio(), [stopAudio]);

  const hasFilters = !!(search || categoryFilter || genreFilter || moodFilter);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        /* ══ Root ══ */
        .tp-root { width:100%; background:#fffcf2; min-height:100vh; border-top:1px solid #ccc5b9; }
        .tp-inner { max-width:1440px; margin:0 auto; padding:3rem; }

        /* ══ Page header ══ */
        .tp-head {
          display:grid; grid-template-columns:1fr 1fr;
          align-items:flex-end; gap:3rem;
          margin-bottom:2.5rem; padding-bottom:2rem;
          border-bottom:1px solid #ccc5b9;
        }
        .tp-eyebrow { display:flex; align-items:center; gap:.75rem; margin-bottom:1rem; }
        .tp-eyebrow-line { width:28px; height:1px; background:#eb5e28; flex-shrink:0; }
        .tp-eyebrow-text {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase; color:#403d39; opacity:.5;
        }
        .tp-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:clamp(2rem,4vw,4rem); letter-spacing:-.02em; line-height:.95;
          text-transform:uppercase; color:#252422;
        }
        .tp-title em { font-style:normal; color:#eb5e28; }
        .tp-head-right { display:flex; flex-direction:column; justify-content:flex-end; gap:.75rem; }
        .tp-head-desc {
          font-family:'Manrope',sans-serif; font-size:.85rem;
          line-height:1.7; color:#403d39; opacity:.6; max-width:380px;
        }
        .tp-count {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase; color:#403d39; opacity:.4;
        }

        /* ══ Sign up banner ══ */
        .tp-signup-banner {
          display:flex; align-items:center; justify-content:space-between;
          gap:1.5rem; padding:1rem 1.5rem;
          background:#252422; margin-bottom:2rem;
          border-left:3px solid #eb5e28;
        }
        .tp-signup-banner-text {
          font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:500;
          color:rgba(255,252,242,.6); line-height:1.5;
        }
        .tp-signup-banner-text strong {
          color:#fffcf2; font-weight:700;
        }
        .tp-signup-banner-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.12em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.7rem 1.5rem; cursor:pointer; white-space:nowrap;
          transition:background .2s;
          text-decoration:none; display:inline-flex; align-items:center; gap:.4rem;
        }
        .tp-signup-banner-btn:hover { background:#d44c10; }

        /* ══ Filters ══ */
        .tp-filters {
          display:flex; flex-wrap:wrap; gap:.75rem;
          align-items:stretch;
          margin-bottom:2rem; padding-bottom:2rem;
          border-bottom:1px solid #ccc5b9;
        }
        .tp-search-wrap {
          position:relative; flex:1; min-width:220px;
          border:1px solid #ccc5b9; background:#fffcf2;
          display:flex; align-items:center;
        }
        .tp-search-wrap:focus-within { border-color:#eb5e28; }
        .tp-search-wrap svg { position:absolute; left:.9rem; color:#ccc5b9; flex-shrink:0; }
        .tp-search-wrap:focus-within svg { color:#eb5e28; }
        .tp-search-input {
          font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:500;
          color:#252422; background:transparent; border:none; outline:none;
          width:100%; padding:.75rem .9rem .75rem 2.5rem;
        }
        .tp-search-input::placeholder { color:#ccc5b9; }

        .tp-select-wrap {
          position:relative; border:1px solid #ccc5b9;
          background:#fffcf2; min-width:150px;
        }
        .tp-select-wrap:focus-within { border-color:#eb5e28; }
        .tp-select {
          font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:500;
          color:#252422; background:transparent; border:none; outline:none;
          width:100%; padding:.75rem 2rem .75rem .9rem;
          -webkit-appearance:none; cursor:pointer;
        }
        .tp-select-arrow {
          position:absolute; right:.75rem; top:50%;
          transform:translateY(-50%); pointer-events:none; color:#ccc5b9;
        }

        .tp-clear-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; background:none; border:1px solid #ccc5b9;
          padding:.75rem 1.25rem; cursor:pointer; white-space:nowrap;
          transition:border-color .2s,color .2s;
        }
        .tp-clear-btn:hover { border-color:#eb5e28; color:#eb5e28; }

        /* ══ List toolbar (results info + view toggle) ══ */
        .tp-toolbar {
          display:flex; align-items:center; justify-content:space-between;
          gap:1rem; margin-bottom:1.25rem;
        }
        .tp-results-info {
          font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#eb5e28; display:flex; align-items:center; gap:.6rem;
        }
        .tp-results-info::before { content:''; display:block; width:16px; height:1px; background:#eb5e28; }
        .tp-results-info.muted {
          color:#403d39; opacity:.4;
        }
        .tp-results-info.muted::before { background:#403d39; opacity:.6; }

        .tp-view-toggle {
          display:flex; border:1px solid #ccc5b9; flex-shrink:0; margin-left:auto;
        }
        .tp-view-btn {
          width:34px; height:34px; background:none; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:#403d39; opacity:.45; transition:background .2s,color .2s,opacity .2s;
        }
        .tp-view-btn:first-child { border-right:1px solid #ccc5b9; }
        .tp-view-btn:hover { opacity:1; color:#eb5e28; }
        .tp-view-btn.active { background:#eb5e28; color:#fffcf2; opacity:1; }

        /* ══ Track list (row view) ══ */
        .tp-list {
          border:1px solid #ccc5b9;
          border-bottom:none;
        }

        /* List header row */
        .tp-list-head {
          display:grid;
          grid-template-columns: 48px 40px 1fr 300px 100px 200px;
          gap:1rem;
          padding:.6rem 1.25rem;
          border-bottom:1px solid #ccc5b9;
          background:#f5f0e8;
        }
        .tp-list-head-cell {
          font-family:'Manrope',sans-serif; font-size:.55rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase; color:#403d39; opacity:.45;
        }

        /* Track row */
        .tp-row {
          display:grid;
          grid-template-columns: 48px 40px 1fr 300px 100px 200px;
          gap:1rem;
          padding:.85rem 1.25rem;
          border-bottom:1px solid #ccc5b9;
          align-items:center;
          cursor:pointer;
          position:relative;
          transition:background .18s;
        }
        .tp-row:hover { background:#f9f6ef; }
        .tp-row.playing { background:#fff5f0; }

        .tp-row::before {
          content:''; position:absolute; left:0; top:0;
          width:3px; height:100%; background:#eb5e28;
          transform:scaleY(0); transform-origin:top;
          transition:transform .25s cubic-bezier(.16,1,.3,1);
        }
        .tp-row:hover::before,
        .tp-row.playing::before { transform:scaleY(1); }

        .tp-row-num {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; color:#ccc5b9; text-align:center;
        }
        .tp-row.playing .tp-row-num { color:#eb5e28; }

        .tp-play-btn {
          width:32px; height:32px;
          border:1px solid #ccc5b9; background:none;
          color:#ccc5b9; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
          flex-shrink:0;
        }
        .tp-play-btn:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }
        .tp-row.playing .tp-play-btn { border-color:#eb5e28; color:#eb5e28; }

        /* Track meta */
        .tp-row-meta { min-width:0; }
        .tp-row-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.82rem; letter-spacing:-.01em; text-transform:uppercase;
          color:#252422; line-height:1.1;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          transition:color .18s;
        }
        .tp-row:hover .tp-row-title,
        .tp-row.playing .tp-row-title { color:#eb5e28; }
        .tp-row-composer {
          font-family:'Manrope',sans-serif; font-size:.65rem;
          color:#403d39; opacity:.45; margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Mood tags */
        .tp-tags {
          display:flex; flex-wrap:nowrap; gap:.3rem;
          overflow:hidden; min-width:0;
        }
        .tp-tag {
          font-family:'Manrope',sans-serif; font-size:.55rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; border:1px solid #ccc5b9;
          padding:.2rem .5rem; line-height:1;
          white-space:nowrap; flex-shrink:1; min-width:0;
          overflow:hidden; text-overflow:ellipsis;
          cursor:pointer; transition:border-color .15s,color .15s,background .15s;
        }
        .tp-tag:hover { border-color:#eb5e28; color:#eb5e28; }
        .tp-tag.active { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }
        /* Duration */
        .tp-row-dur {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:500;
          color:#403d39; opacity:.4;
        }

        /* Row actions */
        .tp-row-actions {
          display:flex; align-items:center; justify-content:flex-end; gap:.4rem;
        }
        .tp-info-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; background:none;
          border:1px solid #ccc5b9;
          padding:.35rem .7rem; cursor:pointer;
          transition:border-color .2s,color .2s;
          white-space:nowrap;
        }
        .tp-info-btn:hover { border-color:#eb5e28; color:#eb5e28; }

        .tp-dl-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28;
          border:1px solid #eb5e28;
          padding:.35rem .7rem; cursor:pointer;
          display:flex; align-items:center; gap:.35rem;
          transition:background .2s,border-color .2s;
          white-space:nowrap;
        }
        .tp-dl-btn:hover { background:#d44c10; border-color:#d44c10; }

        .tp-signup-row-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.06em; text-transform:uppercase;
          color:#eb5e28; background:none;
          border:1px solid #eb5e28;
          padding:.35rem .7rem; cursor:pointer;
          display:flex; align-items:center; gap:.35rem;
          transition:background .2s,color .2s;
          white-space:nowrap;
          text-decoration:none;
        }
        .tp-signup-row-btn:hover { background:#eb5e28; color:#fffcf2; }

        /* ══ Track grid (cover view) ══ */
        .tp-grid {
          display:grid;
          grid-template-columns:repeat(5, 1fr);
          border-left:1px solid #ccc5b9;
          border-top:1px solid #ccc5b9;
        }
        .tp-grid-card {
          border-right:1px solid #ccc5b9;
          border-bottom:1px solid #ccc5b9;
          display:flex; flex-direction:column;
          position:relative; overflow:hidden;
          background:#fffcf2; transition:background .2s;
        }
        .tp-grid-card:hover, .tp-grid-card.playing { background:#f5f0e8; }
        .tp-grid-card::before {
          content:''; position:absolute; top:0; left:0;
          width:100%; height:3px; background:#eb5e28;
          transform:scaleX(0); transform-origin:left;
          transition:transform .35s cubic-bezier(.16,1,.3,1); z-index:3;
        }
        .tp-grid-card:hover::before, .tp-grid-card.playing::before { transform:scaleX(1); }

        .tp-grid-cover {
          width:100%; aspect-ratio:1; position:relative; overflow:hidden;
          background:#252422; flex-shrink:0; cursor:pointer;
        }
        .tp-grid-cover img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease; }
        .tp-grid-card:hover .tp-grid-cover img { transform:scale(1.05); }
        .tp-grid-cover-ph {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
        }
        .tp-grid-genre-badge {
          position:absolute; top:.6rem; left:.6rem;
          font-family:'Manrope',sans-serif; font-size:.52rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; padding:.18rem .45rem; z-index:2;
        }
        .tp-grid-overlay {
          position:absolute; inset:0; background:rgba(37,36,34,.55);
          display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity .2s; z-index:2;
        }
        .tp-grid-card:hover .tp-grid-overlay, .tp-grid-card.playing .tp-grid-overlay { opacity:1; }

        .tp-grid-body { padding:.85rem; display:flex; flex-direction:column; gap:.3rem; border-top:1px solid #ccc5b9; }
        .tp-grid-title {
          font-family:'Syne',sans-serif; font-weight:700; font-size:.78rem;
          letter-spacing:-.01em; text-transform:uppercase; color:#252422; line-height:1.2;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;
          transition:color .18s;
        }
        .tp-grid-card:hover .tp-grid-title { color:#eb5e28; }
        .tp-grid-sub {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:500;
          color:#403d39; opacity:.5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .tp-grid-tags { display:flex; flex-wrap:wrap; gap:.25rem; margin-top:.15rem; }
        .tp-grid-tag {
          font-family:'Manrope',sans-serif; font-size:.5rem; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; color:#403d39;
          border:1px solid #ccc5b9; padding:.15rem .4rem; line-height:1;
        }
        .tp-grid-actions {
          display:flex; align-items:center; gap:.4rem; margin-top:.55rem; flex-wrap:wrap;
        }
        .tp-grid-icon-btn {
          width:26px; height:26px; border:1px solid #ccc5b9; background:none;
          color:#403d39; cursor:pointer; display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:border-color .2s,color .2s,background .2s;
        }
        .tp-grid-icon-btn:hover { border-color:#eb5e28; color:#eb5e28; }
        .tp-grid-icon-btn.copied { border-color:#eb5e28; background:#eb5e28; color:#fffcf2; }
        .tp-grid-dl-btn {
          font-family:'Manrope',sans-serif; font-size:.56rem; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:1px solid #eb5e28;
          padding:.35rem .55rem; cursor:pointer; flex:1;
          display:flex; align-items:center; justify-content:center; gap:.3rem;
          transition:background .2s; white-space:nowrap;
        }
        .tp-grid-dl-btn:hover { background:#d44c10; border-color:#d44c10; }
        .tp-grid-signup-btn {
          font-family:'Manrope',sans-serif; font-size:.56rem; font-weight:600;
          letter-spacing:.06em; text-transform:uppercase;
          color:#eb5e28; background:none; border:1px solid #eb5e28;
          padding:.35rem .55rem; cursor:pointer; flex:1; text-decoration:none;
          display:flex; align-items:center; justify-content:center; gap:.3rem;
          transition:background .2s,color .2s; white-space:nowrap;
        }
        .tp-grid-signup-btn:hover { background:#eb5e28; color:#fffcf2; }

        /* Loading / empty */
        .tp-spinner-wrap {
          display:flex; align-items:center; justify-content:center;
          padding:5rem; color:#eb5e28;
        }
        .tp-spinner-ring {
          width:32px; height:32px;
          border:2px solid rgba(235,94,40,.15);
          border-top-color:#eb5e28;
          border-radius:50%;
          animation:tp-spin .8s linear infinite;
        }
        @keyframes tp-spin { to { transform:rotate(360deg); } }

        .tp-empty {
          padding:5rem 2rem;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:1rem; text-align:center;
          border:1px solid #ccc5b9;
        }
        .tp-empty-icon {
          width:52px; height:52px; border:1px solid #ccc5b9;
          display:flex; align-items:center; justify-content:center; color:#ccc5b9;
        }
        .tp-empty-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.95rem; text-transform:uppercase; color:#252422;
        }
        .tp-empty-desc {
          font-family:'Manrope',sans-serif; font-size:.78rem;
          color:#403d39; opacity:.55; max-width:280px; line-height:1.6;
        }
        .tp-empty-clear {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.7rem 1.5rem; cursor:pointer;
          transition:background .2s;
        }
        .tp-empty-clear:hover { background:#d44c10; }

        /* ══ Pagination ══ */
        .tp-pagination {
          display:flex; align-items:center; justify-content:space-between;
          margin-top:2.5rem; padding-top:2rem; border-top:1px solid #ccc5b9;
          flex-wrap:wrap; gap:1rem;
        }
        .tp-page-info {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase; color:#403d39; opacity:.4;
        }
        .tp-page-btns { display:flex; }
        .tp-page-btn {
          font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:600;
          color:#403d39; background:#fffcf2;
          border:1px solid #ccc5b9; border-right:none;
          padding:.6rem 1rem; cursor:pointer;
          transition:background .2s,color .2s,border-color .2s;
          display:flex; align-items:center; gap:.35rem;
        }
        .tp-page-btn:last-child { border-right:1px solid #ccc5b9; }
        .tp-page-btn:hover:not(:disabled):not(.active) { background:#f5f0e8; border-color:#403d39; color:#252422; }
        .tp-page-btn.active { background:#eb5e28; border-color:#eb5e28; color:#fffcf2; }
        .tp-page-btn:disabled { opacity:.35; cursor:not-allowed; }

        /* ══ Track info popup ══ */
        .tp-popup-backdrop {
          position:fixed; inset:0; background:rgba(37,36,34,.7);
          z-index:9999; display:flex;
          align-items:center; justify-content:center; padding:1.5rem;
        }
        .tp-popup {
          width:100%; max-width:440px; background:#fffcf2;
          border:1px solid #ccc5b9; position:relative;
        }
        .tp-popup::before {
          content:''; position:absolute; top:0; left:0;
          width:100%; height:3px; background:#eb5e28;
        }
        .tp-popup-head {
          padding:1.75rem 1.75rem 1.25rem; border-bottom:1px solid #ccc5b9;
        }
        .tp-popup-eyebrow {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase;
          color:#403d39; opacity:.45; margin-bottom:.5rem;
        }
        .tp-popup-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:1rem; text-transform:uppercase; color:#252422; line-height:1.1;
        }
        .tp-popup-sub {
          font-family:'Manrope',sans-serif; font-size:.72rem;
          color:#403d39; opacity:.5; margin-top:.2rem;
        }
        .tp-popup-close {
          position:absolute; top:1rem; right:1rem;
          width:28px; height:28px; border:1px solid #ccc5b9;
          background:none; cursor:pointer; color:#403d39;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
        }
        .tp-popup-close:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }

        .tp-popup-grid {
          display:grid; grid-template-columns:1fr 1fr;
          border-left:1px solid #ccc5b9; border-top:1px solid #ccc5b9;
          margin:0 1.75rem;
        }
        .tp-popup-cell {
          border-right:1px solid #ccc5b9; border-bottom:1px solid #ccc5b9;
          padding:.65rem .85rem;
        }
        .tp-popup-cell-key {
          font-family:'Manrope',sans-serif; font-size:.55rem; font-weight:600;
          letter-spacing:.16em; text-transform:uppercase; color:#403d39; opacity:.4;
        }
        .tp-popup-cell-val {
          font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:600;
          color:#252422; margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Mood tags in popup */
        .tp-popup-tags {
          display:flex; flex-wrap:wrap; gap:.3rem;
          padding:1rem 1.75rem 0;
        }

        .tp-popup-actions {
          padding:1.25rem 1.75rem 1.75rem;
          display:flex; flex-direction:column; gap:.6rem;
        }
        .tp-popup-action {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          border:none; padding:.8rem 1.25rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          transition:background .2s,transform .1s; width:100%;
        }
        .tp-popup-action.primary { background:#eb5e28; color:#fffcf2; }
        .tp-popup-action.primary:hover { background:#d44c10; transform:translateY(-1px); }
        .tp-popup-action.secondary { background:#252422; color:#fffcf2; }
        .tp-popup-action.secondary:hover { background:#403d39; }
        .tp-popup-signup {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          background:#252422; color:#fffcf2; border:none;
          padding:.8rem 1.25rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          transition:background .2s; width:100%; text-decoration:none;
          margin-top:.25rem;
        }
        .tp-popup-signup:hover { background:#eb5e28; }

        .tp-share-btn {
          width:30px; height:30px; background:none;
          border:1px solid #ccc5b9; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:#403d39; flex-shrink:0;
          transition:border-color .2s,color .2s,background .2s;
        }
        .tp-share-btn:hover { border-color:#eb5e28; color:#eb5e28; }
        .tp-share-btn.copied { border-color:#eb5e28; background:#eb5e28; color:#fffcf2; }

        /* ══ Responsive ══ */
        @media(max-width:1200px) {
          .tp-grid { grid-template-columns:repeat(4,1fr); }
        }
        @media(max-width:1024px) {
          .tp-head { grid-template-columns:1fr; gap:1.5rem; }
          .tp-list-head { display:none; }
          .tp-row {
            grid-template-columns: 36px 1fr auto;
            grid-template-rows: auto auto;
            gap:.5rem .75rem;
          }
          .tp-row-num { grid-column:1; grid-row:1; align-self:center; }
          .tp-play-btn { display:none; }
          .tp-row-meta { grid-column:2; grid-row:1; }
          .tp-tags { grid-column:2; grid-row:2; }
          .tp-row-dur { display:none; }
          .tp-row-actions { grid-column:3; grid-row:1/3; align-self:center; flex-direction:column; }
          .tp-grid { grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:640px) {
          .tp-inner { padding:1.5rem 1rem; }
          .tp-signup-banner { flex-direction:column; align-items:flex-start; gap:.75rem; }
          .tp-row { padding:.75rem 1rem; }
          .tp-popup-grid { grid-template-columns:1fr; }
          .tp-grid { grid-template-columns:repeat(2,1fr); }
          .tp-toolbar { flex-wrap:wrap; }
        }
      `}</style>

      <div className="tp-root">
        <div className="tp-inner">
          {/* Page header */}
          <div className="tp-head">
            <div>
              <div className="tp-eyebrow">
                <span className="tp-eyebrow-line" />
                <span className="tp-eyebrow-text">Browse & License</span>
              </div>
              <h1 className="tp-title">
                Music <em>Library</em>
              </h1>
            </div>
            <div className="tp-head-right">
              <p className="tp-head-desc">
                Search, preview, and license sync-cleared tracks for your next
                production.
              </p>
              {!loading && (
                <span className="tp-count">
                  {totalItems} track{totalItems !== 1 ? "s" : ""} available
                </span>
              )}
            </div>
          </div>

          {/* Sign-up banner for guests */}
          {!isUser && !isAdmin && (
            <div className="tp-signup-banner">
              <p className="tp-signup-banner-text">
                <strong>Free account required to download.</strong> Sign up in
                seconds — no credit card needed.
              </p>
              <a href="/signup" className="tp-signup-banner-btn">
                Sign Up Free →
              </a>
            </div>
          )}

          {/* Filters */}
          <div className="tp-filters">
            <div className="tp-search-wrap">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search by title, composer, mood, genre…"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleSearchChange(e.target.value);
                }}
                className="tp-search-input"
              />
            </div>

            <div className="tp-select-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="tp-select"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <SlidersHorizontal size={12} className="tp-select-arrow" />
            </div>

            <div className="tp-select-wrap">
              <select
                value={genreFilter}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="tp-select"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <SlidersHorizontal size={12} className="tp-select-arrow" />
            </div>

            {availableMoods.length > 0 && (
              <div className="tp-select-wrap">
                <select
                  value={moodFilter}
                  onChange={(e) => handleMoodChange(e.target.value)}
                  className="tp-select"
                >
                  <option value="">All Moods</option>
                  {availableMoods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal size={12} className="tp-select-arrow" />
              </div>
            )}

            {hasFilters && (
              <button className="tp-clear-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {/* Toolbar: results info + view toggle */}
          <div className="tp-toolbar">
            {hasFilters ? (
              <div className="tp-results-info">
                {totalItems} result{totalItems !== 1 ? "s" : ""}
                {search && ` — "${search}"`}
                {categoryFilter && ` · ${categoryFilter}`}
                {genreFilter && ` · ${genreFilter}`}
                {moodFilter && ` · ${moodFilter}`}
              </div>
            ) : (
              <div className="tp-results-info muted">
                Showing {tracks.length} of {totalItems}
              </div>
            )}

            <div className="tp-view-toggle">
              <button
                className={`tp-view-btn${viewMode === "list" ? " active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
                title="List view"
              >
                <ListIcon size={14} />
              </button>
              <button
                className={`tp-view-btn${viewMode === "grid" ? " active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Cover grid view"
                title="Cover grid view"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="tp-spinner-wrap">
              <div className="tp-spinner-ring" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              style={{
                fontFamily: "Manrope,sans-serif",
                fontSize: ".85rem",
                color: "#eb5e28",
                padding: "2rem 0",
              }}
            >
              {error}
            </p>
          )}

          {/* Empty state (shared between views) */}
          {!loading && !error && tracks.length === 0 && (
            <div className="tp-empty">
              <div className="tp-empty-icon">
                <Search size={20} />
              </div>
              <div className="tp-empty-title">No Tracks Found</div>
              <p className="tp-empty-desc">
                No tracks match your filters. Try adjusting your search.
              </p>
              <button className="tp-empty-clear" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {/* Track list — row view */}
          {!loading && !error && tracks.length > 0 && viewMode === "list" && (
            <div className="tp-list">
              {/* Column headers */}
              <div className="tp-list-head">
                <div className="tp-list-head-cell">#</div>
                <div className="tp-list-head-cell"></div>
                <div className="tp-list-head-cell">Track</div>
                <div className="tp-list-head-cell">Mood</div>
                <div className="tp-list-head-cell">Duration</div>
                <div
                  className="tp-list-head-cell"
                  style={{ textAlign: "right" }}
                >
                  Actions
                </div>
              </div>

              {tracks.map((track, idx) => {
                const isActive = playingTrackId === track.id;
                const moodArr: string[] = Array.isArray(track.mood)
                  ? track.mood
                  : track.mood
                    ? [track.mood]
                    : [];

                return (
                  <div
                    key={track.id}
                    className={`tp-row${isActive ? " playing" : ""}`}
                    onMouseEnter={() => handleTrackHover(track)}
                  >
                    {/* # */}
                    <span className="tp-row-num">
                      {String((currentPage - 1) * 20 + idx + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    {/* Play */}
                    <div
                      className="tp-cover-wrap"
                      onClick={() => togglePlay(track)}
                      style={{
                        cursor: "pointer",
                        position: "relative",
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                      }}
                    >
                      {track.coverImage ? (
                        <img
                          src={track.coverImage}
                          alt={track.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#252422",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Manrope,sans-serif",
                              fontSize: ".5rem",
                              color: "rgba(255,252,242,.2)",
                              letterSpacing: ".1em",
                            }}
                          >
                            NO ART
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(37,36,34,.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: isActive ? 1 : 0,
                          transition: "opacity .2s",
                        }}
                        className="tp-cover-overlay"
                      >
                        {isActive ? (
                          <Pause size={12} fill="#fffcf2" color="#fffcf2" />
                        ) : (
                          <Play
                            size={12}
                            fill="#fffcf2"
                            color="#fffcf2"
                            style={{ marginLeft: 2 }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div
                      className="tp-row-meta"
                      onClick={() => togglePlay(track)}
                    >
                      <div className="tp-row-title">{track.title}</div>
                      <div className="tp-row-composer">
                        {track.composer}
                        {track.bpm ? ` · ${track.bpm} BPM` : ""}
                        {track.genre ? ` · ${track.genre}` : ""}
                      </div>
                    </div>

                    {/* Mood tags */}
                    <div className="tp-tags">
                      {moodArr.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          className={`tp-tag${moodFilter === tag ? " active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoodChange(moodFilter === tag ? "" : tag);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Duration */}
                    <span className="tp-row-dur">{track.duration}</span>

                    {/* Actions */}
                    <div
                      className="tp-row-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className={`tp-share-btn${copiedTrackId === track.id ? " copied" : ""}`}
                        onClick={() => handleShare(track)}
                        aria-label="Share track"
                        title="Share track"
                      >
                        {copiedTrackId === track.id ? (
                          <Check size={12} />
                        ) : (
                          <Share2 size={12} />
                        )}
                      </button>
                      <button
                        className="tp-info-btn"
                        onClick={() => setSelectedTrack(track)}
                      >
                        Info
                      </button>
                      {isUser && track.downloadable && (
                        <button
                          className="tp-dl-btn"
                          onClick={() => handleDownload(track)}
                        >
                          <Download size={11} /> DOWNLOAD
                        </button>
                      )}
                      {!isUser && !isAdmin && (
                        <a href="/signup" className="tp-signup-row-btn">
                          <Download size={11} /> Free
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Track grid — cover view */}
          {!loading && !error && tracks.length > 0 && viewMode === "grid" && (
            <div className="tp-grid">
              {tracks.map((track) => {
                const isActive = playingTrackId === track.id;
                const moodArr: string[] = Array.isArray(track.mood)
                  ? track.mood
                  : track.mood
                    ? [track.mood]
                    : [];

                return (
                  <div
                    key={track.id}
                    className={`tp-grid-card${isActive ? " playing" : ""}`}
                    onMouseEnter={() => handleTrackHover(track)}
                  >
                    <div
                      className="tp-grid-cover"
                      onClick={() => togglePlay(track)}
                    >
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} />
                      ) : (
                        <div className="tp-grid-cover-ph">
                          <Music size={26} color="#403d39" opacity={0.3} />
                        </div>
                      )}
                      {track.genre && (
                        <span className="tp-grid-genre-badge">
                          {track.genre}
                        </span>
                      )}
                      <div className="tp-grid-overlay">
                        {isActive ? (
                          <Pause size={16} fill="#fffcf2" color="#fffcf2" />
                        ) : (
                          <Play
                            size={16}
                            fill="#fffcf2"
                            color="#fffcf2"
                            style={{ marginLeft: 2 }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="tp-grid-body">
                      <div
                        className="tp-grid-title"
                        onClick={() => setSelectedTrack(track)}
                      >
                        {track.title}
                      </div>
                      <div className="tp-grid-sub">
                        {track.composer}
                        {track.duration ? ` · ${track.duration}` : ""}
                      </div>

                      {moodArr.length > 0 && (
                        <div className="tp-grid-tags">
                          {moodArr.slice(0, 2).map((tag) => (
                            <span key={tag} className="tp-grid-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="tp-grid-actions">
                        <button
                          className={`tp-grid-icon-btn${copiedTrackId === track.id ? " copied" : ""}`}
                          onClick={() => handleShare(track)}
                          aria-label="Share track"
                          title="Share track"
                        >
                          {copiedTrackId === track.id ? (
                            <Check size={12} />
                          ) : (
                            <Share2 size={12} />
                          )}
                        </button>
                        <button
                          className="tp-grid-icon-btn"
                          onClick={() => setSelectedTrack(track)}
                          aria-label="Track info"
                          title="Track info"
                        >
                          <SlidersHorizontal size={12} />
                        </button>
                        {isUser && track.downloadable && (
                          <button
                            className="tp-grid-dl-btn"
                            onClick={() => handleDownload(track)}
                          >
                            <Download size={11} /> Get
                          </button>
                        )}
                        {!isUser && !isAdmin && (
                          <a href="/signup" className="tp-grid-signup-btn">
                            <Download size={11} /> Free
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="tp-pagination">
              <span className="tp-page-info">
                Page {currentPage} of {totalPages} · {totalItems} tracks
              </span>
              <div className="tp-page-btns">
                <button
                  className="tp-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span
                        key={`dots-${i}`}
                        className="tp-page-btn"
                        style={{ cursor: "default", opacity: 0.3 }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`tp-page-btn${p === currentPage ? " active" : ""}`}
                        onClick={() => handlePageChange(p as number)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  className="tp-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Track info popup */}
      {selectedTrack && (
        <div
          className="tp-popup-backdrop"
          onClick={() => setSelectedTrack(null)}
        >
          <div className="tp-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="tp-popup-close"
              onClick={() => setSelectedTrack(null)}
              aria-label="Close"
            >
              <X size={12} />
            </button>

            <div className="tp-popup-head">
              <div className="tp-popup-eyebrow">Track Info</div>
              <div className="tp-popup-title">{selectedTrack.title}</div>
              <div className="tp-popup-sub">
                By {selectedTrack.composer} · {selectedTrack.duration}
              </div>
            </div>

            <div
              className="tp-popup-grid"
              style={{ margin: "1.25rem 1.75rem 0" }}
            >
              {[
                { k: "Track No.", v: selectedTrack.trackNumber },
                { k: "Category", v: selectedTrack.category },
                { k: "Genre", v: selectedTrack.genre },
                { k: "BPM", v: selectedTrack.bpm || "—" },
                { k: "ISRC", v: selectedTrack.isrc || "—" },
                { k: "Date Added", v: fmtDateStr(selectedTrack.createdAt) },
                {
                  k: "Downloadable",
                  v: selectedTrack.downloadable ? "Yes" : "No",
                },
              ].map(({ k, v }) => (
                <div key={k} className="tp-popup-cell">
                  <div className="tp-popup-cell-key">{k}</div>
                  <div className="tp-popup-cell-val">{String(v ?? "—")}</div>
                </div>
              ))}
            </div>

            {/* Mood tags in popup */}
            {(() => {
              const tags: string[] = Array.isArray(selectedTrack.mood)
                ? selectedTrack.mood
                : selectedTrack.mood
                  ? [selectedTrack.mood]
                  : [];
              return tags.length > 0 ? (
                <div className="tp-popup-tags">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className={`tp-tag${moodFilter === tag ? " active" : ""}`}
                      onClick={() => {
                        handleMoodChange(moodFilter === tag ? "" : tag);
                        setSelectedTrack(null);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}

            <div className="tp-popup-actions">
              {isUser && (
                <>
                  <button
                    className="tp-popup-action primary"
                    onClick={() => handleFavourite(selectedTrack)}
                  >
                    <Heart size={13} /> Add to Favourites
                  </button>
                  {selectedTrack.downloadable && (
                    <button
                      className="tp-popup-action primary"
                      onClick={() => handleDownload(selectedTrack)}
                    >
                      <Download size={13} /> Download Track
                    </button>
                  )}
                  {selectedTrack.cueSheetUrl && (
                    <button
                      className="tp-popup-action secondary"
                      onClick={() => handleCueSheet(selectedTrack)}
                    >
                      <FileText size={13} /> Download Cue Sheet
                    </button>
                  )}
                </>
              )}
              {!isUser && !isAdmin && (
                <a href="/signup" className="tp-popup-signup">
                  Sign Up Free to Download →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Player bar */}
      {(() => {
        const playingTrack =
          tracks.find((t) => t.id === playingTrackId) ?? null;
        return (
          <PlayerBar
            track={playingTrack}
            album={
              playingTrack
                ? {
                    id: playingTrack.albumId,
                    title: playingTrack.composer,
                    coverImage: playingTrack.coverImage,
                  }
                : null
            }
            isPlaying={isPlaying}
            onPlayPause={handlePlayerPlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={stopAudio}
            onFavourite={handleFavourite}
            audioRef={audioRef}
          />
        );
      })()}
    </>
  );
};

export default TracksPage;
