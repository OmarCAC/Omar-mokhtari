
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { toolsStorage } from '../src/modules/tools/services/toolsStorage';

interface ProtectedToolRouteProps {
  children: React.ReactNode;
}

const ProtectedToolRoute: React.FC<ProtectedToolRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const tools = toolsStorage.getTools();

  // Trouver l'outil correspondant à l'URL actuelle
  // On gère le cas où l'URL pourrait avoir des paramètres ou des slashs de fin
  const currentTool = tools.find(t => location.pathname.startsWith(t.link));

  // Si l'outil n'est pas trouvé ou est public, on autorise l'accès
  if (!currentTool || currentTool.accessLevel === 'public') {
    return <>{children}</>;
  }

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    let message = "Connectez-vous pour accéder à cet outil.";
    if (currentTool.accessLevel === 'member') {
        message = `L'outil "${currentTool.title}" nécessite un compte gratuit pour sauvegarder vos données.`;
    } else if (currentTool.accessLevel === 'premium') {
        message = `L'outil "${currentTool.title}" est réservé aux membres Premium.`;
    }

    return <Navigate to="/login" state={{ from: location, message }} replace />;
  }

  // Si l'utilisateur est connecté mais n'a pas le bon rôle (Premium)
  if (currentTool.accessLevel === 'premium' && user?.role !== 'premium' && user?.role !== 'admin') {
     // Ici, on pourrait rediriger vers une page d'upgrade, ou afficher une modale.
     // Pour simplifier, on redirige vers le dashboard avec un message (ou login si on veut forcer l'upgrade flow)
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès Premium requis</h2>
                <p className="text-slate-600 mb-6">
                    L'outil <b>{currentTool.title}</b> est réservé aux membres Premium. Mettez à niveau votre compte pour y accéder.
                </p>
                <div className="flex gap-3 justify-center">
                    <a href="/dashboard" className="px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50">
                        Retour
                    </a>
                    <button onClick={() => alert("Flow de paiement simulé")} className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20">
                        Devenir Premium
                    </button>
                </div>
            </div>
        </div>
     );
  }

  return <>{children}</>;
};

export default ProtectedToolRoute;
