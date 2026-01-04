import React, { useEffect, useState } from 'react';
import { CalculatorSettings, ActivityRate, NonPermanentService, AuditRange, VolumeRange, AdminFee } from '../../src/modules/calculator/types/CalculatorSettings';
import { calculatorStorage } from '../../src/modules/calculator/services/calculatorStorage';
import { servicesStorage } from '../../src/modules/services/services/servicesStorage';
import { Service } from '../../src/modules/services/types/Service';

const AdminCalc: React.FC = () => {
  const [settings, setSettings] = useState<CalculatorSettings | null>(null);
  const [cmsServices, setCmsServices] = useState<Service[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setSettings(calculatorStorage.getSettings());
    
    // Fix: servicesStorage.getServices() returns a Promise, must be awaited
    const loadCmsServices = async () => {
      try {
        const svcs = await servicesStorage.getServices();
        setCmsServices(svcs);
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };
    loadCmsServices();
  }, []);

  const handleSave = () => {
    if (settings) {
      calculatorStorage.saveSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRateChange = (index: number, field: keyof ActivityRate, value: string | number) => {
    if (!settings) return;
    const newRates = [...settings.permanentRates];
    // @ts-ignore
    newRates[index] = { ...newRates[index], [field]: value };
    setSettings({ ...settings, permanentRates: newRates });
  };

  const handleServiceChange = (index: number, field: any, value: any) => {
    if (!settings) return;
    const newServices = [...settings.nonPermanentServices];
    newServices[index] = { ...newServices[index], [field]: value };
    setSettings({ ...settings, nonPermanentServices: newServices });
  };

  const handleDeleteService = (index: number) => {
    if (!settings) return;
    const newServices = settings.nonPermanentServices.filter((_, i) => i !== index);
    setSettings({ ...settings, nonPermanentServices: newServices });
  };

  const handleAddService = () => {
    if (!settings) return;
    setSettings({ ...settings, nonPermanentServices: [...settings.nonPermanentServices, { id: Date.now().toString(), name: "Nouveau service", price: 0 }] });
  };

  const handleAuditChange = (index: number, field: keyof AuditRange, value: number) => {
    if (!settings) return;
    const newRanges = [...settings.auditRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setSettings({ ...settings, auditRanges: newRanges });
  };

  const handleVolumeRangeChange = (index: number, field: keyof VolumeRange, value: number) => {
    if (!settings) return;
    const newRanges = [...settings.volumeRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setSettings({ ...settings, volumeRanges: newRanges });
  };

  // Logique Simplifiée pour Creation Rates (pas de sous-composants complexes)
  const handleCreationCabinetFeeChange = (index: number, value: number) => {
    if (!settings) return;
    const newRates = [...settings.creationRates];
    newRates[index] = { ...newRates[index], cabinetFee: value };
    setSettings({ ...settings, creationRates: newRates });
  };

  if (!settings) return <div>Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-slate-50 py-4 z-10">
        <h1 className="text-2xl font-bold text-slate-900">Configuration Calculateur</h1>
        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">Sauvegarder</button>
      </div>

      {showSuccess && <div className="bg-green-100 text-green-700 p-4 rounded-lg">Paramètres enregistrés !</div>}

      {/* Activités Permanentes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">1. Tarifs Comptabilité Mensuelle</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 font-bold"><tr><th className="p-3">Activité</th><th className="p-3">Mensuel</th><th className="p-3">Annuel</th></tr></thead>
                <tbody>
                    {settings.permanentRates.map((rate, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="p-3 font-medium">{rate.type}</td>
                            <td className="p-3"><input type="number" className="p-1 border rounded w-24" value={rate.monthly} onChange={e => handleRateChange(idx, 'monthly', parseInt(e.target.value))} /></td>
                            <td className="p-3"><input type="number" className="p-1 border rounded w-24" value={rate.annual} onChange={e => handleRateChange(idx, 'annual', parseInt(e.target.value))} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Services Ponctuels */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-bold">2. Services Ponctuels</h2>
            <button onClick={handleAddService} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">+ Ajouter</button>
        </div>
        <div className="space-y-2">
            {settings.nonPermanentServices.map((svc, idx) => (
                <div key={svc.id} className="flex gap-2 items-center">
                    <input className="flex-1 p-2 border rounded" value={svc.name} onChange={e => handleServiceChange(idx, 'name', e.target.value)} />
                    <input className="w-32 p-2 border rounded text-right" type="number" value={svc.price} onChange={e => handleServiceChange(idx, 'price', parseInt(e.target.value))} />
                    <button onClick={() => handleDeleteService(idx)} className="text-red-500">X</button>
                </div>
            ))}
        </div>
      </div>

      {/* Audit */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">3. Barème Audit</h2>
        <div className="space-y-3">
            {settings.auditRanges.map((range, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 text-sm items-center">
                    <div><label>Bilan Max</label><input className="w-full p-2 border rounded" type="number" value={range.maxBalance} onChange={e => handleAuditChange(idx, 'maxBalance', parseInt(e.target.value))} /></div>
                    <div><label>Min Fee</label><input className="w-full p-2 border rounded" type="number" value={range.minFee} onChange={e => handleAuditChange(idx, 'minFee', parseInt(e.target.value))} /></div>
                    <div><label>Max Fee</label><input className="w-full p-2 border rounded" type="number" value={range.maxFee} onChange={e => handleAuditChange(idx, 'maxFee', parseInt(e.target.value))} /></div>
                </div>
            ))}
        </div>
      </div>

      {/* Paramètres Divers */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">4. Paramètres Avancés</h2>
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-1">Coût comptable interne (Comparatif)</label>
                <input className="w-full p-2 border rounded" type="number" value={settings.internalAccountantCost} onChange={e => setSettings({...settings, internalAccountantCost: parseInt(e.target.value)})} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Coût par salarié (DA)</label>
                <input className="w-full p-2 border rounded" type="number" value={settings.params.employeeCost} onChange={e => setSettings({...settings, params: {...settings.params, employeeCost: parseInt(e.target.value)}})} />
            </div>
        </div>
        
        <h3 className="font-bold mt-6 mb-2 text-sm text-slate-500 uppercase">Paliers Volume (Factures)</h3>
        <div className="space-y-2">
            {settings.volumeRanges.map((range, idx) => (
                <div key={idx} className="flex gap-2 items-center text-sm">
                    <span>De {range.min} à {range.max} docs :</span>
                    <input className="w-24 p-1 border rounded" type="number" value={range.price} onChange={e => handleVolumeRangeChange(idx, 'price', parseInt(e.target.value))} />
                    <span>DA suppl.</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default AdminCalc;