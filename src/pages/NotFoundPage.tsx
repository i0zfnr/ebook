import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 mb-6 border border-blue-500/20">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="text-5xl font-extrabold text-white">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-200">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        The page or e-book you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
      >
        <Home className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
};
