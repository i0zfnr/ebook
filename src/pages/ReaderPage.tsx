import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type * as pdfjsLib from 'pdfjs-dist';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import type { Ebook } from '../types/ebook';
import { ebookService } from '../services/ebookService';
import { loadPdfDocument } from '../services/pdfService';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { FlipBook } from '../components/reader/FlipBook';
import { ThumbnailSidebar } from '../components/reader/ThumbnailSidebar';

export const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const readerContainerRef = useRef<HTMLDivElement | null>(null);

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgressText, setLoadingProgressText] = useState<string>('Fetching e-book details...');
  const [error, setError] = useState<string | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [spreadMode, setSpreadMode] = useState<'auto' | 'single' | 'double'>('auto');

  // 1. Fetch Ebook details and load PDF document
  useEffect(() => {
    if (!id) return;
    let isCancelled = false;

    setLoading(true);
    setError(null);
    setLoadingProgressText('Fetching e-book details...');

    ebookService
      .getEbook(id)
      .then(async (book) => {
        if (isCancelled) return;
        setEbook(book);
        setLoadingProgressText('Loading PDF document...');

        try {
          const doc = await loadPdfDocument(book.pdf_url);
          if (isCancelled) return;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
        } catch {
          if (isCancelled) return;
          setError(
            'Failed to parse PDF document. The file might be corrupted or cross-origin blocked.'
          );
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isCancelled) return;
        setError(err.response?.data?.message || 'E-Book not found');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // 2. Fullscreen toggle & change detection
  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;

    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 3. Expanded Zoom controls (0.5x to 3.5x)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(parseFloat((prev + 0.25).toFixed(2)), 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(parseFloat((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Toggle between auto -> single -> double
  const handleToggleSpreadMode = () => {
    setSpreadMode((prev) => {
      if (prev === 'auto') return 'single';
      if (prev === 'single') return 'double';
      return 'auto';
    });
  };

  // 4. Ctrl + Wheel Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <div className="text-center">
            <h3 className="text-base font-semibold text-white">Opening Flipbook</h3>
            <p className="mt-1 text-xs text-slate-400">{loadingProgressText}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Failed to Load Reader</h2>
        <p className="mt-1 text-sm text-slate-400 max-w-md">{error}</p>
        <Link
          to="/library"
          className="mt-6 flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={readerContainerRef}
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 select-none transition-colors duration-200"
    >
      {/* Top Reader Toolbar */}
      <ReaderToolbar
        title={ebook.title}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onPageChange={(p) => setCurrentPage(p)}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
        showThumbnails={showThumbnails}
        spreadMode={spreadMode}
        onToggleSpreadMode={handleToggleSpreadMode}
        bookIdOrSlug={ebook.slug || ebook.id}
      />

      {/* Main Reading Stage with Zoom & Scroll Pan Support */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-slate-200/60 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 transition-colors duration-200">
        {pdfDoc && (
          <FlipBook
            pdfDoc={pdfDoc}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageFlip={(page) => setCurrentPage(page)}
            zoom={zoom}
            spreadMode={spreadMode}
          />
        )}

        {/* Thumbnail Sidebar Drawer */}
        <ThumbnailSidebar
          pdfDoc={pdfDoc}
          totalPages={totalPages}
          currentPage={currentPage}
          isOpen={showThumbnails}
          onClose={() => setShowThumbnails(false)}
          onSelectPage={(pageNum) => {
            setCurrentPage(pageNum);
            setShowThumbnails(false);
          }}
        />
      </div>
    </div>
  );
};
