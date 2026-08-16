import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { ebookService, formatBytes } from '../services/ebookService';
import { loadPdfDocument } from '../services/pdfService';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [analyzingPdf, setAnalyzingPdf] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Handle PDF Selection & Auto-detect metadata
  const handlePdfChange = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('PDF file exceeds the 100 MB limit.');
      return;
    }

    setErrorMessage(null);
    setPdfFile(file);

    // Auto-fill title from filename if title is empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Inspect PDF page count
    try {
      setAnalyzingPdf(true);
      const fileUrl = URL.createObjectURL(file);
      const pdf = await loadPdfDocument(fileUrl);
      setTotalPages(pdf.numPages);
      URL.revokeObjectURL(fileUrl);
    } catch {
      // PDF page counting failure can be ignored safely
    } finally {
      setAnalyzingPdf(false);
    }
  };

  // Handle Cover image selection
  const handleCoverChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Cover image must be a JPG, PNG, or WebP file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Cover image exceeds the 10 MB limit.');
      return;
    }

    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const removeCover = () => {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      setErrorMessage('Please upload a PDF document.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a title for your e-book.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (author.trim()) formData.append('author', author.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('pdf', pdfFile);
      if (coverFile) formData.append('cover', coverFile);
      if (totalPages) formData.append('total_pages', String(totalPages));
      formData.append('status', 'published');

      const result = await ebookService.uploadEbook(formData, (progress) => {
        setUploadProgress(progress);
      });

      // Navigate to reader or book details page
      navigate(`/book/${result.slug || result.id}`);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setErrorMessage(
        err.response?.data?.message || 'Failed to upload e-book. Please verify the backend connection.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 transition-colors duration-200">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Publishing Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
            Upload Your E-Book
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Publish your PDF into an interactive, digital flipbook readable on any device.
          </p>
        </div>

        {/* Form Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-2xl backdrop-blur-sm transition-colors">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-300">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-200">Upload Error</p>
                <p className="mt-0.5 text-xs text-red-600/90 dark:text-red-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Upload Dropzone */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                PDF Document <span className="text-blue-600 dark:text-blue-500">*</span>
              </label>

              {!pdfFile ? (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handlePdfChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500/60 dark:hover:bg-slate-900/80 transition-all cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
                    Click to browse or drag and drop your PDF
                  </p>
                  <p className="mt-1 text-xs text-slate-500">PDF up to 100 MB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{pdfFile.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatBytes(pdfFile.size)}</span>
                        {analyzingPdf ? (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Loader2 className="h-3 w-3 animate-spin" /> Counting pages...
                          </span>
                        ) : totalPages ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{totalPages} pages detected</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setTotalPages(undefined);
                      if (pdfInputRef.current) pdfInputRef.current.value = '';
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePdfChange(e.target.files[0]);
                }}
              />
              {fieldErrors.pdf && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fieldErrors.pdf[0]}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Book Title <span className="text-blue-600 dark:text-blue-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Ultimate Guide to Modern Design"
                className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
              {fieldErrors.title && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Author Name <span className="text-slate-500 text-xs font-normal">(Optional)</span>
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
              {fieldErrors.author && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fieldErrors.author[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Description <span className="text-slate-500 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief overview or synopsis of the book..."
                className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-sm"
              />
              {fieldErrors.description && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fieldErrors.description[0]}</p>
              )}
            </div>

            {/* Cover Image Upload (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Custom Cover Image{' '}
                <span className="text-slate-500 text-xs font-normal">
                  (Optional — defaults to PDF first page)
                </span>
              </label>

              {!coverPreview ? (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 hover:border-slate-400 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload custom cover</p>
                    <p className="text-[11px] text-slate-500">JPG, PNG, or WebP up to 10 MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 p-3">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-16 w-12 rounded object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{coverFile?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatBytes(coverFile?.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCover}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCoverChange(e.target.files[0]);
                }}
              />
              {fieldErrors.cover && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{fieldErrors.cover[0]}</p>
              )}
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2 rounded-xl bg-slate-100 dark:bg-slate-950/80 p-4 border border-blue-500/20">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading and processing e-book...
                  </span>
                  <span className="text-slate-900 dark:text-white">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !pdfFile || !title.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.99]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading E-Book...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Publish E-Book Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
