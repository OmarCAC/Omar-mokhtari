
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { contactStorage } from '../src/modules/contact/services/contactStorage';

interface QuoteState {
  type: string;
  price: number;
  priceMax?: number;
  details: Record<string, any>;
  summary: string;
  conversationLogs?: any[];
}

const QuoteRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quoteData, setQuoteData] = useState<QuoteState | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    if (location.state) {
      const data = location.state as QuoteState;
      setQuoteData(data);
      setFormData(prev => ({
        ...prev,
        message: `Bonjour,\n\nSuite à ma simulation sur votre site, voici les détails de ma demande :\n${data.summary}\n\nMerci de me recontacter pour finaliser ce devis.`
      }));
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactStorage.createMessage({
      type: 'quote',
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: `Demande de devis - ${formData.company}`,
      message: `${formData.message}\n\n--- Détails Estimation ---\n${quoteData ? JSON.stringify(quoteData.details, null, 2) : 'Aucune estimation préalable'}\nEstimation: ${quoteData?.price} DA`,
      conversationLogs: quoteData?.conversationLogs || []
    });
    setTimeout(() => navigate('/quote-success'), 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-background-light min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2"><span>Estimation</span><span className="text-primary">Informations</span><span>Confirmation</span></div>
          <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-primary h-2 rounded-full w-2/3"></div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Presque terminé !</h1>
              <p className="text-slate-600 mb-8">Complétez vos informations pour recevoir votre devis détaillé.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Nom et prénom</label><input type="text" name="name" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Jean Dupont" value={formData.name} onChange={handleChange}/></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'entreprise</label><input type="text" name="company" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Startup Inc." value={formData.company} onChange={handleChange}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Adresse e-mail</label><input type="email" name="email" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="vous@exemple.com" value={formData.email} onChange={handleChange}/></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-2">Numéro de téléphone</label><input type="tel" name="phone" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="+213..." value={formData.phone} onChange={handleChange}/></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Dites-nous en plus</label><textarea name="message" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-32" placeholder="Détails supplémentaires..." value={formData.message} onChange={handleChange}></textarea></div>
                <div className="flex items-start gap-3"><input type="checkbox" id="privacy" required className="mt-1 w-4 h-4 text-primary border-slate-300 rounded" /><label htmlFor="privacy" className="text-sm text-slate-600">J'accepte que mes données soient traitées conformément à la politique de confidentialité.</label></div>
                <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-transform transform active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"><span>Envoyer ma demande</span><span className="material-symbols-outlined text-sm">arrow_forward</span></button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg sticky top-24">
              <h2 className="text-lg font-bold mb-6 border-b border-slate-700 pb-4">Votre estimation</h2>
              {quoteData ? (
                <div className="animate-fade-in"><div className="space-y-4 mb-8"><div className="flex justify-between text-sm text-slate-300"><span>Type</span><span className="font-medium text-white">{quoteData.type}</span></div>{Object.entries(quoteData.details).map(([key, value]) => (<div key={key} className="flex justify-between text-sm text-slate-300"><span>{key}</span><span className="font-medium text-white text-right truncate pl-4">{value}</span></div>))}</div><div className="pt-6 border-t border-slate-700"><p className="text-sm text-slate-400 mb-1">Estimation</p><div className="flex items-baseline gap-1"><span className="text-3xl font-black">{quoteData.price.toLocaleString()}</span><span className="text-sm font-bold text-slate-400">DZD</span></div></div></div>
              ) : (<div className="text-center py-8"><p className="text-slate-400 text-sm">Aucune estimation sélectionnée.</p></div>)}
              <div className="mt-6 bg-white/10 rounded-lg p-3 text-xs text-slate-300 flex gap-2"><span className="material-symbols-outlined text-sm mt-0.5">info</span><p>Ceci est une estimation. Nous vous enverrons un devis final après examen.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
