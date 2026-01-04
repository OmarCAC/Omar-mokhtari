
import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../types/Service';

interface ServiceCardProps {
  service: Service;
  isEditable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isEditable, onEdit, onDelete }) => {
  // Déterminer le lien du CTA
  let ctaLink = '#';
  let ctaState = {};

  if (service.primaryCta.action === 'contact') ctaLink = '/contact';
  else if (service.primaryCta.action === 'calculator') {
    ctaLink = '/outils/calculateur-honoraires';
    ctaState = { serviceId: service.id };
  }
  else if (service.primaryCta.action === 'link' && service.primaryCta.url) ctaLink = service.primaryCta.url;

  // Diversification des dégradés selon l'index/id pour éviter la répétition
  const getGradient = (id: string) => {
    const hashes = ['from-slate-900 to-slate-800', 'from-primary to-primary-dark', 'from-indigo-900 to-indigo-700', 'from-slate-800 to-primary'];
    const index = id.length % hashes.length;
    return hashes[index];
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 hover:shadow-[0_50px_100px_rgba(0,0,0,0.15)] transition-all duration-700 overflow-hidden h-full transform hover:-translate-y-4">
      {/* Header Monumental */}
      <div className={`p-10 bg-gradient-to-br ${getGradient(service.id)} relative overflow-hidden h-72 flex flex-col justify-end`}>
        <div className="absolute top-8 right-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-4xl">{service.icon}</span>
          </div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-none font-display tracking-tighter">{service.title}</h3>
          <div className="h-1 w-12 bg-primary mb-4"></div>
          <p className="text-white/70 text-sm font-medium line-clamp-2 uppercase tracking-widest">{service.description}</p>
        </div>

        {/* Filigrane Architectural */}
        <span className="material-symbols-outlined absolute -bottom-10 -left-10 text-[250px] text-white/5 select-none pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          {service.icon}
        </span>
      </div>

      {/* Body Riche */}
      <div className="p-10 flex flex-col flex-grow bg-white dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-10 leading-relaxed italic">
          "{service.fullDescription}"
        </p>
        
        <div className="space-y-4 mb-12">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Expertises incluses :</p>
            {(service.features || []).map((feature) => (
                <div key={feature.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-primary text-xl font-bold">check</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{feature.text}</span>
                </div>
            ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-8 border-t border-slate-50 dark:border-slate-800">
          {!isEditable ? (
            <Link 
              to={ctaLink} 
              state={ctaState}
              className="group/btn flex items-center justify-between w-full py-6 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-xl"
            >
              <span>{service.primaryCta.label}</span>
              <span className="material-symbols-outlined group-hover/btn:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onEdit}
                className="flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span> Éditer
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
