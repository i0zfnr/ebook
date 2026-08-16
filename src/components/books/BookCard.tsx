import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Info, FileText } from 'lucide-react';
import type { Ebook } from '../../types/ebook';
import { BookCover } from './BookCover';
import { formatBytes } from '../../services/ebookService';

interface BookCardProps {
  ebook: Ebook;
}

export const BookCard: React.FC<BookCardProps> = ({ ebook }) => {
  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:shadow-blue-500/5">
      {/* Cover Image with Link to Reader */}
      <Link to={`/read/${ebook.slug || ebook.id}`} className="relative block overflow-hidden rounded-lg">
        <BookCover
          coverUrl={ebook.cover_url}
          pdfUrl={ebook.pdf_url}
          title={ebook.title}
          author={ebook.author}
        />
        {/* Hover Read Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <BookOpen className="h-4 w-4" />
            Open Flipbook
          </span>
        </div>
      </Link>

      {/* Book Metadata */}
      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          <span className="flex items-center gap-1 font-medium">
            <FileText className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            {ebook.total_pages ? `${ebook.total_pages} Pages` : 'PDF E-Book'}
          </span>
          <span>{formatBytes(ebook.file_size)}</span>
        </div>

        <Link
          to={`/book/${ebook.slug || ebook.id}`}
          className="line-clamp-1 text-base font-semibold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400 transition-colors"
          title={ebook.title}
        >
          {ebook.title}
        </Link>

        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {ebook.author ? `By ${ebook.author}` : 'Unknown Author'}
        </p>

        {ebook.description && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
            {ebook.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to={`/read/${ebook.slug || ebook.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-2 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-600/15 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-150"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Read
          </Link>
          <Link
            to={`/book/${ebook.slug || ebook.id}`}
            className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors duration-150"
            title="Book Details"
            aria-label="Book Details"
          >
            <Info className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
