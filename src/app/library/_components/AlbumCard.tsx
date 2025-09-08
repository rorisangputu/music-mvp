import Image from "next/image";
import React from "react";

type AlbumCardProps = {
  album: Album;
  onClick: (album: Album) => void;
};

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  genre?: string;
  cueSheet?: string;
  releaseDate?: string;
};


const AlbumCard = ({album, onClick}: AlbumCardProps) => {
  return (
    <div
      onClick={() => onClick(album)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
    >
      <div className="aspect-square relative">
        <Image
          src={album.coverImage || "/placeholder-album.jpg"}
          alt={album.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 truncate">{album.title}</h2>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {album.description}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {album.category}
          </span>
          {album.genre && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {album.genre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
