
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
    if (id) {
      const found = servicesStorage.getServiceById(id);
      if (found) {
        setService(found);
      } else {
        alert("Service introuvable");
        navigate('/admin/services');
      }
    }
    setLoading(false);
  }, [id, navigate]);

  const handleSave = (serviceData: Service) => {
    setSaving(true);
    try {
      if (id) {
        servicesStorage.updateService(id, serviceData);
      } else {
        servicesStorage.createService(serviceData);
      }
      // Petit délai pour UX
      setTimeout(() => {
        navigate('/admin/services');
      }, 500);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setSaving(false);
      alert("Erreur lors de la sauvegarde");
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin/services')} 
          className="text-slate-500 hover:text-primary mb-4 flex items-center gap-1 text-sm font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour à la liste
        </button>
        <h1 className="text-2xl font-black text-slate-900">
          {id ? `Modifier : ${service?.title}` : 'Créer un nouveau service'}
        </h1>
      </div>

      <ServiceFormFields 
        initialService={service}
        onSave={handleSave}
        isSaving={saving}
        onCancel={() => navigate('/admin/services')}
      />
    </div>
  );
};

export default AdminServiceEditPage;
