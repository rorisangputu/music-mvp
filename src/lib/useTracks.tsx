// lib/useTracks.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { Track } from "@/types/music";

type FilterParams = {
  search?: string;
  category?: string;
  genre?: string;
  mood?: string;
  page?: string;
};

const ITEMS_PER_PAGE = 20;
const CACHE_KEY = "music_lib_tracks_v3"; // bumped — new data shape from Prisma
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache(): Track[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { tracks, ts } = JSON.parse(raw) as { tracks: Track[]; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return tracks;
  } catch {
    return null;
  }
}

function writeCache(tracks: Track[]) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ tracks, ts: Date.now() }),
    );
  } catch {
    // quota exceeded — skip silently
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useTracks = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── URL filter state ──────────────────────────────────────────────────────

  const search = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";
  const genreFilter = searchParams.get("genre") || "";
  const moodFilter = searchParams.get("mood") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // ── URL helpers ───────────────────────────────────────────────────────────

  const updateURLParams = useCallback(
    (newParams: FilterParams) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`/library?${params.toString()}`);
    },
    [searchParams, router],
  );

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce(
        (value: string) => updateURLParams({ search: value, page: "1" }),
        350,
      ),
    [updateURLParams],
  );

  // ── Fetch from Prisma API route ───────────────────────────────────────────

  const fetchTracks = useCallback(async (): Promise<Track[]> => {
    const res = await fetch("/api/tracks");
    if (!res.ok) throw new Error(`Failed to fetch tracks: ${res.status}`);
    const data = (await res.json()) as { tracks: Track[] };
    return data.tracks;
  }, []);

  useEffect(() => {
    const load = async () => {
      // 1. Try cache first
      const cached = readCache();
      if (cached) {
        setAllTracks(cached);
        setLoading(false);
        return;
      }

      // 2. Fetch from API
      try {
        setLoading(true);
        const tracks = await fetchTracks();
        writeCache(tracks);
        setAllTracks(tracks);
      } catch (err) {
        console.error("useTracks fetch error:", err);
        setError("Failed to load tracks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchTracks]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredTracks = useMemo(() => {
    const q = search.toLowerCase();

    return allTracks.filter((track) => {
      const matchesSearch = q
        ? track.title?.toLowerCase().includes(q) ||
          track.composer?.toLowerCase().includes(q) ||
          track.genre?.toLowerCase().includes(q) ||
          track.category?.toLowerCase().includes(q) ||
          (Array.isArray(track.mood) ? track.mood : []).some((m) =>
            m.toLowerCase().includes(q),
          )
        : true;

      const matchesCategory = categoryFilter
        ? track.category?.toLowerCase() === categoryFilter.toLowerCase()
        : true;

      const matchesGenre = genreFilter
        ? track.genre?.toLowerCase() === genreFilter.toLowerCase()
        : true;

      const matchesMood = moodFilter
        ? (Array.isArray(track.mood) ? track.mood : []).some(
            (m) => m.toLowerCase() === moodFilter.toLowerCase(),
          )
        : true;

      return matchesSearch && matchesCategory && matchesGenre && matchesMood;
    });
  }, [allTracks, search, categoryFilter, genreFilter, moodFilter]);

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTracks.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedTracks = filteredTracks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // ── Derived mood list for filter dropdown ─────────────────────────────────

  const availableMoods = useMemo(() => {
    const set = new Set<string>();
    allTracks.forEach((t) => {
      (Array.isArray(t.mood) ? t.mood : []).forEach((m) => set.add(m));
    });
    return Array.from(set).sort();
  }, [allTracks]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (v: string) => debouncedUpdateSearch(v),
    [debouncedUpdateSearch],
  );
  const handleCategoryChange = useCallback(
    (category: string) => updateURLParams({ category, page: "1" }),
    [updateURLParams],
  );
  const handleGenreChange = useCallback(
    (genre: string) => updateURLParams({ genre, page: "1" }),
    [updateURLParams],
  );
  const handleMoodChange = useCallback(
    (mood: string) => updateURLParams({ mood, page: "1" }),
    [updateURLParams],
  );
  const handlePageChange = useCallback(
    (page: number) => updateURLParams({ page: page.toString() }),
    [updateURLParams],
  );
  const clearFilters = useCallback(() => router.push("/library"), [router]);

  /** Force a fresh fetch — call this after uploading a new album */
  const invalidateCache = useCallback(async () => {
    sessionStorage.removeItem(CACHE_KEY);
    setLoading(true);
    try {
      const tracks = await fetchTracks();
      writeCache(tracks);
      setAllTracks(tracks);
    } catch (err) {
      console.error("invalidateCache error:", err);
      setError("Failed to refresh tracks.");
    } finally {
      setLoading(false);
    }
  }, [fetchTracks]);

  return {
    tracks: paginatedTracks,
    loading,
    error,
    search,
    categoryFilter,
    genreFilter,
    moodFilter,
    currentPage: safePage,
    totalPages,
    totalItems: filteredTracks.length,
    itemsPerPage: ITEMS_PER_PAGE,
    availableMoods,
    handleSearchChange,
    handleCategoryChange,
    handleGenreChange,
    handleMoodChange,
    handlePageChange,
    clearFilters,
    invalidateCache,
  };
};
