
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tool } from '../src/modules/tools/types/Tool';
import { toolsStorage } from '../src/modules/tools/services/toolsStorage';
import { TOOL_CATEGORIES } from '../src/modules/tools/constants';
import { useAuth } from '../src/context/AuthContext';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';

const Tools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const { hasAccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    toolsStorage.checkAndMigrateTools();
    const allTools = toolsStorage.getTools();
    const activeTools = allTools
      .filter(t => t.isActive)
      .sort((a, b) => a.order - b.order);
    
    setTools(activeTools);
    setSettings(siteSettingsStorage.getSettings());
  }, []);

  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(t => t.category === activeCategory);

  const isToolLocked = (tool: Tool) => {
    if (tool.accessLevel === 'public') return false;
    if (!isAuthenticated) return true;
    if (tool.accessLevel === 'premium' && !hasAccess('premium')) return true;
    return false;
  };

  const handleToolClick = (tool: Tool, e: React.MouseEvent) => {
    e.preventDefault();
    if (isToolLocked(tool)) {
        navigate('/login', { state: { from: { pathname: tool.link } } });
    } else {
        navigate(tool.link);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-500 overflow-x-hidden">
      
      {/* HEADER MONUMENTAL DYNAMIQUE */}
      <section className="relative py-48 px-6 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
            <img src={settings.toolsHeroImage} className="w-full h-full object-cover" alt="Data" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl">
            L'ARSENAL DE PRÉCISION • DZ
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black font-display leading-[0.85] tracking-tighter mb-12">
            La puissance <br/><span className="text-primary italic">appliquée.</span>
          </h1>
          <p className="text-2xl text-slate-400 max-w-2xl font-medium leading-tight border-l-4 border-primary pl-8">
            "Ne subissez plus la gestion. Pilotez-la avec les mêmes outils que les leaders mondiaux."
          </p>
        </div>
      </section>

      {/* FILTRES LUXE */}
      <section className="bg-white dark:bg-slate-950 sticky top-20 z-40 border-b border-slate-100 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4">
          {TOOL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* GRILLE D'OUTILS */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredTools.map((tool, idx) => {
            const locked = isToolLocked(tool);
            
            return (
                <div 
                    key={tool.id}
                    onClick={(e) => tool.type === 'internal' ? handleToolClick(tool, e) : null}
                    className={`group bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:border-primary/20 cursor-pointer flex flex-col h-full ${locked ? 'opacity-80' : ''}`}
                >
                    <div className="flex justify-between items-start mb-10">
                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${locked ? 'bg-slate-100 text-slate-300' : 'bg-primary text-white group-hover:scale-110 group-hover:rotate-3'}`}>
                            <span className="material-symbols-outlined text-4xl">{tool.icon}</span>
                        </div>
                        {tool.accessLevel === 'premium' && (
                            <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Premium</span>
                        )}
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 font-display tracking-tighter leading-none">{tool.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 flex-grow text-lg font-medium leading-relaxed">{tool.description}</p>
                    
                    <div className="mt-auto">
                        <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-4 ${locked ? 'bg-slate-50 text-slate-400 border' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-primary group-hover:text-white group-hover:shadow-xl'}`}>
                            {locked ? <span className="material-symbols-outlined text-sm">lock</span> : <span className="material-symbols-outlined text-sm">bolt</span>}
                            {tool.cta}
                        </button>
                    </div>
                </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER PHOTO RICHE */}
      <section className="py-40 px-6 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
                <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000">
                    <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop" className="w-full h-full object-cover" alt="Elite" />
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
            <div>
                <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-8">SOUVERAINETÉ NUMÉRIQUE</h2>
                <h3 className="text-5xl md:text-7xl font-black font-display mb-10 tracking-tighter leading-none text-slate-900 dark:text-white">Des outils souverains pour des leaders algériens.</h3>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium mb-12 leading-relaxed">
                    Compalik développe ses propres solutions d'ingénierie pour garantir la sécurité totale de vos données et une adaptation parfaite aux spécificités de la Loi de Finances.
                </p>
                <Link to="/contact" className="px-12 py-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl hover:scale-105 transition-all shadow-xl inline-flex items-center gap-4 text-xl">
                    Demander un accès démo
                    <span className="material-symbols-outlined">rocket_launch</span>
                </Link>
            </div>
        </div>
      </section>

      <footer className="py-24 text-center border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
         <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[1em] mb-6">
            COMPALIK TECH ARSENAL • L'EXCELLENCE SANS COMPROMIS
         </p>
      </footer>
    </div>
  );
};

export default Tools;
