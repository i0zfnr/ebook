import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-10 mt-auto transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">FlipBook Platform</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ad-free, self-hosted e-book flipbook reader</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/library" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Library</Link>
            <Link to="/upload" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">Upload</Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Local & Private Storage</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for Readers
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-900 pt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} Self-Hosted E-Book Flipbook Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
