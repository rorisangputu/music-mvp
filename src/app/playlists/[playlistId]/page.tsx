// app/playlists/[playlistId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PLAYLIST_CONFIGS } from '@/scripts/palylistConfig';

type TrackMetadata = {
    title: string;
    albumId?: string;
    audioUrl: string;
    bpm?: number;
    category: string;
    composer: string;
    createdAt: string;
    cueSheet?: string;
    downloadable: boolean;
    duration?: number;
    genre?: string;
    mood?: string;
    tags?: string[];
    trackNumber?: number;
    catalogNumber?: string;
};

type Track = {
    id: string;
    albumId: string;
    albumTitle: string;
    albumCover?: string;
    trackData: TrackMetadata;
};

export default function PlaylistPage() {
    const params = useParams();
    const playlistId = params.playlistId as string;
    
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Audio player state
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    // Find the playlist config
    const playlistConfig = PLAYLIST_CONFIGS.find(p => p.id === playlistId);

    useEffect(() => {
        if (!playlistConfig) return;

        const fetchPlaylistTracks = async () => {
            try {
                setLoading(true);
                
                const playlistResponse = await fetch(`/api/playlists/${playlistId}`);
                
                if (!playlistResponse.ok) {
                    setTracks([]);
                    setLoading(false);
                    return;
                }

                const playlistData = await playlistResponse.json();
                const trackIds = playlistData.playlist?.trackIds || [];

                if (trackIds.length === 0) {
                    setTracks([]);
                    setLoading(false);
                    return;
                }

                const trackPromises = trackIds.map(async (trackId: string) => {
                    try {
                        const trackDoc = await getDoc(doc(db, 'tracks', trackId));
                        
                        if (!trackDoc.exists()) {
                            console.warn(`Track ${trackId} not found in Firebase`);
                            return null;
                        }

                        const trackData = trackDoc.data() as TrackMetadata;
                        
                        let albumTitle = 'Unknown Album';
                        let albumCover = undefined;
                        
                        if (trackData.albumId) {
                            try {
                                const albumDoc = await getDoc(doc(db, 'albums', trackData.albumId));
                                if (albumDoc.exists()) {
                                    const albumData = albumDoc.data();
                                    albumTitle = albumData.title || albumTitle;
                                    albumCover = albumData.coverImage;
                                }
                            } catch (albumErr) {
                                console.warn(`Could not fetch album for track ${trackId}`);
                            }
                        }

                        return {
                            id: trackId,
                            albumId: trackData.albumId || '',
                            albumTitle,
                            albumCover,
                            trackData
                        };
                    } catch (err) {
                        console.error(`Error fetching track ${trackId}:`, err);
                        return null;
                    }
                });

                const fetchedTracks = await Promise.all(trackPromises);
                const validTracks = fetchedTracks.filter((track): track is Track => track !== null);
                
                setTracks(validTracks);
                console.log(`Loaded ${validTracks.length} tracks for playlist "${playlistConfig.title}"`);
            } catch (err) {
                setError('Failed to fetch playlist tracks');
                console.error('Error fetching playlist:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistTracks();
    }, [playlistConfig, playlistId]);

    // Audio player effects
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            playNextTrack();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const playTrack = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
            if (audioRef.current) {
                audioRef.current.src = track.trackData.audioUrl;
                audioRef.current.play();
            }
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playNextTrack = () => {
        if (!currentTrack || tracks.length === 0) return;
        
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex]);
    };

    const playPreviousTrack = () => {
        if (!currentTrack || tracks.length === 0) return;
        
        const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
        playTrack(tracks[prevIndex]);
    };

    const seekTo = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatDuration = (duration?: number) => {
        if (!duration || isNaN(duration)) return '0:00';
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!playlistConfig) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Playlist not found</p>
                    <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading playlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto px-4 py-8 bg-white pb-32">
            <audio ref={audioRef} />
            
            {/* Header */}
            <div className="mb-8 w-[90%] mx-auto">
                <Link 
                    href="/" 
                    className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
                >
                    ← Back to Home
                </Link>
                
                <div 
                    className="rounded-lg p-8 mb-6"
                    style={{ backgroundColor: playlistConfig.coverColor || '#6B7280' }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {playlistConfig.title}
                    </h1>
                    <p className="text-white/90 text-lg">
                        {playlistConfig.description}
                    </p>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-600">
                    <span>{tracks.length} tracks</span>
                    <span>•</span>
                    <span>Genres: {playlistConfig.targetGenres.join(', ')}</span>
                </div>
            </div>

            {/* Tracks List */}
            {tracks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg w-[90%] mx-auto">
                    <p className="text-gray-500">No tracks in this playlist yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Add tracks to this playlist from the album pages
                    </p>
                </div>
            ) : (
                <div className="space-y-2 w-[90%] mx-auto">
                    {tracks.map((track, index) => (
                        <div 
                            key={track.id}
                            className={`flex items-center gap-4 p-4 rounded-lg transition-colors group cursor-pointer ${
                                currentTrack?.id === track.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => playTrack(track)}
                        >
                            {/* Track Number / Playing Indicator */}
                            <div className="w-8 text-center text-sm">
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <div className="flex gap-0.5 justify-center items-center">
                                        <div className="w-0.5 h-3 bg-blue-600 animate-pulse"></div>
                                        <div className="w-0.5 h-4 bg-blue-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-0.5 h-3 bg-blue-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">{index + 1}</span>
                                )}
                            </div>

                            {/* Album Cover */}
                            {track.albumCover ? (
                                <img 
                                    src={track.albumCover} 
                                    alt={track.albumTitle}
                                    className="w-12 h-12 object-cover rounded"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">♪</span>
                                </div>
                            )}

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${
                                    currentTrack?.id === track.id ? 'text-blue-600' : 'text-gray-900'
                                }`}>
                                    {track.trackData.title || 'Untitled'}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    {track.albumId ? (
                                        <Link 
                                            href={`/album/${track.albumId}`}
                                            className="text-gray-600 hover:text-blue-600 truncate"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {track.albumTitle}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-600 truncate">
                                            {track.albumTitle}
                                        </span>
                                    )}
                                    {track.trackData.composer && (
                                        <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500 text-xs truncate">
                                                {track.trackData.composer}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {(track.trackData.mood || track.trackData.tags) && (
                                    <div className="flex gap-1 mt-1">
                                        {track.trackData.mood && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {track.trackData.mood}
                                            </span>
                                        )}
                                        {track.trackData.tags && track.trackData.tags.slice(0, 2).map((tag, i) => (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* BPM */}
                            {track.trackData.bpm && (
                                <div className="text-xs text-gray-500">
                                    {track.trackData.bpm} BPM
                                </div>
                            )}

                            {/* Duration */}
                            {track.trackData.duration && (
                                <div className="text-sm text-gray-500">
                                    {formatDuration(track.trackData.duration)}
                                </div>
                            )}

                            {/* Play Button */}
                            <button 
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playTrack(track);
                                }}
                                aria-label="Play track"
                            >
                                {currentTrack?.id === track.id && isPlaying ? '⏸' : '▶'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Fixed Audio Player Bar */}
            {currentTrack && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg border-t border-gray-700">
                    <div className="max-w-screen-2xl mx-auto">
                        {/* Progress Bar */}
                        <div className="relative h-1 bg-gray-700 cursor-pointer group" 
                             onClick={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const x = e.clientX - rect.left;
                                 const percentage = x / rect.width;
                                 seekTo(percentage * duration);
                             }}>
                            <div 
                                className="absolute h-full bg-blue-500 transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            ></div>
                            <div 
                                className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3">
                            {/* Current Track Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {currentTrack.albumCover ? (
                                    <img 
                                        src={currentTrack.albumCover} 
                                        alt={currentTrack.albumTitle}
                                        className="w-14 h-14 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gray-700 rounded flex items-center justify-center">
                                        <span className="text-gray-400">♪</span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{currentTrack.trackData.title}</p>
                                    <p className="text-sm text-gray-400 truncate">{currentTrack.albumTitle}</p>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex flex-col items-center gap-2 flex-1">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={playPreviousTrack}
                                        className="hover:text-blue-400 transition-colors"
                                        aria-label="Previous track"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                                        </svg>
                                    </button>
                                    
                                    <button 
                                        onClick={togglePlayPause}
                                        className="bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform"
                                        aria-label={isPlaying ? 'Pause' : 'Play'}
                                    >
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                    
                                    <button 
                                        onClick={playNextTrack}
                                        className="hover:text-blue-400 transition-colors"
                                        aria-label="Next track"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 18h2V6h-2zm-11-6l8.5-6v12z"/>
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{formatDuration(currentTime)}</span>
                                    <span>/</span>
                                    <span>{formatDuration(duration)}</span>
                                </div>
                            </div>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="hover:text-blue-400 transition-colors"
                                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                        </svg>
                                    )}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        const newVolume = parseFloat(e.target.value);
                                        setVolume(newVolume);
                                        if (newVolume > 0) setIsMuted(false);
                                    }}
                                    className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}