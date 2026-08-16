import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import type * as pdfjsLib from 'pdfjs-dist';
import { renderAllPdfPages } from '../../services/pdfService';
import { Loader2 } from 'lucide-react';

interface FlipBookProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  totalPages: number;
  currentPage: number;
  onPageFlip: (page: number) => void;
  zoom?: number;
  spreadMode?: 'auto' | 'single' | 'double';
}

export const FlipBook: React.FC<FlipBookProps> = ({
  pdfDoc,
  totalPages: _totalPages,
  currentPage,
  onPageFlip,
  zoom = 1,
  spreadMode = 'auto',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookMountWrapperRef = useRef<HTMLDivElement | null>(null);
  const pageFlipInstance = useRef<PageFlip | null>(null);
  const onPageFlipRef = useRef(onPageFlip);
  onPageFlipRef.current = onPageFlip;

  const [pageImages, setPageImages] = useState<string[]>([]);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [isRendered, setIsRendered] = useState<boolean>(false);

  const [aspectRatio, setAspectRatio] = useState<number>(0.707);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 850,
  });
  const [isSinglePage, setIsSinglePage] = useState<boolean>(false);

  // 1. Render all PDF pages to Ultra-HD 3000px images
  useEffect(() => {
    let isCancelled = false;
    setIsRendered(false);
    setRenderProgress(0);

    pdfDoc.getPage(1).then((firstPage) => {
      if (isCancelled) return;
      const vp = firstPage.getViewport({ scale: 1 });
      const ratio = vp.width / vp.height;
      if (ratio > 0.3 && ratio < 3) {
        setAspectRatio(ratio);
      }
    }).catch(() => {});

    renderAllPdfPages(pdfDoc, 3000, (percent) => {
      if (!isCancelled) setRenderProgress(percent);
    })
      .then((images) => {
        if (!isCancelled) {
          setPageImages(images);
          setIsRendered(true);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc]);

  // 2. Measure viewport and compute precise pixel-perfect dimensions without canvas margins
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const isMobile = clientWidth < 768;
    const isLandscapeDoc = aspectRatio > 1.15;
    const forceSingle = spreadMode === 'single' || (spreadMode === 'auto' && (isMobile || isLandscapeDoc));
    const forceDouble = spreadMode === 'double' && !isMobile;
    const singleMode = forceDouble ? false : forceSingle;
    setIsSinglePage(singleMode);

    const marginX = isMobile ? 16 : 32;
    const marginY = isMobile ? 16 : 32;
    const maxAvailableWidth = Math.max(clientWidth - marginX, 280);
    const maxAvailableHeight = Math.max(clientHeight - marginY, 320);

    let finalPageWidth: number;
    let finalPageHeight: number;

    if (singleMode) {
      // Single page fills max height, width scales by ratio
      finalPageHeight = maxAvailableHeight;
      finalPageWidth = finalPageHeight * aspectRatio;

      if (finalPageWidth > maxAvailableWidth) {
        finalPageWidth = maxAvailableWidth;
        finalPageHeight = finalPageWidth / aspectRatio;
      }
    } else {
      // 2-page spread: total width is 2 * pageWidth
      finalPageHeight = maxAvailableHeight;
      finalPageWidth = finalPageHeight * aspectRatio;

      if (finalPageWidth * 2 > maxAvailableWidth) {
        finalPageWidth = maxAvailableWidth / 2;
        finalPageHeight = finalPageWidth / aspectRatio;
      }
    }

    setDimensions({
      width: Math.round(finalPageWidth),
      height: Math.round(finalPageHeight),
    });
  }, [aspectRatio, spreadMode]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const initialPageRef = useRef(currentPage);

  // 3. Initialize PageFlip in exact fixed size to avoid any canvas whitespace/pillar
  useEffect(() => {
    if (!isRendered || pageImages.length === 0 || !bookMountWrapperRef.current) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const spreadWidth = dimensions.width * (isSinglePage ? 1 : 2);
    const spreadHeight = dimensions.height;

    // Create fresh mount node with exact book dimensions
    bookMountWrapperRef.current.innerHTML = `
      <div class="book-mount-node" style="width: ${spreadWidth}px; height: ${spreadHeight}px; margin: auto;"></div>
    `;
    const mountNode = bookMountWrapperRef.current.querySelector('.book-mount-node') as HTMLElement;
    if (!mountNode) return;

    const pageFlip = new PageFlip(mountNode, {
      width: dimensions.width,
      height: dimensions.height,
      size: 'fixed',
      minWidth: dimensions.width,
      maxWidth: dimensions.width,
      minHeight: dimensions.height,
      maxHeight: dimensions.height,
      maxShadowOpacity: 0.3,
      showCover: false,
      mobileScrollSupport: false,
      usePortrait: isSinglePage,
      startPage: Math.max(0, initialPageRef.current - 1),
      flippingTime: 550,
      swipeDistance: 20,
      useMouseEvents: true,
      clickEventForward: true,
      drawShadow: true,
    });

    pageFlip.loadFromImages(pageImages);
    pageFlipInstance.current = pageFlip;

    pageFlip.on('flip', (e: any) => {
      const newPage = (e.data as number) + 1;
      onPageFlipRef.current(newPage);
    });

    return () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch {
          // ignore
        }
        pageFlipInstance.current = null;
      }
    };
  }, [isRendered, pageImages, dimensions.width, dimensions.height, isSinglePage]);

  // 4. Turn page when currentPage changes externally
  useEffect(() => {
    if (pageFlipInstance.current && isRendered) {
      const currentInstancePage = pageFlipInstance.current.getCurrentPageIndex() + 1;
      if (currentInstancePage !== currentPage) {
        try {
          pageFlipInstance.current.flip(currentPage - 1);
        } catch {
          // ignore
        }
      }
    }
  }, [currentPage, isRendered]);

  // 5. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pageFlipInstance.current?.flipPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        pageFlipInstance.current?.flipNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-auto p-4 select-none"
    >
      {/* Zoomable FlipBook Stage */}
      <div
        ref={bookMountWrapperRef}
        className="mx-auto flex items-center justify-center rounded-lg shadow-2xl overflow-hidden"
        style={{
          display: isRendered ? 'flex' : 'none',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Loading Screen */}
      {!isRendered && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-md text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-center">
            <h3 className="text-sm font-semibold text-white">Rendering Ultra-HD Flipbook</h3>
            <p className="mt-1 text-xs text-slate-400">
              Processing 3000px retina graphics for crystal clarity ({renderProgress}%)
            </p>
          </div>
          <div className="h-1.5 w-52 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-150"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
