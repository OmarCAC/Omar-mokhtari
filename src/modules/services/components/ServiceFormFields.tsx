
import React, { useState, useEffect } from 'react';
import { Service, ServiceFeature } from '../types/Service';

interface ServiceFormFieldsProps {
  initialService: Service | null;
  onSave: (service: Service) => void;
  isSaving: boolean;
  onCancel: () => void;
}

const ICONS_LIST = [
  'account_balance', 'receipt_long', 'gavel', 'business_center', 
  'policy', 'trending_up', 'security', 'verified_user', 'calculate',
  'groups', 'work', 'payments', 'analytics', 'rocket_launch'
];

// Fonction utilitaire pour générer des IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const ServiceFormFields: React.FC<ServiceFormFieldsProps> = ({ initialService, onSave, isSaving, onCancel }) => {
  
  // État initial sécurisé
  const [formData, setFormData] = useState<Service>(() => {
    if (initialService) {
      return {
        ...initialService,
        features: initialService.features || [] // Garantir que c'est un tableau
      };
    }
    return {
      id: '',
      title: '',
      slug: '',
      description: '',
      fullDescription: '',
      icon: 'account_balance',
      features: [],
      primaryCta: { label: 'Obtenir un devis', action: 'contact' },
      order: 0,
      isActive: true,
      createdAt: '',
      updatedAt: ''
    };
  });

  const [newFeatureText, setNewFeatureText] = useState('');

  // Génération automatique du slug
  useEffect(() => {
    if (!initialService && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, initialService]);

  const handleChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCtaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      primaryCta: { ...prev.primaryCta, [field]: value }
    }));
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    const newFeature: ServiceFeature = {
      id: generateId(),
      text: newFeatureText.trim()
    };
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature]
    }));
    setNewFeatureText('');
  };

  const removeFeature = (id: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentFeatures = formData.features || [];
    if (currentFeatures.length === 0) {
      alert("Veuillez ajouter au moins un point clé (avantage).");
      return;
    }
    onSave({
      ...formData,
      features: currentFeatures
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. Informations de base */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">info</span>
          Informations de base
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre du service *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: Comptabilité Générale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description courte (Aperçu) *</label>
            <input 
              type="text" 
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              placeholder="Une phrase accrocheuse pour décrire le service."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description détaillée *</label>
            <textarea 
              required
              rows={4}
              value={formData.fullDescription}
              onChange={(e) => handleChange('fullDescription', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              placeholder="Détaillez le contenu de l'offre..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Icône</label>
            <div className="flex items-center gap-3">
              <select 
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              >
                {ICONS_LIST.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">{formData.icon}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Avantages / Features */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">list_alt</span>
          Points clés & Avantages
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newFeatureText}
            onChange={(e) => setNewFeatureText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
            placeholder="Ajouter un point clé (ex: Bilans annuels)..."
          />
          <button 
            type="button" 
            onClick={addFeature}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
          >
            Ajouter
          </button>
        </div>

        <div className="space-y-2">
          {(formData.features || []).map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                <span className="text-sm text-slate-700">{feature.text}</span>
              </div>
              <button 
                type="button"
                onClick={() => removeFeature(feature.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          {(!formData.features || formData.features.length === 0) && (
            <p className="text-sm text-slate-400 italic text-center py-2">Aucun point clé ajouté.</p>
          )}
        </div>
      </div>

      {/* 3. Call to Action */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">touch_app</span>
          Bouton d'action (CTA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Texte du bouton</label>
            <input 
              type="text" 
              required
              value={formData.primaryCta.label}
              onChange={(e) => handleCtaChange('label', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
            <select 
              value={formData.primaryCta.action}
              onChange={(e) => handleCtaChange('action', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
            >
              <option value="contact">Page Contact</option>
              <option value="calculator">Calculateur d'honoraires</option>
              <option value="link">Lien externe</option>
            </select>
          </div>
          {formData.primaryCta.action === 'link' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">URL de destination</label>
              <input 
                type="url" 
                required
                value={formData.primaryCta.url || ''}
                onChange={(e) => handleCtaChange('url', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Options & Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-slate-700">Publier ce service immédiatement</span>
        </label>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isSaving ? 'Sauvegarde...' : 'Enregistrer le service'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ServiceFormFields;
