// app/album/[albumId]/AlbumPageClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { deleteAlbum, DeleteProgress } from "@/lib/music-delete";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  AlertTriangle,
  X,
} from "lucide-react";
import TrackCard from "@/app/library/_components/TrackCard";
import TrackModal from "@/app/library/_components/TrackModal";

type Track = {
  id: string;
  title: string;
  composer: string;
  trackNumber: number;
  duration: string;

  version: string;
  isrc?: string | null;
  releaseDate?: string | null;
  parentTrackId?: string | null;

  genre: string;
  subGenre?: string | null;
  mood: string[];
  energy: string;
  bpm: number;
  musicalKey?: string | null;

  instruments: string[];
  vocals: string;
  vocalLanguage?: string | null;
  featuredInstrument?: string | null;

  category: string;
  usageTags: string[];

  downloadable: boolean;
  licenseTier: string;
  exclusive: boolean;

  cueSheetUrl?: string | null;
  audioUrl: string | null;
  waveformUrl?: string | null;

  playCount: number;
  downloadCount: number;

  featured: boolean;
  newRelease: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;

  albumId: string;

  downloads: {
    id: string;
    format: string;
    url: string;
    fileSize?: number | null;
    bitrate?: number | null;
  }[];
};

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  genre: string;
  composer: string;
  coverImage: string;
  cueSheet?: string | null;
  featured: boolean;
  trackCount: number;
  mood: string[];
  releaseDate?: string | null;
};

interface AlbumPageClientProps {
  album: Album;
  initialTracks: Track[];
  isAdmin: boolean | null;
  isUser: boolean | null;
}

export default function AlbumPageClient({
  album,
  initialTracks,
  isAdmin,
  isUser,
}: AlbumPageClientProps) {
  const { albumId } = useParams();
  const router = useRouter();
  const [tracks] = useState<Track[]>(initialTracks);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<DeleteProgress[]>([]);
  const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const handleAddToPlaylist = async (trackId: string, playlistId: string) => {
    try {
      const response = await fetch("/api/playlists/add-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId,
          playlistId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add track to playlist");
      }

      return response.json();
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      throw error;
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album || !albumId) return;

    setIsDeleting(true);
    setDeleteMessage({ type: "", text: "" });
    setShowDeleteConfirm(false);

    try {
      await deleteAlbum(albumId as string, setDeleteProgress);

      setDeleteMessage({
        type: "success",
        text: "Album deleted successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/library");
      }, 2000);
    } catch (error) {
      setDeleteMessage({
        type: "error",
        text: `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }

    setIsDeleting(false);
  };

  const handleAddToFavorites = async (track: Track) => {
    try {
      const response = await fetch("/api/user/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId: track.id,
        }),
      });

      if (response.ok) {
        alert("Track added to favorites!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add to favorites");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites. Please try again.");
    }
  };

  const incrementPlayCount = async (
    trackId: string,
    title: string,
    url: string,
  ) => {
    try {
      const res = await fetch("/api/tracks/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, title, url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, message: errorData.message, code: 400 };
      }
      return { success: true, message: "Play count incremented", code: 200 };
    } catch (error) {
      return { success: false, message: "Server Error", code: 500 };
    }
  };

  const incrementDownloadCount = async (
    trackId: string,
    title: string,
    url: string,
  ) => {
    try {
      const response = await fetch("/api/tracks/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, title, url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error incrementing",
          code: 400,
        };
      }

      return {
        success: true,
        message: "Download Count incremented",
        code: 200,
      };
    } catch (error) {
      return { success: false, message: "Server Error", code: 500 };
    }
  };

  const handleDownload = async (track: Track) => {
    if (!track.downloadable) {
      alert("This track is not available for download");
      return;
    }
    if (!track.audioUrl) {
      alert("No audio file is available for this track.");
      return;
    }
    const link = document.createElement("a");
    link.href = track.audioUrl;
    link.download = `${track.title} - ${track.composer}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const increment = await incrementDownloadCount(
      track.id,
      track.title,
      track.audioUrl,
    );

    if (increment.success) {
      setDownloaded(true);
      alert("Track downloaded!");
    } else {
      alert(increment.message || "Failed to download");
    }
  };

  const handleDownloadCueSheet = (album: Album) => {
    if (album.cueSheet) {
      const link = document.createElement("a");
      link.href = album.cueSheet;
      link.download = `${album.title} - cue sheet.cue`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const togglePlayPause = (track: Track) => {
    if (playingTrackId === track.id) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      setPlayingTrackId(null);
    } else {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      if (!track.audioUrl) {
        alert("No preview available for this track.");
        return;
      }

      const audioUrl = track.audioUrl;

      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setPlayingTrackId(track.id);

      audio
        .play()
        .then(() => {
          incrementPlayCount(track.id, track.title, audioUrl);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setPlayingTrackId(null);
          setCurrentAudio(null);
        });

      audio.onended = () => {
        setPlayingTrackId(null);
        setCurrentAudio(null);
      };
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .alb-root { width:100%; min-height:100vh; background:#fffcf2; }
        .alb-inner { max-width:1200px; margin:0 auto; padding:3rem; }

        /* ── Top bar ── */
        .alb-topbar {
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:1rem;
          padding-bottom:1.5rem; margin-bottom:2rem;
          border-bottom:1px solid #ccc5b9;
        }
        .alb-back {
          font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase; color:#403d39;
          background:none; border:none; cursor:pointer;
          display:inline-flex; align-items:center; gap:.5rem;
          padding:0; transition:color .15s;
        }
        .alb-back:hover { color:#eb5e28; }

        .alb-admin-actions { display:flex; gap:.6rem; }
        .alb-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
          padding:.65rem 1.1rem; cursor:pointer; border:1px solid transparent;
          display:inline-flex; align-items:center; gap:.45rem;
          transition:background .2s, border-color .2s, color .2s, opacity .2s;
        }
        .alb-btn-primary { background:#252422; color:#fffcf2; }
        .alb-btn-primary:hover { background:#eb5e28; }
        .alb-btn-danger { background:none; color:#403d39; border-color:#ccc5b9; }
        .alb-btn-danger:hover { border-color:#eb5e28; color:#eb5e28; }
        .alb-btn-danger:disabled { opacity:.5; cursor:not-allowed; }

        /* ── Album hero ── */
        .alb-hero {
          border:1px solid #ccc5b9; background:#252422;
          display:grid; grid-template-columns:280px 1fr;
          position:relative; margin-bottom:3rem; overflow:hidden;
        }
        .alb-hero::before {
          content:''; position:absolute; top:0; left:0;
          width:3px; height:100%; background:#eb5e28;
        }
        .alb-hero-cover { width:100%; height:100%; min-height:280px; overflow:hidden; background:#403d39; }
        .alb-hero-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .alb-hero-body { padding:2.25rem; display:flex; flex-direction:column; gap:1.25rem; }

        .alb-eyebrow { display:flex; align-items:center; gap:.75rem; }
        .alb-eyebrow-line { width:28px; height:1px; background:#eb5e28; }
        .alb-eyebrow-text {
          font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:600;
          letter-spacing:.18em; text-transform:uppercase; color:#fffcf2; opacity:.5;
        }
        .alb-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:clamp(1.9rem,3.2vw,3rem); letter-spacing:-.02em; line-height:.98;
          text-transform:uppercase; color:#fffcf2;
        }
        .alb-title em { font-style:normal; color:#eb5e28; }

        .alb-pills { display:flex; flex-wrap:wrap; gap:.5rem; }
        .alb-pill {
          font-family:'Manrope',sans-serif; font-size:.62rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          color:#fffcf2; border:1px solid rgba(255,252,242,.25);
          padding:.35rem .75rem;
        }
        .alb-pill.accent { border-color:#eb5e28; color:#eb5e28; }

        .alb-desc {
          font-family:'Manrope',sans-serif; font-size:.9rem; font-weight:400;
          line-height:1.7; color:#fffcf2; opacity:.7; max-width:560px;
        }

        .alb-cue-btn {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
          color:#fffcf2; background:#eb5e28; border:none;
          padding:.75rem 1.4rem; cursor:pointer; align-self:flex-start;
          display:inline-flex; align-items:center; gap:.5rem;
          transition:background .2s;
        }
        .alb-cue-btn:hover { background:#d44c10; }

        /* ── Progress / message banners ── */
        .alb-panel {
          border:1px solid #ccc5b9; background:#fffcf2; margin-bottom:2rem;
        }
        .alb-panel-head {
          padding:1rem 1.5rem; border-bottom:1px solid #ccc5b9;
          font-family:'Syne',sans-serif; font-weight:700; font-size:.8rem;
          letter-spacing:-.01em; text-transform:uppercase; color:#252422;
        }
        .alb-progress-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:.85rem 1.5rem; border-bottom:1px solid #ccc5b9; gap:1rem;
        }
        .alb-progress-row:last-child { border-bottom:none; }
        .alb-progress-name {
          font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:500; color:#403d39;
        }
        .alb-progress-status {
          font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:700;
          letter-spacing:.08em; text-transform:uppercase;
        }
        .alb-progress-status.completed { color:#3f7d4f; }
        .alb-progress-status.error { color:#c1442c; }
        .alb-progress-status.deleting,
        .alb-progress-status.pending { color:#eb5e28; }

        .alb-banner {
          border:1px solid #ccc5b9; border-left:3px solid #eb5e28;
          padding:1rem 1.5rem; margin-bottom:2rem;
          font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:600; color:#252422;
          display:flex; align-items:center; gap:.6rem;
        }
        .alb-banner.success { border-left-color:#3f7d4f; }
        .alb-banner.error { border-left-color:#c1442c; }

        /* ── Tracks section ── */
        .alb-tracks-head {
          display:flex; align-items:baseline; justify-content:space-between;
          gap:1rem; margin-bottom:1.25rem; padding-bottom:1rem;
          border-bottom:1px solid #ccc5b9;
        }
        .alb-tracks-title {
          font-family:'Bricolage Grotesque',sans-serif; font-weight:800;
          font-size:clamp(1.5rem,2.4vw,2.1rem); letter-spacing:-.02em;
          text-transform:uppercase; color:#252422;
        }
        .alb-tracks-count {
          font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; color:#403d39; opacity:.5;
        }
        .alb-tracks-list { display:flex; flex-direction:column; gap:.6rem; }

        /* ── Delete confirm modal ── */
        .alb-modal-overlay {
          position:fixed; inset:0; background:rgba(37,36,34,.6);
          display:flex; align-items:center; justify-content:center;
          z-index:50; padding:1.25rem;
        }
        .alb-modal {
          background:#fffcf2; border:1px solid #ccc5b9; max-width:440px; width:100%;
          position:relative; overflow:hidden;
        }
        .alb-modal::before {
          content:''; position:absolute; top:0; left:0;
          width:100%; height:3px; background:#eb5e28;
        }
        .alb-modal-body { padding:2rem; }
        .alb-modal-close {
          position:absolute; top:1rem; right:1rem; background:none; border:none;
          cursor:pointer; color:#403d39; opacity:.5; transition:opacity .15s;
        }
        .alb-modal-close:hover { opacity:1; }
        .alb-modal-title {
          font-family:'Syne',sans-serif; font-weight:800; font-size:1.15rem;
          letter-spacing:-.01em; text-transform:uppercase; color:#252422; margin-bottom:.85rem;
        }
        .alb-modal-text {
          font-family:'Manrope',sans-serif; font-size:.85rem; color:#403d39; line-height:1.6;
          margin-bottom:1rem;
        }
        .alb-modal-text strong { color:#252422; }
        .alb-modal-list {
          border:1px solid #ccc5b9; padding:1rem 1.25rem; margin-bottom:1.25rem;
          display:flex; flex-direction:column; gap:.55rem;
        }
        .alb-modal-list-item {
          font-family:'Manrope',sans-serif; font-size:.75rem; color:#403d39;
          display:flex; align-items:center; gap:.6rem;
        }
        .alb-modal-list-item::before {
          content:''; width:5px; height:5px; background:#eb5e28; flex-shrink:0;
        }
        .alb-modal-warning {
          border:1px solid #ccc5b9; border-left:3px solid #eb5e28;
          padding:.75rem 1rem; margin-bottom:1.5rem;
          font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:600; color:#252422;
          display:flex; align-items:center; gap:.5rem;
        }
        .alb-modal-actions { display:flex; gap:.75rem; }
        .alb-modal-cancel {
          flex:1; font-family:'Syne',sans-serif; font-weight:700;
          font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
          padding:.8rem; background:none; border:1px solid #ccc5b9; color:#403d39;
          cursor:pointer; transition:border-color .2s, color .2s;
        }
        .alb-modal-cancel:hover { border-color:#eb5e28; color:#eb5e28; }
        .alb-modal-confirm {
          flex:1; font-family:'Syne',sans-serif; font-weight:700;
          font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
          padding:.8rem; background:#eb5e28; border:1px solid #eb5e28; color:#fffcf2;
          cursor:pointer; transition:background .2s;
        }
        .alb-modal-confirm:hover { background:#d44c10; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .alb-inner { padding:1.5rem; }
          .alb-hero { grid-template-columns:1fr; }
          .alb-hero-cover { min-height:220px; }
        }
      `}</style>

      <div className="alb-root">
        <div className="alb-inner">
          {/* Top bar */}
          <div className="alb-topbar">
            <button className="alb-back" onClick={() => router.back()}>
              <ArrowLeft size={14} /> Back
            </button>

            {isAdmin && album && (
              <div className="alb-admin-actions">
                <button
                  className="alb-btn alb-btn-primary"
                  onClick={() => router.push(`/admin/albums/${albumId}/edit`)}
                >
                  <Pencil size={12} /> Edit Album
                </button>
                <button
                  className="alb-btn alb-btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 size={12} />{" "}
                  {isDeleting ? "Deleting..." : "Delete Album"}
                </button>
              </div>
            )}
          </div>

          {/* Album hero */}
          <div className="alb-hero">
            {album.coverImage && (
              <div className="alb-hero-cover">
                <img src={album.coverImage} alt={album.title} />
              </div>
            )}

            <div className="alb-hero-body">
              <div className="alb-eyebrow">
                <span className="alb-eyebrow-line" />
                <span className="alb-eyebrow-text">Album</span>
              </div>

              <h1 className="alb-title">{album.title}</h1>

              <div className="alb-pills">
                {album.category && (
                  <span className="alb-pill">{album.category}</span>
                )}
                {album.genre && (
                  <span className="alb-pill accent">{album.genre}</span>
                )}
              </div>

              <p className="alb-desc">{album.description}</p>

              {isUser && (
                <button
                  className="alb-cue-btn"
                  onClick={() => handleDownloadCueSheet(album)}
                >
                  <FileText size={13} /> Download Cue Sheet
                </button>
              )}
            </div>
          </div>

          {/* Delete Progress */}
          {deleteProgress.length > 0 && (
            <div className="alb-panel">
              <div className="alb-panel-head">Deletion Progress</div>
              {deleteProgress.map((progress, index) => (
                <div key={index} className="alb-progress-row">
                  <span className="alb-progress-name">{progress.fileName}</span>
                  <span className={`alb-progress-status ${progress.status}`}>
                    {progress.status}
                  </span>
                  {progress.error && (
                    <p className="text-red-600 text-xs mt-1">
                      {progress.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Delete Message */}
          {deleteMessage.text && (
            <div className={`alb-banner ${deleteMessage.type}`}>
              {deleteMessage.text}
            </div>
          )}

          {/* Tracks Section */}
          <div>
            <div className="alb-tracks-head">
              <h2 className="alb-tracks-title">Tracks</h2>
              <span className="alb-tracks-count">
                {tracks.length} track{tracks.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="alb-tracks-list">
              {tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  onClick={setSelectedTrack}
                  onPlayClick={togglePlayPause}
                  playingTrackId={playingTrackId}
                  isAdmin={!!isAdmin}
                  isUser={isUser}
                  onDownloadClick={handleDownload}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          </div>

          {/* Track Details Modal */}
          {selectedTrack && (
            <TrackModal
              track={selectedTrack}
              isUser={isUser}
              onClick={setSelectedTrack}
              onFavClick={handleAddToFavorites}
              onDownloadClick={handleDownload}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div
              className="alb-modal-overlay"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div className="alb-modal" onClick={(e) => e.stopPropagation()}>
                <div className="alb-modal-body">
                  <button
                    className="alb-modal-close"
                    onClick={() => setShowDeleteConfirm(false)}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>

                  <h2 className="alb-modal-title">Delete Album</h2>
                  <p className="alb-modal-text">
                    Are you sure you want to delete{" "}
                    <strong>&ldquo;{album?.title}&rdquo;</strong>? This action
                    will:
                  </p>

                  <div className="alb-modal-list">
                    <div className="alb-modal-list-item">
                      Delete all {tracks.length} tracks
                    </div>
                    <div className="alb-modal-list-item">
                      Remove all audio files from storage
                    </div>
                    <div className="alb-modal-list-item">
                      Delete the album cover image
                    </div>
                    <div className="alb-modal-list-item">
                      Remove all database records
                    </div>
                  </div>

                  <div className="alb-modal-warning">
                    <AlertTriangle size={14} /> This action cannot be undone.
                  </div>

                  <div className="alb-modal-actions">
                    <button
                      className="alb-modal-cancel"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="alb-modal-confirm"
                      onClick={handleDeleteAlbum}
                    >
                      Delete Album
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
