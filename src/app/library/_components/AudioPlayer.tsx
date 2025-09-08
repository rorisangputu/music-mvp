import React, { useEffect, useRef, useState } from 'react'

type AudioPlayerProps = {
    src: string;
    className?: string;
}

const AudioPlayer = ({src, className}: AudioPlayerProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [canPlay, setCanPlay] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
        setCanPlay(true);
        setIsLoading(false);
        };

        const handleLoadStart = () => {
        setIsLoading(true);
        };

        const handleLoadedData = () => {
        setIsLoading(false);
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('loadeddata', handleLoadedData);

        return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [src]);


  return (
        <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
            Loading audio...
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        controls
        controlsList="nodownload"
        className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}
        preload="metadata"
      >
        <source src={src} type="audio/mpeg" />
      </audio>
    </div>
  )
}

export default AudioPlayer