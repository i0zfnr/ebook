import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL for Vite and modern browser bundlers
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export interface RenderPageOptions {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  scale?: number;
}

export interface PdfDocumentInfo {
  numPages: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}

/**
 * Load PDF document from URL (with in-memory ArrayBuffer fallback for cross-origin reliability)
 */
export async function loadPdfDocument(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({
      data: typedArray,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    return await loadingTask.promise;
  } catch {
    const loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    return await loadingTask.promise;
  }
}

/**
 * Render a specific page from PDFDocumentProxy to an Ultra-Crisp 3000px Retina image DataURL
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  targetWidth = 3000
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });

  // Render at 3.0x - 4.0x DPI scale for razor-sharp vector text and formulas
  const scale = Math.max(targetWidth / unscaledViewport.width, 3.0);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    throw new Error('Canvas 2D context unavailable');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await (page as any).render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.98);
}

/**
 * Render all pages to high resolution image URLs
 */
export async function renderAllPdfPages(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  targetWidth = 3000,
  onProgress?: (progressPercent: number) => void
): Promise<string[]> {
  const total = pdfDoc.numPages;
  const imageUrls: string[] = [];

  for (let i = 1; i <= total; i++) {
    const imgUrl = await renderPdfPageToDataUrl(pdfDoc, i, targetWidth);
    imageUrls.push(imgUrl);
    if (onProgress) {
      onProgress(Math.round((i / total) * 100));
    }
  }

  return imageUrls;
}

/**
 * Extract first page as image data URL for fallback covers
 */
export async function extractFirstPageThumbnail(
  pdfUrl: string,
  maxWidth = 600
): Promise<string> {
  const pdfDoc = await loadPdfDocument(pdfUrl);
  return renderPdfPageToDataUrl(pdfDoc, 1, maxWidth);
}

export { pdfjsLib };
