// app/albums/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { useMemo } from "react";

const CATEGORIES = ["TV", "Film", "Corporate", "Podcast", "Jingles", "VOD"];
const GENRES = [
  "Cinematic",
  "Jazz",
  "Hip-Hop",
  "Ambient",
  "Electronic",
  "Rock",
];

type Album = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  genre?: string;
};

export default function AlbumsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  const debouncedUpdateSearch = useMemo(() => {
    return debounce((value: string) => {
      updateURLParams({ search: value });
    }, 4000); // 400ms delay
  }, [searchParams]);

  const updateURLParams = (newParams: {
    search?: string;
    category?: string;
    genre?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.search !== undefined) params.set("search", newParams.search);
    if (newParams.category !== undefined)
      params.set("category", newParams.category);
    if (newParams.genre !== undefined) params.set("genre", newParams.genre);

    router.push(`/albums?${params.toString()}`);
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      const querySnapshot = await getDocs(collection(db, "albums"));
      const data = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Album)
      );
      setAlbums(data);
    };

    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(search.toLowerCase()) ||
      album.description.toLowerCase().includes(search.toLowerCase()) ||
      album.category.toLowerCase().includes(search.toLowerCase()) ||
      (album.genre?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesCategory = categoryFilter
      ? album.category.toLowerCase() === categoryFilter.toLowerCase()
      : true;

    const matchesGenre = genreFilter
      ? album.genre?.toLowerCase() === genreFilter.toLowerCase()
      : true;

    return matchesSearch && matchesCategory && matchesGenre;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Music Albums</h1>
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 md:flex-row mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            debouncedUpdateSearch(e.target.value);
          }}
          className="p-2 border rounded w-full md:w-1/3"
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            updateURLParams({ category: e.target.value });
          }}
          className="p-2 border rounded md:w-1/4"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={genreFilter}
          onChange={(e) => {
            setGenreFilter(e.target.value);
            updateURLParams({ genre: e.target.value });
          }}
          className="p-2 border rounded md:w-1/4"
        >
          <option value="">All Genres</option>
          {GENRES.map((genre) => (
            <option key={genre}>{genre}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setCategoryFilter("");
            setGenreFilter("");
            router.push("/albums");
          }}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Clear Filters
        </button>
      </div>

      {/* Album Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAlbums.map((album) => (
          <Link
            key={album.id}
            href={`/albums/${album.id}`}
            className="p-4 border rounded shadow hover:shadow-lg transition"
          >
            <Image
              src={album.coverImage || ""}
              alt={album.title}
              width={400}
              height={400}
            />
            <div>
              <h2 className="text-lg font-semibold">{album.title}</h2>
              <p className="text-sm text-gray-600">{album.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Category: {album.category}{" "}
                {album.genre && `· Genre: ${album.genre}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
