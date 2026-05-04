import Image from "next/image";
import React from "react";
import AlbumCover from "./AlbumCover";

type AlbumCardProps = {
  album: Album;
  onClick: (album: Album) => void;
  active?: boolean;
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


const AlbumCard = ({album, onClick, active = false}: AlbumCardProps) => {
  return (
    <div
      onClick={() => onClick(album)}
      className={`hover cursor-pointer ${active ? "ring-2 ring-orange-600 ring-offset-2 ring-offset-[#fffcf2]" : ""}`}
    >
      <div className="aspect-square relative ">
        <Image
          src={album.coverImage || "/placeholder-album.jpg"}
          alt={album.title}
          fill
          className="object-cover rounded-sm"
          unoptimized
        />
        
      </div>
      <div className="py-2">
        <h2 className="text-md font-semibold mb-1 truncate">{album.title}</h2>
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
