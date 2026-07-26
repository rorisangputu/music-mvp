"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, X, Heart } from "lucide-react";
import { Track } from "@/types/music";

type Album = {
  id: string;
  title: string;
  coverImage?: string;
};

interface PlayerBarProps {
  track: Track | null;
  album: Album | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onFavourite: (track: Track) => void | Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function PlayerBar({
  track,
  album,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onClose,
  onFavourite,
  audioRef,
}: PlayerBarProps) {
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      if (!isDragging) {
        setCurrent(audio.currentTime);
      }

      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onMeta = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    // Handle metadata that may already be loaded
    onMeta();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
    };
  }, [track, isDragging]);

  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    setLiked(false);
  }, [track]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const getPctFromEvent = (clientX: number): number => {
    const rect = scrubRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const seekTo = (pct: number) => {
    if (!audioRef.current || !duration) return;
    const t = pct * duration;
    audioRef.current.currentTime = t;
    setCurrent(t);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    seekTo(getPctFromEvent(e.clientX));
    const onMove = (ev: MouseEvent) =>
      setCurrent(getPctFromEvent(ev.clientX) * duration);
    const onUp = (ev: MouseEvent) => {
      seekTo(getPctFromEvent(ev.clientX));
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekTo(getPctFromEvent(e.touches[0].clientX));
    const onMove = (ev: TouchEvent) =>
      setCurrent(getPctFromEvent(ev.touches[0].clientX) * duration);
    const onEnd = (ev: TouchEvent) => {
      seekTo(getPctFromEvent(ev.changedTouches[0].clientX));
      setIsDragging(false);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  const skipForward = (secs: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + secs,
      duration,
    );
    setCurrent(audioRef.current.currentTime);
  };

  const handleLike = () => {
    if (!track) return;
    setLiked(true);
    onFavourite(track);
  };

  // Derive cover from track.coverImage first, fall back to album prop
  const coverImage = track?.coverImage ?? album?.coverImage;
  const coverAlt = track?.title ?? album?.title ?? "";
  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <>
      <style>{`
        .pb-root {
          position:fixed; bottom:0; left:0; right:0; z-index:1000;
          height:72px; background:#1a1917;
          border-top:1px solid rgba(255,255,255,.08);
          display:flex; align-items:center; justify-content:center;
          transition:transform .3s cubic-bezier(.16,1,.3,1);
        }
        .pb-inner {
          width:100%; max-width:1440px;
          display:flex; align-items:center; gap:1.25rem;
          padding:0 3rem;
        }
        .pb-cover {
          width:44px; height:44px; flex-shrink:0;
          overflow:hidden; background:#2a2825;
        }
        .pb-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .pb-cover-ph {
          width:100%; height:100%; display:flex;
          align-items:center; justify-content:center; color:rgba(255,255,255,.2);
        }
        .pb-info { min-width:0; flex:0 0 180px; }
        .pb-title {
          font-family:'Syne',sans-serif; font-size:.75rem; font-weight:700;
          text-transform:uppercase; color:#fffcf2;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .pb-album {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:400;
          color:rgba(255,252,242,.35); margin-top:2px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .pb-controls { display:flex; align-items:center; gap:.5rem; flex-shrink:0; }
        .pb-btn {
          width:32px; height:32px; background:none;
          border:1px solid rgba(255,255,255,.1);
          color:rgba(255,255,255,.45); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s, color .2s, background .2s;
          flex-shrink:0;
        }
        .pb-btn:hover { border-color:#eb5e28; color:#fffcf2; background:#eb5e28; }
        .pb-btn.primary { width:36px; height:36px; border-color:#eb5e28; color:#eb5e28; }
        .pb-btn.primary:hover { background:#eb5e28; color:#fffcf2; }
        .pb-btn.liked { border-color:#eb5e28; color:#eb5e28; }
        .pb-skip-group { display:flex; align-items:center; gap:.25rem; flex-shrink:0; }
        .pb-skip-btn {
          height:28px; background:none;
          border:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.35); cursor:pointer;
          display:flex; align-items:center; gap:3px;
          padding:0 .5rem;
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.06em;
          transition:border-color .2s, color .2s, background .2s;
          white-space:nowrap;
        }
        .pb-skip-btn:hover { border-color:#eb5e28; color:#eb5e28; }
        .pb-scrubber { flex:1; display:flex; flex-direction:column; gap:5px; min-width:0; }
        .pb-track {
          width:100%; height:4px; background:rgba(255,255,255,.08);
          cursor:pointer; position:relative; user-select:none; touch-action:none;
        }
        .pb-track:hover .pb-fill::after { transform:scale(1); }
        .pb-fill { height:100%; background:#eb5e28; position:relative; pointer-events:none; }
        .pb-fill::after {
          content:''; position:absolute; right:-6px; top:-4px;
          width:12px; height:12px; background:#eb5e28; border-radius:50%;
          transform:scale(0); transition:transform .15s ease;
        }
        .pb-times {
          display:flex; justify-content:space-between;
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:500;
          color:rgba(255,252,242,.25);
        }
        .pb-close {
          width:28px; height:28px; flex-shrink:0;
          border:1px solid rgba(255,255,255,.08); background:none;
          color:rgba(255,255,255,.3); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:border-color .2s, color .2s; margin-left:.25rem;
        }
        .pb-close:hover { border-color:#eb5e28; color:#eb5e28; }
        @media(max-width:1024px) {
          .pb-inner { padding:0 1.5rem; }
          .pb-skip-group { display:none; }
        }
        @media(max-width:640px) {
          .pb-inner { gap:.75rem; padding:0 1rem; }
          .pb-info { flex:1; min-width:0; }
          .pb-scrubber { display:none; }
        }
      `}</style>

      <div
        className="pb-root"
        style={{ transform: track ? "translateY(0)" : "translateY(100%)" }}
        role="region"
        aria-label="Now playing"
      >
        <div className="pb-inner">
          {/* Cover */}
          <div className="pb-cover">
            {coverImage ? (
              <img src={coverImage} alt={coverAlt} />
            ) : (
              <div className="pb-cover-ph">
                <Play size={16} />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="pb-info">
            <div className="pb-title">{track?.title ?? ""}</div>
            <div className="pb-album">
              {track?.composer ?? album?.title ?? "—"}
            </div>
          </div>

          {/* Transport controls */}
          <div className="pb-controls">
            <button
              className="pb-btn"
              onClick={onPrev}
              aria-label="Previous track"
            >
              <SkipBack size={13} fill="currentColor" />
            </button>
            <button
              className="pb-btn primary"
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>
            <button className="pb-btn" onClick={onNext} aria-label="Next track">
              <SkipForward size={13} fill="currentColor" />
            </button>
          </div>

          {/* Skip buttons */}
          {/* <div className="pb-skip-group" aria-label="Skip forward">
            {[
              { label: "+15s", secs: 15 },
              { label: "+30s", secs: 30 },
              { label: "+1m", secs: 60 },
            ].map(({ label, secs }) => (
              <button
                key={secs}
                className="pb-skip-btn"
                onClick={() => skipForward(secs)}
                aria-label={`Skip forward ${label}`}
              >
                <SkipForward size={10} />
                {label}
              </button>
            ))}
          </div> */}

          {/* Scrubber */}
          <div className="pb-scrubber">
            <div
              className="pb-track"
              ref={scrubRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              aria-label="Seek"
              role="slider"
              aria-valuenow={Math.round(current)}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
            >
              <div className="pb-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="pb-times">
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Like */}
          <button
            className={`pb-btn${liked ? " liked" : ""}`}
            onClick={handleLike}
            aria-label="Add to favourites"
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
          </button>

          {/* Close */}
          <button
            className="pb-close"
            onClick={onClose}
            aria-label="Close player"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </>
  );
}
