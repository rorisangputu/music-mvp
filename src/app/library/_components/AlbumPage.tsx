"use client";

import { useState, useEffect, useRef } from "react";
import { useAlbums } from "@/lib/useAlbums";
import { CATEGORIES, GENRES } from "@/types/music";
import {
  X, Play, Pause, Download, Heart, FileText,
  ChevronLeft, ChevronRight, Search, SlidersHorizontal, ArrowRight
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, query, where, doc, getDoc, Timestamp,
} from "firebase/firestore";
import AlbumCard from "./AlbumCard";

type Track = {
  id: string; title: string; duration: string; composer: string;
  audioUrl: string; cueSheetUrl?: string; category: string; genre: string;
  mood: string[]; tags: string[]; bpm: number; isrc: string;
  trackNumber: number; downloadable: boolean; createdAt: string; albumId: string;
};

type Album = {
  id: string; title: string; description: string; category: string;
  coverImage?: string; genre?: string; cueSheet?: string; releaseDate?: string;
};

interface AlbumPageProps {
  isAdmin: boolean | null;
  isUser: boolean | null;
}

const AlbumsPage = ({ isAdmin, isUser }: AlbumPageProps) => {
  const {
    albums, loading, error, search, categoryFilter, genreFilter,
    currentPage, totalPages, totalItems,
    handleSearchChange, handleCategoryChange, handleGenreChange,
    handlePageChange, clearFilters,
  } = useAlbums();

  const [searchInput, setSearchInput] = useState(search);
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
  const [expandedAlbum, setExpandedAlbum] = useState<Album | null>(null);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const expandRef = useRef<HTMLDivElement>(null);

  // ── Helpers ──────────────────────────────────────────────
  const fmt = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  const fmtTs = (ts: Timestamp) => {
    const s = ts.seconds;
    if (s < 0 || s > 3600) return "0:00";
    return fmt(s);
  };
  const fmtDate = (ts: Timestamp) => ts.toDate().toISOString().split("T")[0];
  const fmtDateStr = (s: string) => new Date(s).toISOString().split("T")[0];

  // ── Fetch ─────────────────────────────────────────────────
  const fetchAlbum = async (albumId: string) => {
    setLoadingTracks(true);
    try {
      const snap = await getDoc(doc(db, "albums", albumId));
      if (snap.exists()) setExpandedAlbum({ id: snap.id, ...snap.data() } as Album);

      const q = query(collection(db, "tracks"), where("albumId", "==", albumId));
      const qs = await getDocs(q);
      const data = qs.docs.map((d) => {
        const dd = d.data();
        return {
          id: d.id, ...dd,
          createdAt: dd.createdAt instanceof Timestamp ? fmtDate(dd.createdAt) : dd.createdAt,
          duration: dd.duration instanceof Timestamp ? fmtTs(dd.duration) : fmt(dd.duration),
        } as Track;
      }).sort((a, b) => a.title.localeCompare(b.title));

      setAlbumTracks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleAlbumClick = (album: Album) => {
    if (expandedAlbumId === album.id) {
      closeExpand();
    } else {
      setExpandedAlbumId(album.id);
      fetchAlbum(album.id);
      setTimeout(() => expandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const closeExpand = () => {
    setExpandedAlbumId(null);
    setExpandedAlbum(null);
    setAlbumTracks([]);
    stopAudio();
  };

  // ── Audio ─────────────────────────────────────────────────
  const stopAudio = () => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); }
    setPlayingTrackId(null);
  };

  const togglePlay = (track: Track) => {
    if (playingTrackId === track.id) { stopAudio(); return; }
    stopAudio();
    const audio = new Audio(track.audioUrl);
    setCurrentAudio(audio);
    setPlayingTrackId(track.id);
    audio.play()
      .then(() => fetch("/api/tracks/play", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id, title: track.title, url: track.audioUrl }),
      }))
      .catch(() => stopAudio());
    audio.onended = () => stopAudio();
  };

  // ── Actions ───────────────────────────────────────────────
  const handleFavourite = async (track: Track) => {
    const res = await fetch("/api/user/favourites", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id }),
    });
    alert(res.ok ? "Added to favourites!" : "Failed to add to favourites.");
  };

  const handleDownload = async (track: Track) => {
    if (!track.downloadable) return alert("This track is not available for download.");
    const a = document.createElement("a");
    a.href = track.audioUrl;
    a.download = `${track.title} - ${track.composer}.mp3`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    await fetch("/api/tracks/download", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id, title: track.title, url: track.audioUrl }),
    });
  };

  const handleCueSheet = (track: Track) => {
    if (!track.cueSheetUrl) return;
    const a = document.createElement("a");
    a.href = track.cueSheetUrl;
    a.download = `${track.title} - cue sheet.cue`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  useEffect(() => () => stopAudio(), [currentAudio]);

  const hasFilters = !!(search || categoryFilter || genreFilter);

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        /* ══ Root ══ */
        .ap-root { width:100%; background:#fffcf2; min-height:100vh; border-top:1px solid #ccc5b9; }
        .ap-inner { max-width:1440px; margin:0 auto; padding:3rem; }

        /* ══ Page header ══ */
        .ap-head {
          display:grid; grid-template-columns:1fr 1fr;
          align-items:flex-end; gap:3rem;
          margin-bottom:2.5rem; padding-bottom:2rem;
          border-bottom:1px solid #ccc5b9;
        }
        .ap-eyebrow { display:flex; align-items:center; gap:.75rem; margin-bottom:1rem; }
        .ap-eyebrow-line { width:28px; height:1px; background:#eb5e28; flex-shrink:0; }
        .ap-eyebrow-text {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase; color:#403d39; opacity:.5;
        }
        .ap-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:clamp(2rem,4vw,4rem); letter-spacing:-.02em; line-height:.95;
          text-transform:uppercase; color:#252422;
        }
        .ap-title em { font-style:normal; color:#eb5e28; }
        .ap-head-right { display:flex; flex-direction:column; justify-content:flex-end; gap:.75rem; }
        .ap-head-desc {
          font-family:'Manrope',sans-serif; font-size:.85rem; font-weight:400;
          line-height:1.7; color:#403d39; opacity:.6; max-width:380px;
        }
        .ap-count {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase; color:#403d39; opacity:.4;
        }

        /* ══ Filters ══ */
        .ap-filters {
          display:flex; flex-wrap:wrap; gap:.75rem;
          align-items:stretch;
          margin-bottom:2rem; padding-bottom:2rem;
          border-bottom:1px solid #ccc5b9;
        }

        .ap-search-wrap {
          position:relative; flex:1; min-width:220px;
          border:1px solid #ccc5b9; background:#fffcf2;
          display:flex; align-items:center;
        }
        .ap-search-wrap:focus-within { border-color:#eb5e28; }
        .ap-search-wrap svg { position:absolute; left:.9rem; color:#ccc5b9; flex-shrink:0; }
        .ap-search-wrap:focus-within svg { color:#eb5e28; }
        .ap-search-input {
          font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:500;
          color:#252422; background:transparent; border:none; outline:none;
          width:100%; padding:.75rem .9rem .75rem 2.5rem;
        }
        .ap-search-input::placeholder { color:#ccc5b9; }

        .ap-select-wrap {
          position:relative; border:1px solid #ccc5b9;
          background:#fffcf2; min-width:160px;
        }
        .ap-select-wrap:focus-within { border-color:#eb5e28; }
        .ap-select {
          font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:500;
          color:#252422; background:transparent; border:none; outline:none;
          width:100%; padding:.75rem 2rem .75rem .9rem;
          -webkit-appearance:none; cursor:pointer;
        }
        .ap-select-arrow {
          position:absolute; right:.75rem; top:50%;
          transform:translateY(-50%); pointer-events:none; color:#ccc5b9;
        }

        .ap-clear-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#403d39; background:none; border:1px solid #ccc5b9;
          padding:.75rem 1.25rem; cursor:pointer; white-space:nowrap;
          transition:border-color .2s,color .2s;
        }
        .ap-clear-btn:hover { border-color:#eb5e28; color:#eb5e28; }

        /* Results info */
        .ap-results-info {
          margin-bottom:1.25rem;
          font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#eb5e28; display:flex; align-items:center; gap:.6rem;
        }
        .ap-results-info::before { content:''; display:block; width:16px; height:1px; background:#eb5e28; }

        /* ══ Album grid ══ */
        .ap-grid {
          display:grid;
          grid-template-columns:repeat(5,1fr);
          border-left:1px solid #ccc5b9;
          border-top:1px solid #ccc5b9;
        }

        /* Inline expand row — spans full width */
        .ap-expand-row {
          grid-column:1/-1;
          border-right:1px solid #ccc5b9;
          border-bottom:1px solid #ccc5b9;
          background:#252422;
          position:relative;
          overflow:hidden;
        }
        .ap-expand-row::before {
          content:''; position:absolute; top:0; left:0;
          width:100%; height:3px; background:#eb5e28;
        }

        /* ══ Expand panel ══ */
        .ap-panel { display:grid; grid-template-columns:300px 1fr; }

        /* Left — album info */
        .ap-panel-left {
          border-right:1px solid rgba(204,197,185,.12);
          display:flex; flex-direction:column;
        }
        .ap-panel-cover { position:relative; width:100%; aspect-ratio:1; overflow:hidden; }
        .ap-panel-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .ap-panel-info { padding:1.5rem; display:flex; flex-direction:column; gap:.6rem; flex:1; }
        .ap-panel-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:1.25rem; letter-spacing:-.02em; line-height:1;
          text-transform:uppercase; color:#fffcf2;
        }
        .ap-panel-meta {
          font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:500;
          color:rgba(255,252,242,.45);
        }
        .ap-panel-meta strong { color:rgba(255,252,242,.65); font-weight:600; }
        .ap-panel-desc {
          font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:400;
          line-height:1.65; color:rgba(255,252,242,.4); margin-top:.25rem;
        }
        .ap-panel-cue {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.65rem 1.25rem; text-decoration:none;
          display:inline-flex; align-items:center; gap:.4rem;
          align-self:flex-start; margin-top:auto;
          transition:background .2s;
        }
        .ap-panel-cue:hover { background:#d44c10; }

        /* Close btn */
        .ap-panel-close {
          position:absolute; top:1rem; right:1rem;
          width:32px; height:32px; z-index:5;
          border:1px solid rgba(255,255,255,.12); background:rgba(37,36,34,.6);
          color:rgba(255,255,255,.5); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
        }
        .ap-panel-close:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }

        /* Right — track list */
        .ap-panel-right { display:flex; flex-direction:column; }
        .ap-tracks-head {
          padding:1rem 1.5rem;
          border-bottom:1px solid rgba(204,197,185,.1);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .ap-tracks-label {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.12em; text-transform:uppercase;
          color:rgba(255,252,242,.35);
          display:flex; align-items:center; gap:.6rem;
        }
        .ap-tracks-label::before { content:''; display:block; width:16px; height:1px; background:#eb5e28; }
        .ap-tracks-count {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          color:rgba(255,252,242,.2);
        }

        .ap-track-row {
          display:flex; align-items:center; gap:1rem;
          padding:.9rem 1.5rem;
          border-bottom:1px solid rgba(204,197,185,.06);
          position:relative; cursor:pointer;
          transition:background .2s;
        }
        .ap-track-row:last-child { border-bottom:none; }
        .ap-track-row:hover { background:rgba(255,252,242,.03); }
        .ap-track-row.playing { background:rgba(235,94,40,.06); }

        .ap-track-row::before {
          content:''; position:absolute; left:0; top:0;
          width:3px; height:100%; background:#eb5e28;
          transform:scaleY(0); transform-origin:top;
          transition:transform .3s cubic-bezier(.16,1,.3,1);
        }
        .ap-track-row:hover::before,
        .ap-track-row.playing::before { transform:scaleY(1); }

        .ap-track-num {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; color:rgba(255,252,242,.2); width:20px;
          flex-shrink:0; text-align:center;
        }
        .ap-track-row.playing .ap-track-num { color:#eb5e28; }

        .ap-play-btn {
          width:32px; height:32px; flex-shrink:0;
          border:1px solid rgba(255,255,255,.1); background:none;
          color:rgba(255,255,255,.4); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
        }
        .ap-play-btn:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }
        .ap-track-row.playing .ap-play-btn { border-color:#eb5e28; color:#eb5e28; }

        .ap-track-meta { flex:1; min-width:0; }
        .ap-track-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.82rem; letter-spacing:-.01em; text-transform:uppercase;
          color:#fffcf2; line-height:1.1;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          transition:color .2s;
        }
        .ap-track-row:hover .ap-track-title,
        .ap-track-row.playing .ap-track-title { color:#eb5e28; }
        .ap-track-sub {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:400;
          color:rgba(255,252,242,.3); margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        .ap-track-dur {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:500;
          color:rgba(255,252,242,.25); flex-shrink:0;
        }

        .ap-options-btn {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:rgba(255,252,242,.3); background:none;
          border:1px solid rgba(255,255,255,.08);
          padding:.35rem .7rem; cursor:pointer; flex-shrink:0;
          transition:border-color .2s,color .2s;
        }
        .ap-options-btn:hover { border-color:#eb5e28; color:#eb5e28; }

        /* Loading spinner inside panel */
        .ap-spinner {
          display:flex; align-items:center; justify-content:center;
          padding:4rem; flex:1;
        }
        .ap-spinner-ring {
          width:32px; height:32px;
          border:2px solid rgba(255,255,255,.08);
          border-top-color:#eb5e28;
          border-radius:50%;
          animation:ap-spin .8s linear infinite;
        }
        @keyframes ap-spin { to { transform:rotate(360deg); } }

        /* ══ Empty state ══ */
        .ap-empty {
          grid-column:1/-1;
          border-right:1px solid #ccc5b9; border-bottom:1px solid #ccc5b9;
          padding:5rem 2rem;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:1rem; text-align:center;
        }
        .ap-empty-icon {
          width:52px; height:52px; border:1px solid #ccc5b9;
          display:flex; align-items:center; justify-content:center; color:#ccc5b9;
        }
        .ap-empty-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.95rem; text-transform:uppercase; color:#252422;
        }
        .ap-empty-desc {
          font-family:'Manrope',sans-serif; font-size:.78rem;
          color:#403d39; opacity:.55; max-width:280px; line-height:1.6;
        }
        .ap-empty-clear {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.7rem 1.5rem; cursor:pointer; margin-top:.25rem;
          transition:background .2s;
        }
        .ap-empty-clear:hover { background:#d44c10; }

        /* ══ Pagination ══ */
        .ap-pagination {
          display:flex; align-items:center; justify-content:space-between;
          margin-top:2.5rem; padding-top:2rem; border-top:1px solid #ccc5b9;
          flex-wrap:wrap; gap:1rem;
        }
        .ap-page-info {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase;
          color:#403d39; opacity:.4;
        }
        .ap-page-btns { display:flex; gap:0; }
        .ap-page-btn {
          font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:600;
          color:#403d39; background:#fffcf2;
          border:1px solid #ccc5b9; border-right:none;
          padding:.6rem 1rem; cursor:pointer;
          transition:background .2s,color .2s,border-color .2s;
          display:flex; align-items:center; gap:.35rem;
        }
        .ap-page-btn:last-child { border-right:1px solid #ccc5b9; }
        .ap-page-btn:hover:not(:disabled):not(.active) { background:#f5f0e8; border-color:#403d39; color:#252422; }
        .ap-page-btn.active { background:#eb5e28; border-color:#eb5e28; color:#fffcf2; }
        .ap-page-btn:disabled { opacity:.35; cursor:not-allowed; }

        /* ══ Track options popup ══ */
        .ap-popup-backdrop {
          position:fixed; inset:0;
          background:rgba(37,36,34,.7);
          z-index:9999; display:flex;
          align-items:center; justify-content:center; padding:1.5rem;
        }
        .ap-popup {
          width:100%; max-width:420px;
          background:#fffcf2;
          border:1px solid #ccc5b9;
          position:relative;
        }
        .ap-popup::before {
          content:''; position:absolute; top:0; left:0;
          width:100%; height:3px; background:#eb5e28;
        }
        .ap-popup-head {
          padding:1.75rem 1.75rem 1.25rem;
          border-bottom:1px solid #ccc5b9;
        }
        .ap-popup-eyebrow {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase;
          color:#403d39; opacity:.45; margin-bottom:.5rem;
        }
        .ap-popup-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:1rem; text-transform:uppercase; color:#252422;
          line-height:1.1;
        }
        .ap-popup-sub {
          font-family:'Manrope',sans-serif; font-size:.72rem;
          color:#403d39; opacity:.5; margin-top:.2rem;
        }
        .ap-popup-close {
          position:absolute; top:1rem; right:1rem;
          width:28px; height:28px; border:1px solid #ccc5b9;
          background:none; cursor:pointer; color:#403d39;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s,color .2s,background .2s;
        }
        .ap-popup-close:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }

        /* Info grid */
        .ap-popup-grid {
          display:grid; grid-template-columns:1fr 1fr;
          border-left:1px solid #ccc5b9; border-top:1px solid #ccc5b9;
          margin:0 1.75rem;
        }
        .ap-popup-cell {
          border-right:1px solid #ccc5b9; border-bottom:1px solid #ccc5b9;
          padding:.65rem .85rem;
        }
        .ap-popup-cell-key {
          font-family:'Manrope',sans-serif; font-size:.55rem; font-weight:600;
          letter-spacing:.16em; text-transform:uppercase; color:#403d39; opacity:.4;
        }
        .ap-popup-cell-val {
          font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:600;
          color:#252422; margin-top:.15rem;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Actions */
        .ap-popup-actions {
          padding:1.25rem 1.75rem 1.75rem;
          display:flex; flex-direction:column; gap:.6rem;
        }
        .ap-popup-action {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
          border:none; padding:.8rem 1.25rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          transition:background .2s,transform .2s;
          width:100%;
        }
        .ap-popup-action.primary { background:#eb5e28; color:#fffcf2; }
        .ap-popup-action.primary:hover { background:#d44c10; transform:translateY(-1px); }
        .ap-popup-action.secondary { background:#252422; color:#fffcf2; }
        .ap-popup-action.secondary:hover { background:#403d39; }

        /* ══ Responsive ══ */
        @media(max-width:1024px) {
          .ap-head   { grid-template-columns:1fr; gap:1.5rem; }
          .ap-grid   { grid-template-columns:repeat(4,1fr); }
          .ap-panel  { grid-template-columns:1fr; }
          .ap-panel-left { border-right:none; border-bottom:1px solid rgba(204,197,185,.12); }
          .ap-panel-cover { aspect-ratio:2/1; }
        }
        @media(max-width:640px) {
          .ap-inner  { padding:2rem 1.5rem; }
          .ap-grid   { grid-template-columns:repeat(2,1fr); }
          .ap-popup-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="ap-root">
        <div className="ap-inner">

          {/* Page header */}
          <div className="ap-head">
            <div>
              <div className="ap-eyebrow">
                <span className="ap-eyebrow-line" />
                <span className="ap-eyebrow-text">Browse & License</span>
              </div>
              <h1 className="ap-title">
                Music <em>Library</em>
              </h1>
            </div>
            <div className="ap-head-right">
              <p className="ap-head-desc">
                Search, preview, and license sync-cleared tracks for your next production.
              </p>
              {!loading && (
                <span className="ap-count">{totalItems} track{totalItems !== 1 ? "s" : ""} available</span>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="ap-filters">
            <div className="ap-search-wrap">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search albums, genres, categories…"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); handleSearchChange(e.target.value); }}
                className="ap-search-input"
              />
            </div>

            <div className="ap-select-wrap">
              <select value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value)} className="ap-select">
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <SlidersHorizontal size={12} className="ap-select-arrow" />
            </div>

            <div className="ap-select-wrap">
              <select value={genreFilter} onChange={(e) => handleGenreChange(e.target.value)} className="ap-select">
                <option value="">All Genres</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <SlidersHorizontal size={12} className="ap-select-arrow" />
            </div>

            {hasFilters && (
              <button className="ap-clear-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {/* Results info */}
          {hasFilters && (
            <div className="ap-results-info">
              {albums.length} of {totalItems} results
              {search && ` — "${search}"`}
              {categoryFilter && ` · ${categoryFilter}`}
              {genreFilter && ` · ${genreFilter}`}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "5rem", color: "#eb5e28" }}>
              <div className="ap-spinner-ring" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: ".85rem", color: "#eb5e28", padding: "2rem 0" }}>
              {error}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <div className="ap-grid">
              {albums.length > 0 ? albums.map((album, idx) => {
                const isExpanded = expandedAlbumId === album.id;
                // Insert expand row after the album that triggered it
                // We need to also figure out after which row to insert
                const COLS = 5;
                const rowEnd = (Math.floor(idx / COLS) + 1) * COLS - 1;
                const isLastInRow = idx === rowEnd || idx === albums.length - 1;
                const isFirstExpanded = expandedAlbumId && albums.findIndex(a => a.id === expandedAlbumId) === idx;

                return [
                  <div key={album.id} style={{ borderRight: "1px solid #ccc5b9", borderBottom: "1px solid #ccc5b9" }}>
                    <AlbumCard
                      album={album}
                      onClick={handleAlbumClick}
                      active={isExpanded}
                    />
                  </div>,

                  // After every row that contains the expanded album, insert expand panel
                  isLastInRow && expandedAlbumId && albums.slice(Math.floor(idx / COLS) * COLS, idx + 1).some(a => a.id === expandedAlbumId) ? (
                    <div key={`expand-${expandedAlbumId}`} className="ap-expand-row" ref={expandRef}>
                      <button className="ap-panel-close" onClick={closeExpand} aria-label="Close">
                        <X size={14} />
                      </button>

                      {loadingTracks ? (
                        <div className="ap-spinner"><div className="ap-spinner-ring" /></div>
                      ) : expandedAlbum ? (
                        <div className="ap-panel">
                          {/* Left */}
                          <div className="ap-panel-left">
                            {expandedAlbum.coverImage && (
                              <div className="ap-panel-cover">
                                <img src={expandedAlbum.coverImage} alt={expandedAlbum.title} />
                              </div>
                            )}
                            <div className="ap-panel-info">
                              <div className="ap-panel-title">{expandedAlbum.title}</div>
                              <div className="ap-panel-meta">
                                <strong>Category</strong> — {expandedAlbum.category}
                              </div>
                              {expandedAlbum.genre && (
                                <div className="ap-panel-meta">
                                  <strong>Genre</strong> — {expandedAlbum.genre}
                                </div>
                              )}
                              {expandedAlbum.releaseDate && (
                                <div className="ap-panel-meta">
                                  <strong>Released</strong> — {expandedAlbum.releaseDate}
                                </div>
                              )}
                              {expandedAlbum.description && (
                                <p className="ap-panel-desc">{expandedAlbum.description}</p>
                              )}
                              {expandedAlbum.cueSheet && (
                                <a href={expandedAlbum.cueSheet} target="_blank" rel="noopener noreferrer" className="ap-panel-cue">
                                  Download Cue Sheet <ArrowRight size={12} />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Right — tracks */}
                          <div className="ap-panel-right">
                            <div className="ap-tracks-head">
                              <div className="ap-tracks-label">Tracks</div>
                              <span className="ap-tracks-count">{albumTracks.length} tracks</span>
                            </div>
                            {albumTracks.map((track, ti) => (
                              <div
                                key={track.id}
                                className={`ap-track-row${playingTrackId === track.id ? " playing" : ""}`}
                              >
                                <span className="ap-track-num">{String(ti + 1).padStart(2, "0")}</span>
                                <button className="ap-play-btn" onClick={() => togglePlay(track)} aria-label="Play">
                                  {playingTrackId === track.id
                                    ? <Pause size={13} fill="currentColor" />
                                    : <Play size={13} fill="currentColor" style={{ marginLeft: 2 }} />
                                  }
                                </button>
                                <div className="ap-track-meta">
                                  <div className="ap-track-title">{track.title}</div>
                                  <div className="ap-track-sub">
                                    {track.composer}{track.bpm ? ` · ${track.bpm} BPM` : ""}
                                  </div>
                                </div>
                                <span className="ap-track-dur">{track.duration}</span>
                                <button className="ap-options-btn" onClick={() => setSelectedTrack(track)}>
                                  Info
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null
                ];
              }) : (
                <div className="ap-empty">
                  <div className="ap-empty-icon">
                    <Search size={20} />
                  </div>
                  <div className="ap-empty-title">No Albums Found</div>
                  <p className="ap-empty-desc">No albums match your current filters. Try adjusting your search.</p>
                  <button className="ap-empty-clear" onClick={clearFilters}>Clear Filters</button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ap-pagination">
              <span className="ap-page-info">Page {currentPage} of {totalPages}</span>
              <div className="ap-page-btns">
                <button
                  className="ap-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span key={`dots-${i}`} className="ap-page-btn" style={{ cursor: "default", opacity: .3 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`ap-page-btn${p === currentPage ? " active" : ""}`}
                        onClick={() => handlePageChange(p as number)}
                      >{p}</button>
                    )
                  )
                }
                <button
                  className="ap-page-btn"
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

      {/* Track options popup */}
      {selectedTrack && (
        <div className="ap-popup-backdrop" onClick={() => setSelectedTrack(null)}>
          <div className="ap-popup" onClick={(e) => e.stopPropagation()}>
            <button className="ap-popup-close" onClick={() => setSelectedTrack(null)} aria-label="Close">
              <X size={12} />
            </button>

            <div className="ap-popup-head">
              <div className="ap-popup-eyebrow">Track Info</div>
              <div className="ap-popup-title">{selectedTrack.title}</div>
              <div className="ap-popup-sub">By {selectedTrack.composer} · {selectedTrack.duration}</div>
            </div>

            <div className="ap-popup-grid" style={{ margin: "1.25rem 1.75rem 0" }}>
              {[
                { k: "Track No.", v: selectedTrack.trackNumber },
                { k: "Category", v: selectedTrack.category },
                { k: "Genre", v: selectedTrack.genre },
                { k: "Mood", v: Array.isArray(selectedTrack.mood) ? selectedTrack.mood.join(", ") : selectedTrack.mood },
                { k: "BPM", v: selectedTrack.bpm || "—" },
                { k: "ISRC", v: selectedTrack.isrc || "—" },
                { k: "Date Added", v: fmtDateStr(selectedTrack.createdAt) },
                { k: "Downloadable", v: selectedTrack.downloadable ? "Yes" : "No" },
              ].map(({ k, v }) => (
                <div key={k} className="ap-popup-cell">
                  <div className="ap-popup-cell-key">{k}</div>
                  <div className="ap-popup-cell-val">{String(v)}</div>
                </div>
              ))}
            </div>

            {isUser && (
              <div className="ap-popup-actions">
                <button className="ap-popup-action primary" onClick={() => handleFavourite(selectedTrack)}>
                  <Heart size={13} /> Add to Favourites
                </button>
                {selectedTrack.downloadable && (
                  <button className="ap-popup-action primary" onClick={() => handleDownload(selectedTrack)}>
                    <Download size={13} /> Download Track
                  </button>
                )}
                {selectedTrack.cueSheetUrl && (
                  <button className="ap-popup-action secondary" onClick={() => handleCueSheet(selectedTrack)}>
                    <FileText size={13} /> Download Cue Sheet
                  </button>
                )}
                {selectedTrack.cueSheetUrl && (
                  <a
                    href={selectedTrack.cueSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "Manrope,sans-serif", fontSize: ".65rem",
                      fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
                      color: "#eb5e28", textDecoration: "none", textAlign: "center",
                      display: "block", paddingTop: ".25rem",
                    }}
                  >
                    View Cue Sheet Online →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumsPage;