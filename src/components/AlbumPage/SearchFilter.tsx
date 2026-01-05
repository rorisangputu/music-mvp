// components/SearchFilters.tsx
interface SearchFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearchChange: (value: string) => void;
  categoryFilter: string;
  handleCategoryChange: (value: string) => void;
  genreFilter: string;
  handleGenreChange: (value: string) => void;
  clearFilters: () => void;
  CATEGORIES: string[];
  GENRES: string[];
}

export const SearchFilters = ({
  searchInput,
  setSearchInput,
  handleSearchChange,
  categoryFilter,
  handleCategoryChange,
  genreFilter,
  handleGenreChange,
  clearFilters,
  CATEGORIES,
  GENRES,
}: SearchFiltersProps) => (
  <div className="flex flex-col gap-4 md:flex-row mb-6 items-center">
    <input
      type="text"
      placeholder="Search albums, descriptions, categories, genres..."
      value={searchInput}
      onChange={(e) => {
        setSearchInput(e.target.value);
        handleSearchChange(e.target.value);
      }}
      className="p-2 border rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-orange-500"
    />

    <select
      value={categoryFilter}
      onChange={(e) => handleCategoryChange(e.target.value)}
      className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="">All Categories</option>
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>

    <select
      value={genreFilter}
      onChange={(e) => handleGenreChange(e.target.value)}
      className="p-2 border rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="">All Genres</option>
      {GENRES.map((genre) => (
        <option key={genre} value={genre}>
          {genre}
        </option>
      ))}
    </select>

    <button
      onClick={clearFilters}
      className="text-sm text-white px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
    >
      Clear Filters
    </button>
  </div>
);