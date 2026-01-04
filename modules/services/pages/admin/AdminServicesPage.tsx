
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicesStorage } from '../../services/servicesStorage';
import { Service } from '../../types/Service';
import ServiceCard from '../../components/ServiceCard';

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  const loadServices = () => {
    const data = servicesStorage.getServices();
    setServices(data.sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      servicesStorage.deleteService(id);
      loadServices();
    }
  };

  const handleOrderChange = (id: string, newOrder: number) => {
    const service = services.find(s => s.id === id);
    if (service) {
      servicesStorage.updateService(id, { ...service, order: newOrder });
      loadServices();
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Services</h1>
          <p className="text-slate-500 text-sm">Gérez les offres affichées sur le site public.</p>
        </div>
        <Link 
          to="/admin/services/new" 
          className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all"
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
        <div className="space-y-8">
          
          {/* Table View */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs">
                  <tr>
                    <th className="p-4 pl-6 w-16">Ordre</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <input 
                          type="number" 
                          value={service.order} 
                          onChange={(e) => handleOrderChange(service.id, parseInt(e.target.value))}
                          className="w-12 p-1 border border-slate-300 rounded text-center font-mono text-slate-600 focus:ring-primary focus:border-primary"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-lg">{service.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{service.title}</p>
                            <p className="text-xs text-slate-500">{service.features.length} points clés</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {service.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            Publié
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                            Brouillon
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(service.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Preview Grid */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Aperçu des cartes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="h-full">
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
