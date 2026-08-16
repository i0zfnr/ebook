import React, { useEffect, useState, useMemo } from 'react';
import { Search, Library as LibraryIcon, X, SlidersHorizontal } from 'lucide-react';
import type { Ebook } from '../types/ebook';
import { ebookService } from '../services/ebookService';
import { BookGrid } from '../components/books/BookGrid';

export const LibraryPage: React.FC = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ebookService.getEbooks();
      setEbooks(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Could not connect to the backend server. Please make sure Laravel is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter & Sort books locally for instantaneous UI responsiveness
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...ebooks];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          (b.author && b.author.toLowerCase().includes(query)) ||
          (b.description && b.description.toLowerCase().includes(query))
      );
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [ebooks, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <LibraryIcon className="h-4 w-4" />
              Digital Catalog
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">E-Book Library</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Browse and read all interactive flipbooks in your personal library.
            </p>
          </div>

          {/* Book count badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, author, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90 pl-10 pr-9 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm dark:shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Newest First</option>
                <option value="oldest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Oldest First</option>
                <option value="title" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        <div className="mt-8">
          <BookGrid
            ebooks={filteredAndSortedBooks}
            loading={loading}
            error={error}
            onRetry={fetchBooks}
            emptyTitle={searchTerm ? 'No books match your search' : 'No e-books uploaded yet'}
            emptyDescription={
              searchTerm
                ? `We couldn't find any books matching "${searchTerm}". Try a different keyword.`
                : 'Upload your first PDF to begin building your interactive digital library.'
            }
          />
        </div>
      </div>
    </div>
  );
};
