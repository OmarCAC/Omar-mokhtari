import React from 'react';

const AdminApps: React.FC = () => {
  const apps = [
    { title: "Calculateur de Valorisation Startup", status: "Actif" },
    { title: "Prévisions Financières", status: "Actif" },
    { title: "Générateur Business Plan", status: "Inactif" },
    { title: "Calculateur CAC/LTV", status: "Actif" },
    { title: "Checklist Création Startup", status: "Actif" }
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">Gestion des applications interactives</h1>

      <div className="grid gap-6">
        {apps.map((app, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: app.status === 'Actif' ? '#10B981' : '#9CA3AF' }}></div>
              <h3 className="text-lg font-bold text-slate-900">{app.title}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-slate-100 text-primary font-medium rounded-lg hover:bg-slate-200 text-sm">Contenu Introductif</button>
              <button className="px-3 py-1.5 bg-slate-100 text-primary font-medium rounded-lg hover:bg-slate-200 text-sm">Paramètres</button>
              <button className={`px-3 py-1.5 font-medium rounded-lg text-sm ${app.status === 'Actif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {app.status === 'Actif' ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApps;