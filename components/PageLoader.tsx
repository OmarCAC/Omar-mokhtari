
import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-500 font-bold text-sm animate-pulse">Chargement de ComptaLink...</p>
    </div>
  );
};

export default PageLoader;
