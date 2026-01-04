
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';
import { BlogService } from '../services/blogService';
import { servicesStorage } from '../src/modules/services/services/servicesStorage';
import { BlogPost } from '../types';
import { Service } from '../src/modules/services/types/Service';

const DEFAULT_FOUNDERS = [
  {
    id: 1,
    name: "Amina Kaddour",
    role: "Fondatrice & Expert-Comptable",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDkAFHV3zPhQ5dtqa0MDnE-lQfZq6IR8GY9g7JkIfp4LTOoGrLMlLl1vfxS7e6CTamN9faIX8DT5NdLVqUWrVIjOJeq8lP8ciSBmO4HhhaendOIQokVPxv7mAO8jLfrjJjAng1yagXPbZSBFqw032rGBYn68Whh0uaR3YNHAABLQdYasBqSu1d19MLwuOsYYFoqsmdBn0cRW0jXrssSkjMF4Ar0Z8uWkeLYLRbN6wb4kMLrb_Am4lRxhf3Y6lIdOWvuA8om0QGNjy",
    isVisible: true,
    order: 1
  },
  {
    id: 2,
    name: "Yacine Benali",
    role: "Directeur Stratégie",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK3dQr-hbfUsTKyEzsb8kSRqHRpq4DnPB10ORmlg4g-lIPXotvkAoBV_-ZpvB1oyofZdXf0QzPrr-E83d6XCNG_xdXf-Nh0j0J7XnfO8RED9PvBr3G-G2plkW7PP9Owes25dW4-RX2ekaIUe-BQAInTviKS9_PZIHk0c4Xjlh18sCPqRhBVgx8VTrIr42M_rDBJIA8GSXbf-1DKyYgGBfumUaJEB9ZCJyfhOeU_qoyyC6vVyjVVJHqbEW9eB58SlMFxXsM3SZwwu8g",
    isVisible: true,
    order: 2
  }
];

const Home: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [activeServices, setActiveServices] = useState<Service[]>([]);
  const [founders, setFounders] = useState<any[]>([]);

  const loadData = async () => {
      // Charger les services
      const svcs = await servicesStorage.getServices();
      setActiveServices(svcs.filter(s => s.isActive).slice(0, 4));
      
      // Charger l'équipe complète
      const savedTeam = localStorage.getItem('comptalink_founders');
      if (savedTeam) {
          try {
              const parsed = JSON.parse(savedTeam)
                  .filter((f: any) => f.isVisible)
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
              setFounders(parsed.length > 0 ? parsed : DEFAULT_FOUNDERS);
          } catch (e) {
              setFounders(DEFAULT_FOUNDERS);
          }
      } else {
          setFounders(DEFAULT_FOUNDERS);
      }
  };

  useEffect(() => {
    loadData();
    
    const handleUpdate = () => {
        setSettings(siteSettingsStorage.getSettings());
        loadData();
    };

    window.addEventListener('site-settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
        window.removeEventListener('site-settings-updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const heroTitle = settings.homeHeroTitle || "Bâtir. Puissance.";
  const titleParts = heroTitle.split('.');

  return (
    <div className="flex flex-col bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden font-display">
      
      {/* SECTION 1 : HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings.homeHeroImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-40 dark:opacity-30 grayscale blur-[2px] scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white dark:from-slate-950/95 dark:via-slate-950/60 dark:to-slate-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)]"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl border border-white/10 animate-fade-in">
            L'EXCELLENCE COMME SEUL STANDARD • DZ
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter mb-12 drop-shadow-2xl">
            {titleParts[0]}. <br/>
            <span className="text-primary italic drop-shadow-[0_10px_20px_rgba(var(--color-primary-rgb),0.3)]">
                {titleParts[1] || 'Souverain.'}
            </span>
          </h1>
          
          <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-16 font-medium leading-relaxed italic border-l-4 border-primary pl-8 text-left bg-white/50 dark:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 rounded-2xl md:rounded-none shadow-xl md:shadow-none">
                "{settings.homeHeroSubtitle}"
              </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-10">
            <Link to={settings.homePrimaryCta.link} className="group px-12 py-7 bg-slate-900 dark:bg-primary text-white font-black rounded-[2rem] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 text-xl uppercase tracking-tighter">
              {settings.homePrimaryCta.label}
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">trending_up</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 : LE DIRECTOIRE - SYSTÈME DYNAMIQUE ADAPTATIF */}
      <section className="py-40 px-6 bg-slate-50 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto text-center mb-24">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-6">LE DIRECTOIRE</h2>
              <h3 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Les bâtisseurs de votre vision.</h3>
          </div>

          <div className={`grid grid-cols-1 gap-16 mx-auto justify-center ${
              founders.length === 1 ? 'max-w-md' : 
              founders.length === 2 ? 'md:grid-cols-2 max-w-5xl' : 
              'md:grid-cols-2 lg:grid-cols-3 max-w-7xl'
          }`}>
              {founders.map((member) => (
                  <div key={member.id} className="group text-center">
                      <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative mb-10 transition-all duration-700 group-hover:rounded-[2rem] border-4 border-white dark:border-slate-800">
                          <img src={member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt={member.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute bottom-10 left-0 right-0 p-6">
                               <h4 className="text-3xl font-black text-white mb-1 tracking-tighter">{member.name}</h4>
                               <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">{member.role}</p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* SECTION SERVICES */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 text-center">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-6">{settings.homeServicesTitle}</h2>
            <h3 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none max-w-5xl mx-auto">{settings.homeServicesSubtitle}</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {activeServices.map((service) => (
              <Link to="/services" key={service.id} className="group bg-slate-50 dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all flex items-center gap-10">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-5xl">{service.icon}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">{service.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed line-clamp-2">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES D'ÉLITE */}
      <section className="py-40 px-6 bg-slate-900 dark:bg-slate-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5">
            <span className="material-symbols-outlined text-[300px] text-white">format_quote</span>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24 text-center">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-6">ÉLITE FEEDBACK</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Ils bâtissent demain avec nous.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white/5 backdrop-blur-lg p-10 rounded-[3rem] border border-white/10 hover:border-primary/50 transition-all group shadow-2xl h-full flex flex-col">
                <div className="mb-8">
                    <span className="material-symbols-outlined text-primary text-5xl group-hover:scale-110 transition-transform inline-block">format_quote</span>
                </div>
                <p className="text-slate-300 text-lg font-medium leading-relaxed italic flex-grow mb-10">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <img src={testimonial.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20" alt={testimonial.name} />
                    <div>
                        <h4 className="font-black text-white text-base tracking-tight">{testimonial.name}</h4>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{testimonial.role}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-primary rounded-[5rem] p-24 md:p-32 text-center relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <h2 className="text-5xl md:text-[8rem] font-black text-white mb-12 tracking-tighter leading-[0.85] uppercase italic">Audience <br/>Stratégique</h2>
                <Link to="/contact" className="px-16 py-8 bg-white text-slate-900 font-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-2xl text-2xl inline-flex items-center gap-6">
                    Réserver
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                </Link>
             </div>
          </div>
      </section>
    </div>
  );
};

export default Home;
