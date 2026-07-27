// app/library/_components/TrackCard.tsx
import React, { useState, useEffect } from "react";
import { Download, ListPlus, Pause, Play, Check, X } from "lucide-react";
import { PLAYLIST_CONFIGS } from "@/scripts/palylistConfig";

type TrackCardProps = {
  track: Track;
  index: number;
  onClick: (track: Track) => void;
  onPlayClick: (track: Track) => void;
  playingTrackId: string | null;
  isAdmin?: boolean;
  isUser?: boolean | null;
  onDownloadClick?: (track: Track) => void;
  onAddToPlaylist?: (trackId: string, playlistId: string) => Promise<void>;
};

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

type ExistingPlaylist = {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  trackCount: number;
};

const TrackCard = ({
  track,
  index,
  onClick,
  onPlayClick,
  playingTrackId,
  isAdmin = false,
  isUser = false,
  onDownloadClick,
  onAddToPlaylist,
}: TrackCardProps) => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [existingPlaylists, setExistingPlaylists] = useState<
    ExistingPlaylist[]
  >([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Fetch existing playlists when dropdown opens
  useEffect(() => {
    if (showPlaylistSelector && isAdmin) {
      fetchExistingPlaylists();
    }
  }, [showPlaylistSelector, isAdmin]);

  const fetchExistingPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await fetch("/api/playlists/list");
      if (response.ok) {
        const data = await response.json();
        setExistingPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!onAddToPlaylist) return;

    setIsAdding(true);
    setAddedMessage("");

    try {
      await onAddToPlaylist(track.id, playlistId);

      const playlist = PLAYLIST_CONFIGS.find((p) => p.id === playlistId);
      setAddedMessage(`success:Added to ${playlist?.title || "playlist"}`);

      // Refresh playlist list to show updated track counts
      await fetchExistingPlaylists();

      setTimeout(() => {
        setShowPlaylistSelector(false);
        setAddedMessage("");
      }, 2000);
    } catch (error) {
      setAddedMessage("error:Failed to add to playlist");
      console.error("Error adding to playlist:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Merge existing playlists with config playlists
  const allPlaylists = PLAYLIST_CONFIGS.map((config) => {
    const existing = existingPlaylists.find((p) => p.id === config.id);
    return {
      ...config,
      trackCount: existing?.trackCount || 0,
      exists: !!existing,
    };
  });
  const isLoggedOut = !isUser && !isAdmin;
  const isPlaying = playingTrackId === track.id;
  const messageIsSuccess = addedMessage.startsWith("success:");
  const messageText = addedMessage.split(":")[1] || "";

  const handleSignUpForDownload = () => {
    window.location.href = "/signup";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        .tc-row {
          border: 1px solid #ccc5b9; background: #fffcf2;
          position: relative; overflow: visible;
          display: flex; align-items: center; gap: 1.25rem;
          padding: 1rem 1.25rem; transition: background 0.15s;
        }
        .tc-row:hover { background: #f9f6ef; }
        .tc-row.playing { background: #fff5f0; }
        .tc-row::before {
          content: ''; position: absolute; left: 0; top: 0;
          width: 3px; height: 100%; background: #eb5e28;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .tc-row:hover::before, .tc-row.playing::before { transform: scaleY(1); }

        .tc-index {
          font-family: 'Manrope', sans-serif; font-size: 0.7rem; font-weight: 700;
          color: #403d39; opacity: 0.35; width: 22px; flex-shrink: 0; text-align: center;
        }

        .tc-play {
          width: 38px; height: 38px; flex-shrink: 0;
          background: #252422; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fffcf2; transition: background 0.2s;
        }
        .tc-play:hover { background: #eb5e28; }

        .tc-meta { flex: 1; min-width: 0; }
        .tc-title {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
          letter-spacing: -0.01em; text-transform: uppercase; color: #252422;
          line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tc-sub {
          font-family: 'Manrope', sans-serif; font-size: 0.72rem; color: #403d39;
          opacity: 0.5; margin-top: 0.2rem;
        }
        .tc-sub strong { font-weight: 600; opacity: 1; color: #252422; }

        .tc-tags { display: flex; gap: 0.4rem; flex-shrink: 0; }
        .tc-tag {
          font-family: 'Manrope', sans-serif; font-size: 0.58rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; color: #403d39;
          border: 1px solid #ccc5b9; padding: 0.25rem 0.55rem; white-space: nowrap;
        }
        .tc-tag.accent { border-color: #eb5e28; color: #eb5e28; }

        .tc-actions { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; flex-wrap: wrap; }

        .tc-btn {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.66rem;
          letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
          padding: 0.6rem 1.1rem; border: 1px solid transparent;
          display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .tc-btn-primary { background: #eb5e28; color: #fffcf2; }
        .tc-btn-primary:hover { background: #d44c10; }
        .tc-btn-ghost { background: none; border-color: #ccc5b9; color: #403d39; }
        .tc-btn-ghost:hover { border-color: #eb5e28; color: #eb5e28; }
        .tc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tc-playlist-wrap { position: relative; }
        .tc-backdrop { position: fixed; inset: 0; z-index: 30; }

        .tc-dropdown {
          position: absolute; right: 0; top: calc(100% + 0.5rem);
          width: 300px; background: #fffcf2; border: 1px solid #ccc5b9;
          z-index: 40; max-height: 22rem; overflow-y: auto;
        }
        .tc-dropdown-head {
          padding: 0.9rem 1.1rem; border-bottom: 1px solid #ccc5b9; background: #f5f0e8;
        }
        .tc-dropdown-title {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.72rem;
          letter-spacing: 0.04em; text-transform: uppercase; color: #252422;
        }
        .tc-dropdown-hint {
          font-family: 'Manrope', sans-serif; font-size: 0.65rem; color: #403d39;
          opacity: 0.5; margin-top: 0.25rem;
        }
        .tc-dropdown-msg {
          margin: 0.75rem 0.9rem 0; padding: 0.55rem; text-align: center;
          font-family: 'Manrope', sans-serif; font-size: 0.72rem; font-weight: 600;
          border: 1px solid #ccc5b9; border-left: 3px solid #eb5e28; color: #252422;
        }
        .tc-dropdown-loading {
          padding: 2rem; text-align: center;
        }
        .tc-spinner {
          width: 22px; height: 22px; border: 2px solid rgba(235,94,40,0.15);
          border-top-color: #eb5e28; border-radius: 50%;
          animation: tc-spin 0.8s linear infinite; margin: 0 auto;
        }
        @keyframes tc-spin { to { transform: rotate(360deg); } }
        .tc-dropdown-loading-text {
          font-family: 'Manrope', sans-serif; font-size: 0.72rem; color: #403d39;
          opacity: 0.5; margin-top: 0.6rem;
        }

        .tc-playlist-item {
          width: 100%; padding: 0.75rem 1.1rem; text-align: left; background: none;
          border: none; border-bottom: 1px solid #ccc5b9; cursor: pointer;
          display: flex; align-items: flex-start; gap: 0.75rem; transition: background 0.15s;
        }
        .tc-playlist-item:last-child { border-bottom: none; }
        .tc-playlist-item:hover { background: #f9f6ef; }
        .tc-playlist-item:disabled { opacity: 0.5; cursor: not-allowed; }
        .tc-playlist-swatch { width: 34px; height: 34px; flex-shrink: 0; }
        .tc-playlist-info { flex: 1; min-width: 0; }
        .tc-playlist-name-row { display: flex; align-items: center; gap: 0.5rem; }
        .tc-playlist-name {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.72rem;
          text-transform: uppercase; letter-spacing: -0.01em; color: #252422;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tc-playlist-new {
          font-family: 'Manrope', sans-serif; font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: #eb5e28;
          border: 1px solid #eb5e28; padding: 0.1rem 0.35rem; flex-shrink: 0;
        }
        .tc-playlist-desc {
          font-family: 'Manrope', sans-serif; font-size: 0.66rem; color: #403d39;
          opacity: 0.55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-top: 0.1rem;
        }
        .tc-playlist-count {
          font-family: 'Manrope', sans-serif; font-size: 0.62rem; color: #403d39;
          opacity: 0.4; margin-top: 0.15rem;
        }

        @media (max-width: 768px) {
          .tc-row { flex-wrap: wrap; gap: 0.75rem 1rem; }
          .tc-tags { display: none; }
          .tc-actions { width: 100%; }
          .tc-btn { flex: 1; justify-content: center; }
        }
      `}</style>

      <div className={`tc-row${isPlaying ? " playing" : ""}`}>
        <span className="tc-index">{index + 1}</span>

        <button
          className="tc-play"
          onClick={() => onPlayClick(track)}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={15} />
          ) : (
            <Play size={15} style={{ marginLeft: 2 }} />
          )}
        </button>

        <div className="tc-meta">
          <div className="tc-title">{track.title}</div>
          <div className="tc-sub">
            By <strong>{track.composer}</strong> · {track.duration}
          </div>
        </div>

        <div className="tc-tags">
          {track.category && <span className="tc-tag">{track.category}</span>}
          {track.genre && <span className="tc-tag accent">{track.genre}</span>}
        </div>

        <div className="tc-actions">
          <button
            className="tc-btn tc-btn-primary"
            onClick={() => onClick(track)}
          >
            View Options
          </button>

          {isUser && track.downloadable && onDownloadClick && (
            <button
              className="tc-btn tc-btn-ghost"
              onClick={() => onDownloadClick(track)}
            >
              <Download size={12} />
              Download
            </button>
          )}

          {isLoggedOut && (
            <button
              className="tc-btn tc-btn-ghost"
              onClick={handleSignUpForDownload}
            >
              <Download size={12} />
              Sign Up to Download
            </button>
          )}

          {isAdmin && (
            <div className="tc-playlist-wrap">
              <button
                className="tc-btn tc-btn-ghost"
                onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
                disabled={isAdding}
              >
                <ListPlus size={12} />
                Add to Playlist
              </button>

              {showPlaylistSelector && (
                <>
                  <div
                    className="tc-backdrop"
                    onClick={() => setShowPlaylistSelector(false)}
                  />

                  <div className="tc-dropdown">
                    <div className="tc-dropdown-head">
                      <div className="tc-dropdown-title">Select a Playlist</div>
                      <div className="tc-dropdown-hint">
                        Playlist will be created if it doesn&rsquo;t exist
                      </div>
                    </div>

                    {addedMessage && (
                      <div className="tc-dropdown-msg">
                        {messageIsSuccess ? (
                          <Check
                            size={12}
                            style={{ display: "inline", marginRight: 4 }}
                          />
                        ) : (
                          <X
                            size={12}
                            style={{ display: "inline", marginRight: 4 }}
                          />
                        )}
                        {messageText}
                      </div>
                    )}

                    {loadingPlaylists ? (
                      <div className="tc-dropdown-loading">
                        <div className="tc-spinner" />
                        <p className="tc-dropdown-loading-text">
                          Loading playlists...
                        </p>
                      </div>
                    ) : (
                      <div>
                        {allPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            className="tc-playlist-item"
                            onClick={() => handleAddToPlaylist(playlist.id)}
                            disabled={isAdding}
                          >
                            <div
                              className="tc-playlist-swatch"
                              style={{ backgroundColor: playlist.coverColor }}
                            />
                            <div className="tc-playlist-info">
                              <div className="tc-playlist-name-row">
                                <span className="tc-playlist-name">
                                  {playlist.title}
                                </span>
                                {!playlist.exists && (
                                  <span className="tc-playlist-new">New</span>
                                )}
                              </div>
                              <div className="tc-playlist-desc">
                                {playlist.description}
                              </div>
                              <div className="tc-playlist-count">
                                {playlist.trackCount}{" "}
                                {playlist.trackCount === 1 ? "track" : "tracks"}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackCard;
