import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LayoutGrid,
  BookOpen,
  FileText,
  Columns2,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface ReaderToolbarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleThumbnails: () => void;
  showThumbnails: boolean;
  spreadMode?: 'auto' | 'single' | 'double';
  onToggleSpreadMode?: () => void;
  bookIdOrSlug?: string | number;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onPageChange,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  isFullscreen,
  onToggleThumbnails,
  showThumbnails,
  spreadMode = 'auto',
  onToggleSpreadMode,
  bookIdOrSlug,
}) => {
  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(String(currentPage));
    }
  };

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90 px-4 py-2.5 backdrop-blur-md text-slate-700 dark:text-slate-300 select-none transition-colors duration-200">
      {/* Left: Back Navigation & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={bookIdOrSlug ? `/book/${bookIdOrSlug}` : '/library'}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2 truncate">
          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-500 shrink-0 hidden sm:block" />
          <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={title}>
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Page Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous Page (Left Arrow)"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Direct page jump input */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5 text-xs font-medium">
          <input
            type="text"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={handleInputSubmit}
            className="h-8 w-12 rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900 px-1 text-center text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Page number"
          />
          <span className="text-slate-400 dark:text-slate-500 font-normal">/</span>
          <span className="text-slate-600 dark:text-slate-400 font-semibold">{totalPages || '--'}</span>
        </form>

        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next Page (Right Arrow)"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Zoom Tools, Theme, & Fullscreen */}
      <div className="flex items-center gap-1.5">
        {/* Spread Mode Toggle (Single Page vs Double Page Spread) */}
        {onToggleSpreadMode && (
          <button
            onClick={onToggleSpreadMode}
            className="hidden md:flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title={`View: ${spreadMode === 'single' ? 'Single Page' : spreadMode === 'double' ? 'Two-Page Spread' : 'Auto'}`}
          >
            {spreadMode === 'single' ? (
              <>
                <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Single</span>
              </>
            ) : spreadMode === 'double' ? (
              <>
                <Columns2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>2-Page</span>
              </>
            ) : (
              <>
                <Columns2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Auto</span>
              </>
            )}
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 p-0.5">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              disabled={zoom <= 0.6}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          )}

          {onResetZoom && (
            <button
              onClick={onResetZoom}
              className="px-2 text-[11px] font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
              title="Reset Zoom (100%)"
            >
              {zoomPercentage}%
            </button>
          )}

          {onZoomIn && (
            <button
              onClick={onZoomIn}
              disabled={zoom >= 3.5}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom In (up to 350%)"
              aria-label="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {onResetZoom && zoom !== 1 && (
          <button
            onClick={onResetZoom}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          onClick={onToggleThumbnails}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            showThumbnails
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-600 dark:bg-blue-600/20 dark:border-blue-500/40 dark:text-blue-400'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }`}
          title="Toggle Page Thumbnails"
          aria-label="Toggle Page Thumbnails"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        {/* Theme Toggle in Reader */}
        <ThemeToggle />

        <button
          onClick={onToggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
