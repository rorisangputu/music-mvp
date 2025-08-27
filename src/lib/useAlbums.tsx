// hooks/useAlbums.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import debounce from 'lodash.debounce';

type Album = {
    id: string;
    title: string;
    description: string;
    category: string;
    coverImage?: string;
    genre?: string;
    releaseDate?: string;
};

type FilterParams = {
    search?: string;
    category?: string;
    genre?: string;
    page?: string;
};

const ITEMS_PER_PAGE = 8;

export const useAlbums = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters from URL
    const search = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || '';
    const genreFilter = searchParams.get('genre') || '';
    const currentPage = parseInt(searchParams.get('page') || '1');

    // Debounced URL update
    const debouncedUpdateSearch = useMemo(() => {
        return debounce((value: string) => {
            updateURLParams({ search: value, page: '1' }); // Reset to page 1 on search
        }, 400);
    }, []);

    // URL parameter management
    const updateURLParams = useCallback((newParams: FilterParams) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.push(`/library?${params.toString()}`);
    }, [searchParams, router]);

    // Fetch albums
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(
                    (doc) => ({ id: doc.id, ...doc.data() }) as Album
                );
                setAlbums(data);
            } catch (err) {
                setError('Failed to fetch albums');
                console.error('Error fetching albums:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    // Filter albums
    const filteredAlbums = useMemo(() => {
        return albums.filter((album) => {
            const matchesSearch = search
                ? album.title.toLowerCase().includes(search.toLowerCase()) ||
                album.description.toLowerCase().includes(search.toLowerCase()) ||
                album.category.toLowerCase().includes(search.toLowerCase()) ||
                (album.genre?.toLowerCase().includes(search.toLowerCase()) ?? false)
                : true;

            const matchesCategory = categoryFilter
                ? album.category.toLowerCase() === categoryFilter.toLowerCase()
                : true;

            const matchesGenre = genreFilter
                ? album.genre?.toLowerCase() === genreFilter.toLowerCase()
                : true;

            return matchesSearch && matchesCategory && matchesGenre;
        });
    }, [albums, search, categoryFilter, genreFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAlbums = filteredAlbums.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handlers
    const handleSearchChange = useCallback((value: string) => {
        debouncedUpdateSearch(value);
    }, [debouncedUpdateSearch]);

    const handleCategoryChange = useCallback((category: string) => {
        updateURLParams({ category, page: '1' });
    }, [updateURLParams]);

    const handleGenreChange = useCallback((genre: string) => {
        updateURLParams({ genre, page: '1' });
    }, [updateURLParams]);

    const handlePageChange = useCallback((page: number) => {
        updateURLParams({ page: page.toString() });
    }, [updateURLParams]);

    const clearFilters = useCallback(() => {
        router.push('/library');
    }, [router]);

    return {
        // Data
        albums: paginatedAlbums,
        loading,
        error,

        // Filters
        search,
        categoryFilter,
        genreFilter,

        // Pagination
        currentPage,
        totalPages,
        totalItems: filteredAlbums.length,
        itemsPerPage: ITEMS_PER_PAGE,

        // Handlers
        handleSearchChange,
        handleCategoryChange,
        handleGenreChange,
        handlePageChange,
        clearFilters,
    };
};