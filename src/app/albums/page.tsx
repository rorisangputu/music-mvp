// app/albums/page.tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAlbums } from "@/lib/useAlbums";
import { CATEGORIES, GENRES } from "@/types/music";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlbumsPage />
    </Suspense>
  );
}

const AlbumsPage = () => {
  const {
    albums,
    loading,
    error,
    search,
    categoryFilter,
    genreFilter,
    currentPage,
    totalPages,
    totalItems,
    handleSearchChange,
    handleCategoryChange,
    handleGenreChange,
    handlePageChange,
    clearFilters,
  } = useAlbums();

  const [searchInput, setSearchInput] = useState(search);

  if (loading) return <div className="flex justify-center py-10">Loading albums...</div>;
  if (error) return <div className="flex justify-center py-10 text-red-500">{error}</div>;

  return (
    <div className="w-full bg-gray-50 py-10 min-h-screen">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Album Library</h1>
          <p className="text-sm text-gray-600">
            {totalItems} album{totalItems !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 md:flex-row mb-6 items-center">
          <input
            type="text"
            placeholder="Search albums, descriptions, categories, genres..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearchChange(e.target.value);
            }}
            className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={genreFilter}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="text-sm text-white px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Results Info */}
        {(search || categoryFilter || genreFilter) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Showing {albums.length} of {totalItems} results
              {search && ` for "${search}"`}
              {categoryFilter && ` in category "${categoryFilter}"`}
              {genreFilter && ` with genre "${genreFilter}"`}
            </p>
          </div>
        )}

        {/* Album Grid */}
        {albums.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/albums/${album.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
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
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{album.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">{album.category}</span>
                    {album.genre && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{album.genre}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No albums found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded bg-white border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis for gaps
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded border ${page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded bg-white border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
    </div>
  );
};