
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { servicesStorage } from '../../services/servicesStorage';
import { Service } from '../../types/Service';
import ServiceFormFields from '../../components/ServiceFormFields';

const AdminServiceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      if (id) {
        try {
          const found = await servicesStorage.getServiceById(id);
          if (found) {
            setService(found);
          } else {
            alert("Service introuvable");
            navigate('/admin/services');
          }
        } catch (error) {
          console.error("Erreur lors du chargement du service:", error);
          alert("Erreur de communication avec le stockage.");
          navigate('/admin/services');
        }
      }
      setLoading(false);
    };

    loadService();
  }, [id, navigate]);

  const handleSave = async (serviceData: Service) => {
    setSaving(true);
    try {
      if (id) {
        await servicesStorage.updateService(id, serviceData);
      } else {
        await servicesStorage.createService(serviceData);
      }
      // Succès : redirection
      navigate('/admin/services');
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setSaving(false);
      alert("Erreur lors de la sauvegarde du service.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">sync</span>
        <p className="text-slate-500 font-bold">Chargement des données du service...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin/services')} 
          className="text-slate-500 hover:text-primary mb-4 flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour à la liste
        </button>
        <h1 className="text-2xl font-black text-slate-900">
          {id ? `Modifier : ${service?.title}` : 'Créer un nouveau service'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1">
        <ServiceFormFields 
          initialService={service}
          onSave={handleSave}
          isSaving={saving}
          onCancel={() => navigate('/admin/services')}
        />
      </div>
    </div>
  );
};

export default AdminServiceEditPage;
