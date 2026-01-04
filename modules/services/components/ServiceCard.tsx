
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
  if (service.primaryCta.action === 'contact') ctaLink = '/contact';
  else if (service.primaryCta.action === 'calculator') ctaLink = '/outils/calculateur-honoraires';
  else if (service.primaryCta.action === 'link' && service.primaryCta.url) ctaLink = service.primaryCta.url;

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-4">
            <span className="material-symbols-outlined text-3xl">{service.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
          <p className="text-blue-100 text-sm line-clamp-2">{service.description}</p>
        </div>
        {/* Decorative Icon Background */}
        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/5 select-none pointer-events-none">
          {service.icon}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
          {service.fullDescription}
        </p>
        
        <ul className="space-y-3 mb-8">
          {service.features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="material-symbols-outlined text-green-500 text-lg mt-0.5 flex-shrink-0">check_circle</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        {/* Footer Actions */}
        <div className="mt-auto space-y-3">
          {!isEditable ? (
            <Link 
              to={ctaLink} 
              className="flex items-center justify-center w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              {service.primaryCta.label}
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onEdit}
                className="flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span> Modifier
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
