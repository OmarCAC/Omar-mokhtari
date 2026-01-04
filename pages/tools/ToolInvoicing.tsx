import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ImageUploadField from '../../components/ImageUploadField';
import { pdfService } from '../../src/services/pdfService';
import { userStorage } from '../../src/services/userStorage';
import { aiService } from '../../src/services/aiService';
import { ImageCompressionService } from '../../services/imageCompressionService';

interface InvoiceItem {
  id: number;
  description: string;
  unit: string; // U, H, J, Forfait
  quantity: number;
  price: number;
  tva: number; // 0, 9, 19
}

const ToolInvoicing: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [projectId, setProjectId] = useState<string | null>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [issuer, setIssuer] = useState({
    logo: '',
    name: '', 
    legalForm: '', 
    capital: '', 
    activity: '', 
    address: '',
    phone: '',
    email: '',
    rc: '',
    nif: '',
    nis: '',
    ai: '',
    rib: '',
    bank: ''
  });

  const [client, setClient] = useState({
    name: '',
    address: '',
    nif: '',
    rc: '',
    phone: '',
    email: ''
  });

  const [logistics, setLogistics] = useState({
    driverName: '', 
    driverId: '', 
    vehicleMatricule: '', 
    loadingAddress: '', 
    deliveryAddress: '', 
    decisionRef: '' 
  });

  const [meta, setMeta] = useState({
    number: `FA-${new Date().getFullYear()}-001`,
    date: new Date().toISOString().split('T')[0],
    type: 'Facture' as 'Facture' | 'Devis' | 'Proforma' | 'Bon de livraison' | 'Bon de transfert',
    paymentMethod: 'Virement',
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: 'Marchandise / Service', unit: 'U', quantity: 1, price: 0, tva: 19 }
  ]);

  useEffect(() => {
    if (location.state && (location.state as any).data) {
        const data = (location.state as any).data;
        setIssuer({ ...issuer, ...data.issuer });
        setClient({ ...client, ...data.client });
        setMeta({ ...meta, ...data.meta });
        setItems(data.items || items);
        if(data.logistics) setLogistics({ ...logistics, ...data.logistics });
        setProjectId((location.state as any).projectId);
    } else {
        const saved = localStorage.getItem('comptalink_invoice_issuer');
        if (saved) {
            try { setIssuer({ ...issuer, ...JSON.parse(saved) }); } catch (e) {}
        } else {
            const globalProfile = userStorage.getUserProfile();
            if (globalProfile.companyName && globalProfile.companyName !== 'Ma Société') {
                setIssuer(prev => ({
                    ...prev,
                    name: globalProfile.companyName,
                    legalForm: globalProfile.legalForm,
                    address: globalProfile.address,
                    nif: globalProfile.nif,
                    rc: globalProfile.rc,
                    email: globalProfile.email
                }));
            }
        }
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem('comptalink_invoice_issuer', JSON.stringify(issuer));
  }, [issuer]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', unit: 'U', quantity: 1, price: 0, tva: 19 }]);
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleOcrClick = () => {
    ocrInputRef.current?.click();
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsAnalyzing(true);
      
      try {
        const compressed = await ImageCompressionService.compress(file);
        const result = await aiService.extractInvoiceData(compressed.dataUrl);
        
        if (result) {
          if (result.client) {
            setClient(prev => ({
              ...prev,
              name: result.client?.name || prev.name,
              address: result.client?.address || prev.address,
              nif: result.client?.nif || prev.nif
            }));
          }
          
          if (result.items && result.items.length > 0) {
            const newItems = result.items.map((item, idx) => ({
              id: Date.now() + idx,
              description: item.description || 'Article',
              unit: 'U',
              quantity: item.quantity || 1,
              price: item.price || 0,
              tva: item.tva || 19
            }));
            setItems(newItems);
          }

          if (result.date) {
            setMeta(prev => ({ ...prev, date: result.date || prev.date }));
          }
          if (result.number) {
            setMeta(prev => ({ ...prev, number: result.number || prev.number }));
          }

          alert("Facture analysée avec succès ! Les données ont été remplies.");
        }
      } catch (error) {
        console.error(error);
        alert("Erreur lors de l'analyse de la facture. Veuillez réessayer avec une image plus claire.");
      } finally {
        setIsAnalyzing(false);
        if (ocrInputRef.current) ocrInputRef.current.value = '';
      }
    }
  };

  // Fix: make handleSaveProject async and await the promise from saveProject
  const handleSaveProject = async () => {
    const title = `${meta.type} ${meta.number} - ${client.name || 'Client'}`;
    try {
      const id = await userStorage.saveProject({
          id: projectId || undefined,
          type: 'invoice',
          name: title,
          data: { issuer, client, meta, items, logistics }
      });
      setProjectId(id);
      alert(`Document sauvegardé dans Mon Espace !`);
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const calculateTotals = () => {
    let totalHT = 0;
    let totalTVA = 0;
    
    items.forEach(item => {
      const lineHT = item.quantity * item.price;
      const lineTVA = lineHT * (item.tva / 100);
      totalHT += lineHT;
      totalTVA += lineTVA;
    });

    const totalTTC = totalHT + totalTVA;
    
    let timbre = 0;
    if (meta.paymentMethod === 'Espèces' && !['Bon de livraison', 'Bon de transfert'].includes(meta.type)) {
      timbre = Math.min(2500, Math.ceil(totalTTC * 0.01));
      if (timbre < 5 && totalTTC > 0) timbre = 5;
    }

    return { totalHT, totalTVA, totalTTC, timbre, netAPayer: totalTTC + timbre };
  };

  const totals = calculateTotals();

  const handleDownload = () => {
    pdfService.generateInvoicePdf({ issuer, client, meta, items, totals, logistics });
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const isLogisticsRequired = ['Bon de livraison', 'Bon de transfert'].includes(meta.type);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link 
                to="/outils" 
                className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm mb-2 p-2 -ml-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
                <span className="material-symbols-outlined text-lg">arrow_back</span> Retour aux outils
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Générateur de Documents Commerciaux</h1>
            <p className="text-slate-600 text-sm">Conforme au Décret exécutif n° 05-468 (Factures, BL, Transferts).</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input type="file" ref={ocrInputRef} className="hidden" accept="image/*" onChange={handleOcrFileChange} />
            <button 
                onClick={handleOcrClick}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-sm hover:from-purple-700 hover:to-blue-700 transition-all shadow-md flex items-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <span className="material-symbols-outlined animate-spin text-lg">sync</span> Analyse...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-lg">document_scanner</span> Scanner Facture (IA)
                    </>
                )}
            </button>

            <button 
                onClick={handleSaveProject}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">save</span> Sauvegarder
            </button>
            <div className="h-10 w-px bg-slate-300 mx-1"></div>
            <button 
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'edit' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
            >
                <span className="material-symbols-outlined text-lg">edit_document</span> Éditeur
            </button>
            <button 
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
            >
                <span className="material-symbols-outlined text-lg">visibility</span> Aperçu
            </button>
            <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">download</span> PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className={`space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">store</span> Votre Entreprise (Émetteur)
                    </h3>
                    <Link to="/dashboard" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">edit</span> Modifier le profil global
                    </Link>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-24">
                            <ImageUploadField 
                                label="" 
                                initialImageUrl={issuer.logo} 
                                onImageChange={(url) => setIssuer({...issuer, logo: url})} 
                            />
                        </div>
                        <div className="flex-1 space-y-3">
                            <input type="text" placeholder="Dénomination Sociale *" className="w-full p-2 border rounded text-sm font-bold" value={issuer.name} onChange={e => setIssuer({...issuer, name: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Forme Juridique (ex: SARL)" className="w-full p-2 border rounded text-xs" value={issuer.legalForm} onChange={e => setIssuer({...issuer, legalForm: e.target.value})} />
                                <input type="text" placeholder="Capital Social (si applicable)" className="w-full p-2 border rounded text-xs" value={issuer.capital} onChange={e => setIssuer({...issuer, capital: e.target.value})} />
                            </div>
                            <input type="text" placeholder="Nature de l'activité (Art 3)" className="w-full p-2 border rounded text-xs" value={issuer.activity} onChange={e => setIssuer({...issuer, activity: e.target.value})} />
                            <textarea placeholder="Adresse du siège social" rows={2} className="w-full p-2 border rounded text-sm" value={issuer.address} onChange={e => issuer.address = e.target.value}></textarea>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Matricule Fiscal (NIF) *" className="p-2 border rounded text-xs" value={issuer.nif} onChange={e => setIssuer({...issuer, nif: e.target.value})} />
                        <input type="text" placeholder="Numéro Ident. Stat (NIS) *" className="p-2 border rounded text-xs" value={issuer.nis} onChange={e => setIssuer({...issuer, nis: e.target.value})} />
                        <input type="text" placeholder="Registre Commerce (RC) *" className="p-2 border rounded text-xs" value={issuer.rc} onChange={e => setIssuer({...issuer, rc: e.target.value})} />
                        <input type="text" placeholder="Article Imposition (AI) *" className="p-2 border rounded text-xs" value={issuer.ai} onChange={e => setIssuer({...issuer, ai: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Email contact" className="p-2 border rounded text-xs" value={issuer.email} onChange={e => setIssuer({...issuer, email: e.target.value})} />
                        <input type="text" placeholder="Téléphone / Fax" className="p-2 border rounded text-xs" value={issuer.phone} onChange={e => setIssuer({...issuer, phone: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <input type="text" placeholder="Banque" className="p-2 border rounded text-xs" value={issuer.bank} onChange={e => setIssuer({...issuer, bank: e.target.value})} />
                        <input type="text" placeholder="RIB" className="p-2 border rounded text-xs" value={issuer.rib} onChange={e => setIssuer({...issuer, rib: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span> Client & Détails
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Informations Client</label>
                        <input type="text" placeholder="Nom / Raison Sociale *" className="w-full p-2 border rounded text-sm" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
                        <textarea placeholder="Adresse complète *" rows={2} className="w-full p-2 border rounded text-sm" value={client.address} onChange={e => setClient({...client, address: e.target.value})}></textarea>
                        <input type="text" placeholder="NIF Client (Si pro)" className="w-full p-2 border rounded text-sm" value={client.nif} onChange={e => setClient({...client, nif: e.target.value})} />
                        <input type="text" placeholder="RC Client (Si pro)" className="w-full p-2 border rounded text-sm" value={client.rc} onChange={e => setClient({...client, rc: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Tél (Optionnel)" className="w-full p-2 border rounded text-xs" value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} />
                            <input type="text" placeholder="Email (Optionnel)" className="w-full p-2 border rounded text-xs" value={client.email} onChange={e => setClient({...client, email: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Paramètres Document</label>
                        <div className="flex gap-2">
                            <select className="p-2 border rounded text-sm flex-1 font-bold" value={meta.type} onChange={e => setMeta({...meta, type: e.target.value as any})}>
                                <option value="Facture">Facture</option>
                                <option value="Devis">Devis</option>
                                <option value="Proforma">Proforma</option>
                                <option value="Bon de livraison">Bon de livraison</option>
                                <option value="Bon de transfert">Bon de transfert</option>
                            </select>
                            <input type="text" className="p-2 border rounded text-sm w-1/2" value={meta.number} onChange={e => setMeta({...meta, number: e.target.value})} />
                        </div>
                        <input type="date" className="w-full p-2 border rounded text-sm" value={meta.date} onChange={e => setMeta({...meta, date: e.target.value})} />
                        <select className="w-full p-2 border rounded text-sm" value={meta.paymentMethod} onChange={e => setMeta({...meta, paymentMethod: e.target.value})}>
                            <option value="Virement">Virement Bancaire</option>
                            <option value="Chèque">Chèque</option>
                            <option value="Espèces">Espèces</option>
                            <option value="Versement">Versement</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLogisticsRequired && (
                <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200 animate-fade-in">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">local_shipping</span> 
                        Transport & Logistique (Obligatoire Art 13 & 15)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">Nom du Livreur / Transporteur</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.driverName} onChange={e => setLogistics({...logistics, driverName: e.target.value})} placeholder="Nom Prénom" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">N° Carte d'identité / Permis</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.driverId} onChange={e => setLogistics({...logistics, driverId: e.target.value})} placeholder="N° Pièce d'identité" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">Matricule Véhicule</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.vehicleMatricule} onChange={e => setLogistics({...logistics, vehicleMatricule: e.target.value})} placeholder="Ex: 00000 123 16" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">N° Décision (Si applicable)</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.decisionRef} onChange={e => setLogistics({...logistics, decisionRef: e.target.value})} placeholder="Réf autorisation..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-blue-800 mb-1">Lieu d'expédition (Si différent du siège)</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.loadingAddress} onChange={e => setLogistics({...logistics, loadingAddress: e.target.value})} placeholder="Adresse entrepôt..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-blue-800 mb-1">Lieu de destination (Si différent du client)</label>
                            <input type="text" className="w-full p-2 border border-blue-200 rounded text-sm" value={logistics.deliveryAddress} onChange={e => setLogistics({...logistics, deliveryAddress: e.target.value})} placeholder="Adresse livraison..." />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">list</span> Articles / Prestations
                </h3>
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <div key={item.id} className="flex gap-2 items-start p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex-1 space-y-1">
                                <input type="text" placeholder="Description" className="w-full p-1.5 border rounded text-sm" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Unité" className="w-16 p-1.5 border rounded text-xs" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} />
                                    <select className="w-20 p-1.5 border rounded text-xs" value={item.tva} onChange={e => updateItem(item.id, 'tva', parseFloat(e.target.value))}>
                                        <option value="19">19%</option>
                                        <option value="9">9%</option>
                                        <option value="0">0%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="w-20">
                                <input type="number" placeholder="Qté" className="w-full p-1.5 border rounded text-sm text-center" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} />
                            </div>
                            <div className="w-28">
                                <input type="number" placeholder="Prix Unit." className="w-full p-1.5 border rounded text-sm text-right" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))} />
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 pt-2"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                    ))}
                    <button onClick={addItem} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline mt-2">
                        <span className="material-symbols-outlined text-lg">add_circle</span> Ajouter une ligne
                    </button>
                </div>
            </div>

          </div>

          <div className={`sticky top-8 ${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white shadow-xl min-h-[800px] p-8 md:p-12 relative text-slate-800 text-sm font-sans border border-slate-200" id="invoice-preview">
                
                <div className="flex justify-between items-start mb-8">
                    <div className="w-1/2">
                        {issuer.logo ? (
                            <img src={issuer.logo} alt="Logo" className="h-16 object-contain mb-4" />
                        ) : (
                            <div className="h-16 w-16 bg-slate-100 flex items-center justify-center text-slate-300 rounded mb-4">Logo</div>
                        )}
                        <h2 className="font-bold text-lg uppercase">{issuer.name || 'Votre Entreprise'}</h2>
                        {issuer.legalForm && <p className="text-xs font-bold text-slate-600">{issuer.legalForm} {issuer.capital ? `au capital de ${issuer.capital}` : ''}</p>}
                        {issuer.activity && <p className="text-xs text-slate-600 italic mt-1">{issuer.activity}</p>}
                        <p className="text-slate-500 whitespace-pre-line text-xs mt-2">{issuer.address || 'Adresse complète'}</p>
                        {(issuer.phone || issuer.email) && <p className="text-xs text-slate-500 mt-1">{issuer.phone} {issuer.email}</p>}
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-slate-900 uppercase mb-2">{meta.type}</h1>
                        <p className="font-mono text-slate-600">N° {meta.number}</p>
                        <p className="text-slate-500">Date : {new Date(meta.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <div className="flex justify-between gap-8 mb-8">
                    <div className="flex-1 bg-slate-50 p-4 rounded border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Émetteur</p>
                        <div className="text-xs space-y-1">
                            {issuer.nif && <p><span className="font-bold">NIF :</span> {issuer.nif}</p>}
                            {issuer.nis && <p><span className="font-bold">NIS :</span> {issuer.nis}</p>}
                            {issuer.rc && <p><span className="font-bold">RC :</span> {issuer.rc}</p>}
                            {issuer.ai && <p><span className="font-bold">Art. Imp. :</span> {issuer.ai}</p>}
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded border-2 border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Destinataire (Client)</p>
                        <p className="font-bold text-base mb-1">{client.name || 'Nom du Client'}</p>
                        <p className="text-slate-600 whitespace-pre-line text-xs mb-2">{client.address || 'Adresse du client'}</p>
                        <div className="text-xs space-y-1 text-slate-500 border-t border-slate-100 pt-2 mt-2">
                            {client.nif && <p><span className="font-bold">NIF :</span> {client.nif}</p>}
                            {client.rc && <p><span className="font-bold">RC :</span> {client.rc}</p>}
                        </div>
                    </div>
                </div>

                {isLogisticsRequired && (
                    <div className="mb-8 border border-slate-300 rounded p-3 text-xs">
                        <p className="font-bold border-b border-slate-200 pb-1 mb-2 uppercase text-slate-500">Informations de Transport (Décret 05-468)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p><span className="font-bold">Transporteur :</span> {logistics.driverName || '-'}</p>
                                <p><span className="font-bold">ID / Permis :</span> {logistics.driverId || '-'}</p>
                                <p><span className="font-bold">Matricule :</span> {logistics.vehicleMatricule || '-'}</p>
                            </div>
                            <div>
                                <p><span className="font-bold">Expédition :</span> {logistics.loadingAddress || issuer.address || 'Siège'}</p>
                                <p><span className="font-bold">Destination :</span> {logistics.deliveryAddress || client.address || 'Client'}</p>
                                {logistics.decisionRef && <p><span className="font-bold">Décision :</span> {logistics.decisionRef}</p>}
                            </div>
                        </div>
                    </div>
                )}

                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left">
                            <th className="py-2 font-bold w-1/2">Désignation</th>
                            <th className="py-2 font-bold text-center">Unité</th>
                            <th className="py-2 font-bold text-center">Qté</th>
                            {meta.type !== 'Bon de transfert' && (
                                <>
                                    <th className="py-2 font-bold text-right">Prix Unit.</th>
                                    <th className="py-2 font-bold text-right">Total HT</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="py-3 pr-2 align-top">{item.description} {item.tva < 19 && <span className="text-[10px] bg-slate-100 px-1 rounded ml-1 text-slate-500">TVA {item.tva}%</span>}</td>
                                <td className="py-3 text-center align-top">{item.unit}</td>
                                <td className="py-3 text-center align-top">{item.quantity}</td>
                                {meta.type !== 'Bon de transfert' && (
                                    <>
                                        <td className="py-3 text-right align-top">{fmt(item.price)}</td>
                                        <td className="py-3 text-right font-medium align-top">{fmt(item.quantity * item.price)}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {meta.type !== 'Bon de transfert' && (
                    <div className="flex justify-end mb-8">
                        <div className="w-1/2 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Total HT</span>
                                <span className="font-medium">{fmt(totals.totalHT)} DA</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Total TVA</span>
                                <span className="font-medium">{fmt(totals.totalTVA)} DA</span>
                            </div>
                            {totals.timbre > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Droit de Timbre</span>
                                    <span className="font-medium">{fmt(totals.timbre)} DA</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                                <span>NET À PAYER</span>
                                <span>{fmt(totals.netAPayer)} DA</span>
                            </div>
                        </div>
                    </div>
                )}

                {meta.type !== 'Bon de transfert' && (
                    <div className="mb-12 text-sm italic text-slate-600 border-t border-slate-100 pt-4">
                        Arrêté la présente {meta.type.toLowerCase()} à la somme de : <br/>
                        <b>... (Sera converti en toutes lettres dans le PDF) ...</b>
                    </div>
                )}

                <div className="flex justify-between items-end mt-auto pt-8">
                    <div className="text-xs text-slate-500 w-1/2">
                        {meta.type !== 'Bon de transfert' && (
                            <>
                                <p className="font-bold text-slate-700 mb-1">Mode de Paiement : {meta.paymentMethod}</p>
                                {issuer.bank && <p>Banque : {issuer.bank}</p>}
                                {issuer.rib && <p>RIB : {issuer.rib}</p>}
                            </>
                        )}
                    </div>
                    <div className="w-48 h-24 border-2 border-slate-300 rounded flex items-center justify-center text-slate-300 font-bold uppercase text-xs text-center p-2">
                        Cachet et Signature<br/>(Livreur / Émetteur)
                    </div>
                </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ToolInvoicing;