
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicesStorage } from '../../services/servicesStorage';
import { Service } from '../../types/Service';
import ServiceCard from '../../components/ServiceCard';

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await servicesStorage.getServices();
      setServices([...data].sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Erreur chargement services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await servicesStorage.deleteService(id);
        await loadServices();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleOrderChange = async (id: string, newOrder: number) => {
    const service = services.find(s => s.id === id);
    if (service) {
      try {
        await servicesStorage.updateService(id, { ...service, order: newOrder });
        // Mise à jour locale immédiate pour la fluidité
        setServices(prev => 
          [...prev.map(s => s.id === id ? { ...s, order: newOrder } : s)]
          .sort((a, b) => a.order - b.order)
        );
      } catch (error) {
        console.error("Erreur ordre:", error);
      }
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="p-20 text-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
        <p className="mt-4 text-slate-500 font-bold">Chargement de vos services...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Services</h1>
          <p className="text-slate-500 text-sm">Gérez les offres affichées sur le site public.</p>
        </div>
        <Link 
          to="/admin/services/new" 
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all transform active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span> 
          Ajouter un service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <span className="material-symbols-outlined text-3xl">design_services</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun service défini</h3>
          <p className="text-slate-500 mb-6">Commencez par créer votre premier service pour l'afficher sur le site.</p>
          <Link to="/admin/services/new" className="text-primary font-bold hover:underline">Créer le premier service</Link>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs">
                  <tr>
                    <th className="p-4 pl-6 w-16 text-center">Ordre</th>
                    <th className="p-4">Service</th>
                    <th className="p-4 text-center">Statut</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 pl-6">
                        <input 
                          type="number" 
                          value={service.order} 
                          onChange={(e) => handleOrderChange(service.id, parseInt(e.target.value) || 0)}
                          className="w-14 p-1.5 border border-slate-200 rounded text-center font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">{service.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{service.title}</p>
                            <p className="text-xs text-slate-400 line-clamp-1">{service.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${service.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {service.isActive ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(service.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="material-symbols-outlined text-primary">preview</span>
               <h2 className="text-lg font-bold text-slate-900">Aperçu Public</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id}>
                  <ServiceCard 
                    service={service} 
                    isEditable 
                    onEdit={() => navigate(`/admin/services/${service.id}/edit`)}
                    onDelete={() => handleDelete(service.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
