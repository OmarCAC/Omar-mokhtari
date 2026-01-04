
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesStorage } from '../src/modules/services/services/servicesStorage';
import { Service, ServicesSettings } from '../src/modules/services/types/Service';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';
import ServiceCard from '../src/modules/services/components/ServiceCard';

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

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [serviceSettings, setServiceSettings] = useState<ServicesSettings | null>(null);
  const [founders, setFounders] = useState<any[]>([]);

  const loadData = async () => {
    const allServices = await servicesStorage.getServices();
    const activeServices = allServices.filter(s => s.isActive).sort((a, b) => a.order - b.order);
    setServices(activeServices);
    setServiceSettings(servicesStorage.getSettings());
    setSiteSettings(siteSettingsStorage.getSettings());

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
    const handleUpdate = () => loadData();
    window.addEventListener('site-settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
        window.removeEventListener('site-settings-updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!serviceSettings) return null;

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-500 overflow-x-hidden">
      
      {/* HEADER VISIONNAIRE */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-12">
            SOUVERAINETÉ & SAVOIR
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.85] font-display max-w-5xl">
            Ingénierie de la <span className="text-primary italic">Réussite.</span>
          </h1>
          <p className="text-2xl text-slate-500 dark:text-slate-400 leading-tight max-w-2xl font-medium italic border-l-4 border-primary pl-8">
            "Nous ne gérons pas seulement vos comptes. Nous sécurisons votre trajectoire dans l'écosystème économique algérien."
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 grayscale pointer-events-none">
            <span className="material-symbols-outlined text-[400px]">verified_user</span>
        </div>
      </section>

      {/* SECTION GALERIE INTERCALAIRE DYNAMIQUE */}
      <section className="px-6 mb-20">
         <div className="max-w-7xl mx-auto h-[400px] rounded-[4rem] overflow-hidden shadow-2xl relative group border-4 border-white dark:border-slate-800">
            <img src={siteSettings.servicesHeroImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Audit" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent flex items-center px-16">
                <h3 className="text-white text-3xl md:text-5xl font-black font-display tracking-tight max-w-xl">L'audit comme rempart contre l'incertitude.</h3>
            </div>
         </div>
      </section>

      {/* GRILLE D'EXPERTISE */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {services.map(service => (
            <div key={service.id} className="h-full">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION ÉQUIPE */}
      <section className="py-32 px-6 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                  <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-6">L'INTELLIGENCE HUMAINE</h2>
                  <h3 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Le Directoire.</h3>
              </div>

              <div className={`grid grid-cols-1 gap-12 mx-auto justify-center ${
                  founders.length === 1 ? 'max-w-md' : 
                  founders.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 
                  'md:grid-cols-2 lg:grid-cols-3 max-w-7xl'
              }`}>
                  {founders.map((member) => (
                      <div key={member.id} className="group flex flex-col">
                          <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 mb-8 transition-all duration-500 group-hover:rounded-2xl group-hover:shadow-2xl">
                              <img src={member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={member.name} />
                          </div>
                          <div className="px-4">
                              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h4>
                              <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">{member.role}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* SECTION IMPACT VISUEL 2 */}
      <section className="py-40 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
            <div>
                <h2 className="text-sm font-black text-primary uppercase tracking-[0.6em] mb-6">ACCOMPAGNEMENT ÉLITE</h2>
                <h3 className="text-4xl md:text-6xl font-black font-display mb-10 leading-none tracking-tighter text-slate-900 dark:text-white">Votre vision mérite une protection absolue.</h3>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium mb-12">
                    Chaque pôle d'excellence chez Compalik est piloté par des experts aguerris aux spécificités de la Loi de Finances algérienne et aux exigences de la transformation numérique.
                </p>
                <Link to="/contact" className="px-12 py-6 bg-slate-900 dark:bg-primary text-white font-black rounded-3xl hover:scale-105 transition-all shadow-xl inline-block text-xl uppercase tracking-tighter">Consulter l'Ingénierie</Link>
            </div>
            <div className="relative">
                <div className="aspect-square rounded-[5rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white dark:border-slate-800">
                    <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Conseil" />
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[5rem] text-white p-20 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter leading-none">Un défi de gestion complexe ?</h2>
              <p className="text-xl md:text-2xl text-white/60 mb-16 font-medium max-w-3xl mx-auto leading-relaxed">
                Nos conseillers stratégiques élaborent des protocoles sur-mesure pour les structures à fort impact économique.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-4 px-16 py-8 bg-primary text-white font-black rounded-full hover:scale-110 transition-all shadow-2xl shadow-primary/20 text-2xl uppercase tracking-tighter">
                Ouvrir un ticket d'élite
                <span className="material-symbols-outlined text-3xl">support_agent</span>
              </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-24 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
         <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[1em]">
            COMPALIK • L'EXCELLENCE COMME SEUL STANDARD
         </p>
      </footer>
    </div>
  );
};

export default Services;
