
import React from 'react';
import { Link } from 'react-router-dom';

const QuoteSuccess: React.FC = () => {
  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full text-center">
        
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Merci ! Votre demande a bien été envoyée.</h1>
        
        <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
          Notre équipe a bien reçu votre demande de devis. Nous l'étudions avec attention et reviendrons vers vous par email ou téléphone sous 24 à 48 heures ouvrées.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
            Retourner à l'accueil
          </Link>
          <Link to="/blog" className="px-8 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-white hover:border-slate-400 transition-colors">
            Lire nos articles
          </Link>
        </div>

        <div className="border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">En attendant, explorez nos ressources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <Link to="/blog" className="group block overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlyLM_0zqHUTT4LKAdUM9R_QReMranOb5mgZ0LRoej2cYQ-N-wsVw9LRnrttjG9-yvt7LK-F06qqavdgUzYE8vbCfzx-hg4_cx6L64KAGX3d0WI1ZNJQIaNASKBL-H2jqKtWkFiWmW2YbMAw2FRzT0iQZySKjLN_KceDr6O2suumzEMb4rXVHQpDHWljzO2hGKfpunfgZmHDOsXgrRqRTOzgQc2lLpvRQlv3A0uLfHWda--AU49Xnc1c9xGgzv_gUhT9XMTIjlCVYW" 
                  alt="Conseils d'experts" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">Nos conseils d'experts</h3>
                <p className="text-sm text-slate-500">Actualités fiscales et astuces pour entrepreneurs.</p>
              </div>
            </Link>
            <Link to="/outils" className="group block overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATUMDZyZ1RjoLJmNCKsqU5WN4PsiBlIH1TOQb6owc5kCnjfwLdtulmzosoTyBC98lSMvY8ynkJS7EIPFp-cJc9ngg-4f6ntNp9d5wGOXA-tOVSTdsqm6NODfW0SFxcPeRQ4hEmB64CR9GJpQQjEu6YhOPoGAVBG_hYBy6WyaRKxAGxy3hZOOFWGVUZykCktLRXnkgwzo9kxif55XT3dY3zvGL2C-bif_CXD20kDsdiqb9GidveuN6D15v0fGAM8oPxEO0phXu1Z8nV" 
                  alt="Outils pour Startups" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">Outils pour Startups</h3>
                <p className="text-sm text-slate-500">Simulateurs et guides pour lancer votre projet.</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuoteSuccess;
