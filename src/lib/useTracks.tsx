// hooks/useTracks.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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
const CACHE_KEY = "music_lib_tracks_v2";
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

// ── Cache helpers ────────────────────────────────────────────────────────────

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
    // sessionStorage quota exceeded — silently skip
  }
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmtDuration(raw: unknown): string {
  if (!raw) return "0:00";
  if (typeof raw === "object" && raw !== null && "seconds" in raw) {
    const s = (raw as { seconds: number }).seconds;
    if (s < 0 || s > 3600) return "0:00";
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  if (typeof raw === "number") {
    if (isNaN(raw) || raw < 0) return "0:00";
    return `${Math.floor(raw / 60)}:${String(raw % 60).padStart(2, "0")}`;
  }
  return String(raw);
}

function fmtDate(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "object" && raw !== null && "seconds" in raw) {
    return new Date((raw as { seconds: number }).seconds * 1000)
      .toISOString()
      .split("T")[0];
  }
  if (typeof raw === "string") return new Date(raw).toISOString().split("T")[0];
  return "";
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
      debounce((value: string) => {
        updateURLParams({ search: value, page: "1" });
      }, 350),
    [updateURLParams],
  );

  // ── Fetch + cache ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      // 1. Try cache first
      const cached = readCache();
      if (cached) {
        setAllTracks(cached);
        setLoading(false);
        return;
      }

      // 2. Fetch from Firestore
      try {
        setLoading(true);
        const [tracksSnap, albumsSnap] = await Promise.all([
          getDocs(query(collection(db, "tracks"), orderBy("title", "asc"))),
          getDocs(collection(db, "albums")),
        ]);

        const albumCovers = new Map<string, string>();
        albumsSnap.docs.forEach((d) => {
          const cover = d.data().coverImage;
          if (cover) albumCovers.set(d.id, cover);
        });

        const data: Track[] = tracksSnap.docs.map((d) => {
          const dd = d.data();
          return {
            id: d.id,
            ...dd,
            duration: fmtDuration(dd.duration),
            createdAt: fmtDate(dd.createdAt),
            coverImage: albumCovers.get(dd.albumId) ?? undefined,
          } as Track;
        });

        writeCache(data);
        setAllTracks(data);
      } catch (err) {
        console.error("useTracks fetch error:", err);
        setError("Failed to load tracks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

  // ── Derived lists for filter dropdowns ────────────────────────────────────

  const availableMoods = useMemo(() => {
    const set = new Set<string>();
    allTracks.forEach((t) => {
      if (Array.isArray(t.mood)) t.mood.forEach((m) => set.add(m));
      else if (t.mood) set.add(t.mood);
    });
    return Array.from(set).sort();
  }, [allTracks]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (value: string) => debouncedUpdateSearch(value),
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

  /** Force a fresh fetch (e.g. after an admin upload) */
  const invalidateCache = useCallback(async () => {
    sessionStorage.removeItem(CACHE_KEY);
    setLoading(true);
    try {
      const [tracksSnap, albumsSnap] = await Promise.all([
        getDocs(query(collection(db, "tracks"), orderBy("title", "asc"))),
        getDocs(collection(db, "albums")),
      ]);

      const albumCovers = new Map<string, string>();
      albumsSnap.docs.forEach((d) => {
        const cover = d.data().coverImage;
        if (cover) albumCovers.set(d.id, cover);
      });

      const data: Track[] = tracksSnap.docs.map((d) => {
        const dd = d.data();
        return {
          id: d.id,
          ...dd,
          duration: fmtDuration(dd.duration),
          createdAt: fmtDate(dd.createdAt),
          coverImage: albumCovers.get(dd.albumId) ?? undefined,
        } as Track;
      });

      writeCache(data);
      setAllTracks(data);
    } catch (err) {
      console.error("invalidateCache error:", err);
      setError("Failed to refresh tracks.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    tracks: paginatedTracks,
    loading,
    error,

    // Filters
    search,
    categoryFilter,
    genreFilter,
    moodFilter,

    // Pagination
    currentPage: safePage,
    totalPages,
    totalItems: filteredTracks.length,
    itemsPerPage: ITEMS_PER_PAGE,

    // Dropdown options
    availableMoods,

    // Handlers
    handleSearchChange,
    handleCategoryChange,
    handleGenreChange,
    handleMoodChange,
    handlePageChange,
    clearFilters,
    invalidateCache,
  };
};
