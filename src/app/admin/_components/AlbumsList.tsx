"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

type Album = {
  id: string;
  title: string;
  releaseDate: string;
  coverImage?: string;
  genre?: string;
};

const ITEMS_PER_PAGE = 6;

const AlbumsList = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "albums"));
        const albums = querySnapshot.docs.map((doc) => {
          const { title, coverImage, releaseDate, genre } = doc.data();
          return {
            id: doc.id,
            title,
            coverImage,
            releaseDate,
            genre,
          };
        });
        setAlbums(albums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(albums.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedAlbums = useMemo(() => {
    return albums.slice(startIndex, endIndex);
  }, [albums, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Loading albums...</div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-500">No albums found.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Albums Count & Page Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          {/* Showing {startIndex + 1}-{Math.min(endIndex, albums.length)} of {albums.length} albums */}
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Albums Grid */}
      <div className="flex flex-col gap-4 mb-8">
        {paginatedAlbums.map((album) => (
          <div
            key={album.id}
            className="flex gap-4 border p-4 rounded shadow w-full justify-between items-start hover:shadow-md transition-shadow"
          >
            {album.coverImage && (
              <div className="flex-shrink-0">
                <Image
                  src={album.coverImage}
                  alt={album.title}
                  width={100}
                  height={100}
                  className="rounded object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex-1">
              <h2 className="font-semibold text-lg">{album.title}</h2>
              <p className="text-sm text-gray-600">{album.releaseDate}</p>
              {album.genre && <p className="text-sm italic text-gray-500">{album.genre}</p>}

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/albums/${album.id}`}
                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  View
                </Link>
                <Link
                  href={`/admin/albums/${album.id}/edit`}
                  className="px-4 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center space-x-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex">
              {getVisiblePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${currentPage === page
                        ? 'bg-blue-50 text-blue-600 border-blue-500 z-10'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-500'
                        }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
            >
              Next
            </button>
          </div>

          {/* Mobile-friendly page selector */}
          <div className="flex md:hidden items-center space-x-2">
            <span className="text-sm text-gray-700">Go to page:</span>
            <select
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="block w-16 px-3 py-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumsList;