
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';

const About: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    const loadTeam = () => {
      const savedTeam = localStorage.getItem('comptalink_founders');
      if (savedTeam) {
        try {
          setTeam(JSON.parse(savedTeam).filter((f: any) => f.isVisible).sort((a: any, b: any) => a.order - b.order));
        } catch (e) { console.error(e); }
      }
    };
    loadTeam();
    
    const handleUpdate = () => setSettings(siteSettingsStorage.getSettings());
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, []);

  const heroTitle = settings.aboutHeroTitle || "Dominer. Précision.";
  const titleParts = heroTitle.split('.');

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen font-body transition-colors duration-500 overflow-x-hidden font-display">
      
      {/* SECTION 1 : MANIFESTE AVEC LISIBILITÉ OPTIMISÉE */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings.homeHeroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 dark:opacity-20 grayscale blur-[3px] scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white dark:from-slate-950/95 dark:via-slate-950/50 dark:to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.9)_100%)]"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl animate-fade-in">
            L'ÉRE DE LA CONNAISSANCE NUMÉRIQUE • DZ
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black font-display leading-[0.8] tracking-tighter mb-10 text-slate-900 dark:text-white drop-shadow-2xl">
            {titleParts[0]}.<br/>
            <span className="text-primary italic inline-block transform -rotate-1 drop-shadow-xl">{titleParts[1] || 'Précision.'}</span>
          </h1>
          
          <div className="max-w-4xl mx-auto relative mt-12">
             <p className="text-2xl md:text-4xl text-slate-700 dark:text-slate-300 font-medium leading-tight mb-16 italic text-left pl-8 border-l-8 border-primary bg-white/40 dark:bg-transparent p-6 rounded-2xl md:rounded-none backdrop-blur-md md:backdrop-blur-none shadow-2xl md:shadow-none">
               "{settings.aboutVisionSubtitle}"
             </p>
          </div>
        </div>
      </section>

      {/* SECTION DOCTRINE */}
      <section className="py-40 px-4 relative bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
             <img 
               src={settings.aboutHeroSubtitle} 
               alt="Vision" 
               className="rounded-[4rem] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000 border-4 border-white dark:border-slate-800 aspect-[4/5] object-cover"
             />
             <div className="absolute -bottom-10 -right-10 p-12 bg-primary text-white rounded-[3rem] shadow-2xl z-20 hidden md:block border-8 border-white dark:border-slate-900">
                <p className="text-4xl font-black font-display leading-none">99%</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">D'Efficacité Digitale</p>
             </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em]">{settings.aboutVisionTitle}</h2>
            <h3 className="text-4xl md:text-7xl font-black font-display leading-none tracking-tighter">
              {settings.aboutPhilosophyTitle}
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-6">
              "{settings.aboutPhilosophyText}"
            </p>
          </div>
        </div>
      </section>

      {/* PILIERS */}
      <section className="py-40 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.aboutPillars.map((pillar) => (
                <div key={pillar.id} className="group p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] hover:bg-slate-900 dark:hover:bg-primary transition-all duration-500 hover:-translate-y-4 shadow-sm hover:shadow-2xl">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-white/20 transition-all shadow-inner">
                        <span className="material-symbols-outlined text-3xl group-hover:text-white transition-colors">{pillar.icon}</span>
                    </div>
                    <p className="text-[10px] font-black text-primary group-hover:text-white/70 uppercase tracking-widest mb-2">{pillar.tag}</p>
                    <h3 className="text-2xl font-black mb-6 group-hover:text-white transition-colors tracking-tight">{pillar.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed group-hover:text-white/90 transition-colors">{pillar.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default About;
