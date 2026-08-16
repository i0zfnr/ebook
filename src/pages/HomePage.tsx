import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  UploadCloud,
  Sparkles,
  Layers,
  Smartphone,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import type { Ebook } from '../types/ebook';
import { ebookService } from '../services/ebookService';
import { BookGrid } from '../components/books/BookGrid';

export const HomePage: React.FC = () => {
  const [recentBooks, setRecentBooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    ebookService
      .getEbooks()
      .then((data) => {
        setRecentBooks(data.slice(0, 5));
      })
      .catch(() => {
        // Handled gracefully in grid
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const features = [
    {
      icon: Layers,
      title: 'Realistic 3D Page Flip',
      description: 'Experience natural book simulation with fluid page-turning physics and authentic shadow depth.',
    },
    {
      icon: ShieldCheck,
      title: '100% Ad-Free & Self-Hosted',
      description: 'Zero third-party trackers or distracting advertisements. Your library remains completely private.',
    },
    {
      icon: Smartphone,
      title: 'Responsive & Mobile Ready',
      description: 'Two-page spread on desktop and smart single-page reading on tablets and smartphones.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-20 sm:py-28">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Modern Digital Publishing Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
            Read. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Flip.</span> Discover.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed">
            Turn static PDF documents into interactive, tactile flipbooks. Upload, organize, and immerse yourself in digital reading on any device.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/library"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              Browse Library
            </Link>
            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 active:scale-95"
            >
              <UploadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Upload E-Book
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-900/40 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 mb-4 border border-blue-500/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Uploaded Books */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recently Added Books</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Explore latest additions to the library</p>
            </div>
            <Link
              to="/library"
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View All Books
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <BookGrid
            ebooks={recentBooks}
            loading={loading}
            emptyTitle="Your library is waiting"
            emptyDescription="Upload your first PDF e-book and experience realistic page-flipping instantly."
          />
        </div>
      </section>
    </div>
  );
};
