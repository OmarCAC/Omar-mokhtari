
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
        title="Changer le style du site"
      >
        <span className="material-symbols-outlined text-primary">palette</span>
        <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Style : {currentTheme.name.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 animate-fade-in">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Apparence du cabinet</p>
            </div>
            
            <div className="px-2 space-y-1">
              {allThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    currentTheme.id === t.id 
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                      style={{ 
                        backgroundColor: t.colors.primary,
                        borderRadius: t.ui.radius 
                      }}
                    ></div>
                    <div className="text-left">
                      <p className="text-sm font-bold leading-none">{t.name}</p>
                      <p className="text-[10px] opacity-60 mt-1 font-mono">{t.fonts.display}</p>
                    </div>
                  </div>
                  {currentTheme.id === t.id && (
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                <p className="text-[9px] text-slate-400 italic">L'arrondi, les ombres et les polices s'adaptent au style sélectionné.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
