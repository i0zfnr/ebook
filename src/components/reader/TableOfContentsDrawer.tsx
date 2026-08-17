import React, { useState } from 'react';
import { X, Bookmark, BookmarkCheck, List, Plus, Trash2 } from 'lucide-react';
import type { PdfOutlineItem, BookmarkItem } from '../../services/pdfService';

interface TableOfContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  outline: PdfOutlineItem[];
  currentPage: number;
  onSelectPage: (page: number) => void;
  bookmarks: BookmarkItem[];
  onToggleBookmark: (page: number) => void;
}

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  isOpen,
  onClose,
  outline,
  currentPage,
  onSelectPage,
  bookmarks,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');
  const isCurrentBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 sm:w-96 flex-col liquid-nav shadow-2xl transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 p-1 rounded-xl liquid-glass text-xs font-mono-code font-bold">
          <button
            onClick={() => setActiveTab('toc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'toc'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Contents ({outline.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          aria-label="Close drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === 'toc' ? (
          /* Table of Contents Tab */
          outline.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-[#94a3b8]">
              <p>No table of contents found in this document.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {outline.map((item, idx) => {
                const isActive = currentPage === item.pageNumber;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectPage(item.pageNumber);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'liquid-glass border-violet-500/50 text-violet-700 dark:text-[#c4b5fd] font-bold shadow-md'
                        : 'hover:bg-white/40 dark:hover:bg-white/5 text-slate-700 dark:text-[#f8fafc]'
                    }`}
                  >
                    <span className="text-xs truncate pr-2">{item.title}</span>
                    <span className="liquid-pill text-[10px] py-0.5 px-2 font-mono-code shrink-0">
                      p. {item.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* Bookmarks Tab */
          <div className="space-y-3">
            {/* Quick Add Bookmark for Current Page */}
            <button
              onClick={() => onToggleBookmark(currentPage)}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
                isCurrentBookmarked
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                  : 'liquid-btn-primary shadow-md'
              }`}
            >
              {isCurrentBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Remove Bookmark (Page {currentPage})</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Bookmark Current Page ({currentPage})</span>
                </>
              )}
            </button>

            {bookmarks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-[#94a3b8]">
                <Bookmark className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p>No bookmarks yet.</p>
                <p className="mt-1 text-[11px] opacity-70">Tap "Bookmark Current Page" to save important spots.</p>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="liquid-glass flex items-center justify-between p-3 rounded-2xl shadow-sm"
                  >
                    <button
                      onClick={() => {
                        onSelectPage(bm.pageNumber);
                        onClose();
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-[#f8fafc]">
                        Page {bm.pageNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94a3b8] truncate mt-0.5">
                        {bm.note}
                      </p>
                    </button>
                    <button
                      onClick={() => onToggleBookmark(bm.pageNumber)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-2"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
