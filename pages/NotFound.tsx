
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
      <div className="w-32 h-32 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-8 animate-bounce">
        <span className="material-symbols-outlined text-6xl">travel_explore</span>
      </div>
      
      <h1 className="text-9xl font-black text-slate-200 leading-none mb-4">404</h1>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Page introuvable</h2>
      
      <p className="text-slate-600 max-w-md mb-8 text-lg">
        Oups ! La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe pas.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/" 
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          Retour à l'accueil
        </Link>
        <Link 
          to="/contact" 
          className="px-8 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Signaler un problème
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
