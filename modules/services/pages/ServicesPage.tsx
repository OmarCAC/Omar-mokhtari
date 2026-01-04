
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesStorage } from '../services/servicesStorage';
import { Service, ServicesSettings } from '../types/Service';
import ServiceCard from '../components/ServiceCard';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<ServicesSettings | null>(null);

  useEffect(() => {
    // Charger les données
    const allServices = servicesStorage.getServices();
    const activeServices = allServices
      .filter(s => s.isActive)
      .sort((a, b) => a.order - b.order);
    
    setServices(activeServices);
    setSettings(servicesStorage.getSettings());
  }, []);

  if (!settings) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            {settings.pageTitle}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {settings.pageDescription}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map(service => (
            <div key={service.id} className="h-full">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
        
        {services.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">inventory_2</span>
            <p className="text-slate-500">Aucun service disponible pour le moment.</p>
          </div>
        )}
      </div>

      {/* Footer Contact CTA */}
      {settings.showContactForm && (
        <div className="bg-white py-16 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Des besoins spécifiques ?</h2>
            <p className="text-slate-600 mb-8">
              Notre équipe est à votre disposition pour élaborer une solution sur mesure adaptée à votre activité.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
