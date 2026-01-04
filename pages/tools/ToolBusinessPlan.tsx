
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userStorage } from '../../src/services/userStorage';
import { pdfService } from '../../src/services/pdfService';
import AiAdvisor from '../../src/components/AiAdvisor';

// --- TYPES ---

interface Competitor { id: number; name: string; strengths: string; weaknesses: string; price: string; }
interface Product { id: number; name: string; features: string; benefits: string; }
interface Pricing { id: number; name: string; priceHT: number; tva: number; priceTTC: number; }
interface Equipment { id: number; name: string; desc: string; qty: number; cost: number; }
interface Position { id: number; title: string; profile: string; count: number; salary: number; }
interface Investment { id: number; nature: string; amountHT: number; tva: number; amountTTC: number; }

// --- DATA ---

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

const SECTEURS = [
  'Industrie manufacturière', 'Services aux entreprises', 'Commerce',
  'Agriculture', 'Tourisme', 'Restauration', 'Santé', 'Éducation',
  'Technologies', 'Transport', 'BTP', 'Artisanat'
];

const ToolBusinessPlan: React.FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const location = useLocation();
  const [projectId, setProjectId] = useState<string | null>(null);

  // --- STATE ---
  const [formData, setFormData] = useState<any>({
    // Step 1
    nomEntreprise: '', promoteur: '', qualifications: '', nif: '', adresse: '', wilaya: '', telephone: '', email: '',
    typeProjet: 'Création', natureProjet: 'Production', formeJuridique: '', secteur: '', emplois: 0, localisation: '',
    investTotal: 0, fondsPropres: 0, financement: 0, autresFinancements: 0,
    
    // Step 2
    historique: '', descriptionActivite: '', innovation: '',
    vision: '', mission: '', 
    valeur1: '', valeur2: '', valeur3: '',
    objCT1: '', objCT2: '', objCT3: '',
    objMT1: '', objMT2: '', 
    objLT1: '', objLT2: '',

    // Step 3
    secteurCaract: '', tendance1: '', tendance2: '', tendance3: '', opportunites: '',
    zoneChalandise: '', population: '', volumeMarche: 0, croissance: 0,
    partAn1: 0, partAn3: 0, partAn5: 0,
    force1: '', force2: '', force3: '', force4: '', force5: '',
    faiblesse1: '', faiblesse2: '', faiblesse3: '', faiblesse4: '', faiblesse5: '',
    opportunite1: '', opportunite2: '', opportunite3: '', opportunite4: '', opportunite5: '',
    menace1: '', menace2: '', menace3: '', menace4: '', menace5: '',

    // Step 4
    volumeAn1: 0, caAn1: 0, pmAn1: 0,
    volumeAn2: 0, caAn2: 0, pmAn2: 0,
    volumeAn3: 0, caAn3: 0, pmAn3: 0,
    volumeAn4: 0, caAn4: 0, pmAn4: 0,
    volumeAn5: 0, caAn5: 0, pmAn5: 0,
    budgetCom: 0, canalReseaux: false, canalPub: false, canalSalons: false,

    // Step 5
    processus1: '', processus2: '', processus3: '',
    surface: 0, typeLocal: '', amenagements: '',

    // Step 6
    montantCredit: 0, tauxInteret: 7, dureeCredit: 5,
    delaiClients: 30, rotationStock: 30, delaiFournisseurs: 60, achatsMensuels: 0,
    achatsAnnuels: 0, loyer: 0, energie: 0, assurances: 0, autresCharges: 0,

    // Step 7
    notesAnnexes: '',
    docStatuts: false, docRC: false, docNIF: false, docCV: false, docDiplomes: false, docAuto: false
  });

  // Dynamic Tables State
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Load from Dashboard if ID provided
  useEffect(() => {
    if (location.state && (location.state as any).data) {
        const data = (location.state as any).data;
        setFormData(data.formData);
        setCompetitors(data.competitors || []);
        setProducts(data.products || []);
        setPricings(data.pricings || []);
        setEquipments(data.equipments || []);
        setPositions(data.positions || []);
        setInvestments(data.investments || []);
        setStep(data.step || 1);
        setProjectId((location.state as any).projectId);
    } else {
        // CHARGEMENT AUTOMATIQUE DU PROFIL "MON ESPACE"
        const globalProfile = userStorage.getUserProfile();
        if (globalProfile.companyName && globalProfile.companyName !== 'Ma Société') {
            setFormData(prev => ({
                ...prev,
                nomEntreprise: globalProfile.companyName,
                nif: globalProfile.nif,
                adresse: globalProfile.address,
                email: globalProfile.email,
                formeJuridique: globalProfile.legalForm
            }));
        }
    }
  }, [location.state]);

  // --- HELPERS ---
  const formatMoney = (num: number) => new Intl.NumberFormat('fr-DZ').format(num);
  const generateId = () => Date.now();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- CALCULATIONS ---
  
  const getRatioAutonomie = () => {
    const total = (parseFloat(formData.fondsPropres) || 0) + (parseFloat(formData.financement) || 0) + (parseFloat(formData.autresFinancements) || 0);
    if (total === 0) return 0;
    return ((parseFloat(formData.fondsPropres) || 0) / total * 100).toFixed(1);
  };

  const getTotalEquipments = () => equipments.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  const getTotalSalaries = () => positions.reduce((sum, item) => sum + (item.salary * item.count), 0) * 1.26; // +26% charges
  
  const getTotalInvestHT = () => investments.reduce((sum, item) => sum + item.amountHT, 0);
  const getTotalInvestTTC = () => investments.reduce((sum, item) => sum + item.amountTTC, 0);

  const calculateBFR = () => {
    const caMensuel = (parseFloat(formData.caAn1) || 0) / 12;
    const achatsMensuels = parseFloat(formData.achatsMensuels) || 0;
    
    const creances = caMensuel * ((parseFloat(formData.delaiClients) || 0) / 30);
    const stocks = achatsMensuels * ((parseFloat(formData.rotationStock) || 0) / 30);
    const dettes = achatsMensuels * ((parseFloat(formData.delaiFournisseurs) || 0) / 30);
    
    return Math.round(creances + stocks - dettes);
  };

  const calculateFinancials = () => {
    const ca = parseFloat(formData.caAn1) || 0;
    const charges = (parseFloat(formData.achatsAnnuels) || 0) + 
                    (parseFloat(formData.loyer) || 0) + 
                    (parseFloat(formData.energie) || 0) + 
                    (parseFloat(formData.assurances) || 0) + 
                    (parseFloat(formData.autresCharges) || 0) +
                    (getTotalSalaries() * 12);
    
    const ebitda = ca - charges;
    const resultNet = ebitda * 0.81; // Approx after IBS 19% (simplified)
    const invest = parseFloat(formData.investTotal) || getTotalInvestTTC();
    
    const van = (resultNet * 3.79) - invest; // VAN simplifiée 5 ans @10%
    const tri = invest > 0 ? (resultNet / invest * 100).toFixed(1) : "0";
    const roe = (parseFloat(formData.fondsPropres) || 0) > 0 ? (resultNet / parseFloat(formData.fondsPropres) * 100).toFixed(1) : "0";

    return { ca, charges, resultNet, van, tri, roe };
  };

  // --- ACTIONS ---

  // Fix: Await userStorage.saveProject as it returns a Promise<string>
  const handleSaveToDashboard = async () => {
    try {
      const id = await userStorage.saveProject({
          id: projectId || undefined,
          type: 'business-plan',
          name: formData.nomEntreprise || 'Nouveau Business Plan',
          data: { formData, competitors, products, pricings, equipments, positions, investments, step }
      });
      setProjectId(id);
      alert("Projet sauvegardé dans 'Mon Espace' !");
    } catch (error) {
      alert("Une erreur est survenue lors de la sauvegarde.");
    }
  };

  const handleExportPdf = () => {
    const financials = calculateFinancials();
    const bfr = calculateBFR();
    pdfService.generateBusinessPlanPdf(formData, { ...financials, bfr });
  };

  // --- RENDER STEPS ---

  const renderStep = () => {
    switch(step) {
      case 1: // Synthese
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">1. Synthèse Exécutive</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du projet / entreprise</label>
                <input type="text" className="w-full p-2 border rounded" value={formData.nomEntreprise} onChange={e => handleChange('nomEntreprise', e.target.value)} placeholder="Ex: TechSolutions DZ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Porteur de projet</label>
                <input type="text" className="w-full p-2 border rounded" value={formData.promoteur} onChange={e => handleChange('promoteur', e.target.value)} placeholder="Nom & Prénom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wilaya d'implantation</label>
                <select className="w-full p-2 border rounded" value={formData.wilaya} onChange={e => handleChange('wilaya', e.target.value)}>
                  <option value="">Choisir...</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secteur d'activité</label>
                <select className="w-full p-2 border rounded" value={formData.secteur} onChange={e => handleChange('secteur', e.target.value)}>
                  <option value="">Choisir...</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-4">Structure Financière Initiale</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">Investissement Total (DA)</label>
                  <input type="number" className="w-full p-2 border border-blue-200 rounded" value={formData.investTotal} onChange={e => handleChange('investTotal', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">Fonds Propres (DA)</label>
                  <input type="number" className="w-full p-2 border border-blue-200 rounded" value={formData.fondsPropres} onChange={e => handleChange('fondsPropres', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">Emprunt Bancaire (DA)</label>
                  <input type="number" className="w-full p-2 border border-blue-200 rounded" value={formData.financement} onChange={e => handleChange('financement', e.target.value)} />
                </div>
              </div>
              <p className="text-right text-xs text-blue-600 mt-2 font-bold">Ratio d'autonomie : {getRatioAutonomie()}%</p>
            </div>
          </div>
        );

      case 2: // Description
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">2. Description du Projet</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description de l'activité (Pitch)</label>
              <textarea className="w-full p-3 border rounded h-24" value={formData.descriptionActivite} onChange={e => handleChange('descriptionActivite', e.target.value)} placeholder="Que faites-vous ? Quel problème résolvez-vous ?"></textarea>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vision (Long terme)</label>
                <textarea className="w-full p-3 border rounded h-20" value={formData.vision} onChange={e => handleChange('vision', e.target.value)} placeholder="Où voyez-vous l'entreprise dans 5 ans ?"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mission (Raison d'être)</label>
                <textarea className="w-full p-3 border rounded h-20" value={formData.mission} onChange={e => handleChange('mission', e.target.value)} placeholder="Pourquoi cette entreprise existe-t-elle ?"></textarea>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Objectifs à court terme (1 an)</label>
              <div className="grid grid-cols-1 gap-2">
                <input type="text" className="w-full p-2 border rounded" placeholder="Objectif 1" value={formData.objCT1} onChange={e => handleChange('objCT1', e.target.value)} />
                <input type="text" className="w-full p-2 border rounded" placeholder="Objectif 2" value={formData.objCT2} onChange={e => handleChange('objCT2', e.target.value)} />
              </div>
            </div>
          </div>
        );

      case 3: // Marché & SWOT
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">3. Marché & Analyse SWOT</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone de Chalandise</label>
                <select className="w-full p-2 border rounded" value={formData.zoneChalandise} onChange={e => handleChange('zoneChalandise', e.target.value)}>
                  <option value="Locale">Locale</option>
                  <option value="Regionale">Régionale</option>
                  <option value="Nationale">Nationale</option>
                  <option value="Internationale">Internationale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Volume Marché Estimé (DA)</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.volumeMarche} onChange={e => handleChange('volumeMarche', e.target.value)} />
              </div>
            </div>

            {/* Concurrents Dynamique */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-2">Analyse Concurrentielle</h3>
              <div className="space-y-2 mb-3">
                {competitors.map((c, idx) => (
                  <div key={c.id} className="flex gap-2 text-sm">
                    <input className="flex-1 p-2 border rounded" value={c.name} onChange={e => {const n=[...competitors]; n[idx].name=e.target.value; setCompetitors(n)}} placeholder="Nom" />
                    <input className="flex-1 p-2 border rounded" value={c.strengths} onChange={e => {const n=[...competitors]; n[idx].strengths=e.target.value; setCompetitors(n)}} placeholder="Forces" />
                    <input className="w-24 p-2 border rounded" value={c.price} onChange={e => {const n=[...competitors]; n[idx].price=e.target.value; setCompetitors(n)}} placeholder="Prix" />
                    <button onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCompetitors([...competitors, { id: generateId(), name: '', strengths: '', weaknesses: '', price: '' }])} className="text-sm text-primary font-bold">+ Ajouter concurrent</button>
            </div>

            {/* SWOT Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="font-bold text-green-800 mb-2">Forces (Internes)</h4>
                <input className="w-full p-2 mb-2 border rounded text-sm" placeholder="Expertise, Brevet..." value={formData.force1} onChange={e => handleChange('force1', e.target.value)} />
                <input className="w-full p-2 border rounded text-sm" placeholder="..." value={formData.force2} onChange={e => handleChange('force2', e.target.value)} />
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h4 className="font-bold text-red-800 mb-2">Faiblesses (Internes)</h4>
                <input className="w-full p-2 mb-2 border rounded text-sm" placeholder="Marque inconnue, budget..." value={formData.faiblesse1} onChange={e => handleChange('faiblesse1', e.target.value)} />
                <input className="w-full p-2 border rounded text-sm" placeholder="..." value={formData.faiblesse2} onChange={e => handleChange('faiblesse2', e.target.value)} />
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-bold text-blue-800 mb-2">Opportunités (Externes)</h4>
                <input className="w-full p-2 mb-2 border rounded text-sm" placeholder="Croissance marché, aides..." value={formData.opportunite1} onChange={e => handleChange('opportunite1', e.target.value)} />
                <input className="w-full p-2 border rounded text-sm" placeholder="..." value={formData.opportunite2} onChange={e => handleChange('opportunite2', e.target.value)} />
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                <h4 className="font-bold text-orange-800 mb-2">Menaces (Externes)</h4>
                <input className="w-full p-2 mb-2 border rounded text-sm" placeholder="Nouveaux entrants, régulation..." value={formData.menace1} onChange={e => handleChange('menace1', e.target.value)} />
                <input className="w-full p-2 border rounded text-sm" placeholder="..." value={formData.menace2} onChange={e => handleChange('menace2', e.target.value)} />
              </div>
            </div>
          </div>
        );

      case 4: // Stratégie
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">4. Stratégie Commerciale</h2>
            
            {/* Products */}
            <div className="bg-white p-4 border rounded-lg shadow-sm">
              <h3 className="font-bold mb-3">Produits & Services</h3>
              <div className="space-y-2">
                {products.map((p, idx) => (
                  <div key={p.id} className="grid grid-cols-3 gap-2">
                    <input className="p-2 border rounded text-sm" placeholder="Nom Produit" value={p.name} onChange={e => {const n=[...products]; n[idx].name=e.target.value; setProducts(n)}} />
                    <input className="p-2 border rounded text-sm" placeholder="Caractéristiques" value={p.features} onChange={e => {const n=[...products]; n[idx].features=e.target.value; setProducts(n)}} />
                    <div className="flex gap-2">
                      <input className="flex-1 p-2 border rounded text-sm" placeholder="Bénéfice client" value={p.benefits} onChange={e => {const n=[...products]; n[idx].benefits=e.target.value; setProducts(n)}} />
                      <button onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setProducts([...products, { id: generateId(), name: '', features: '', benefits: '' }])} className="mt-2 text-sm font-bold text-primary">+ Ajouter produit</button>
            </div>

            {/* Pricing */}
            <div className="bg-white p-4 border rounded-lg shadow-sm">
              <h3 className="font-bold mb-3">Politique de Prix</h3>
              <div className="space-y-2">
                {pricings.map((p, idx) => (
                  <div key={p.id} className="flex gap-2 items-center text-sm">
                    <input className="flex-[2] p-2 border rounded" placeholder="Produit" value={p.name} onChange={e => {const n=[...pricings]; n[idx].name=e.target.value; setPricings(n)}} />
                    <input type="number" className="flex-1 p-2 border rounded" placeholder="HT" value={p.priceHT} onChange={e => {const n=[...pricings]; n[idx].priceHT=parseFloat(e.target.value); n[idx].priceTTC=n[idx].priceHT*(1+n[idx].tva/100); setPricings(n)}} />
                    <select className="w-20 p-2 border rounded" value={p.tva} onChange={e => {const n=[...pricings]; n[idx].tva=parseFloat(e.target.value); n[idx].priceTTC=n[idx].priceHT*(1+n[idx].tva/100); setPricings(n)}}>
                      <option value="19">19%</option>
                      <option value="9">9%</option>
                      <option value="0">0%</option>
                    </select>
                    <input className="flex-1 p-2 border rounded bg-slate-100" readOnly value={p.priceTTC.toFixed(2)} placeholder="TTC" />
                    <button onClick={() => setPricings(pricings.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setPricings([...pricings, { id: generateId(), name: '', priceHT: 0, tva: 19, priceTTC: 0 }])} className="mt-2 text-sm font-bold text-primary">+ Ajouter prix</button>
            </div>

            {/* Forecast Sales */}
            <div>
              <h3 className="font-bold mb-3">Prévisions de Ventes (Années 1-5)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2">Année</th>
                      <th className="p-2">Volume (U)</th>
                      <th className="p-2">CA (DA)</th>
                      <th className="p-2">Part Marché (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(year => (
                      <tr key={year} className="border-b">
                        <td className="p-2 font-bold">Année {year}</td>
                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={formData[`volumeAn${year}`]} onChange={e => handleChange(`volumeAn${year}`, e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={formData[`caAn${year}`]} onChange={e => handleChange(`caAn${year}`, e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={formData[`pmAn${year}`]} onChange={e => handleChange(`pmAn${year}`, e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 5: // Production
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">5. Plan de Production & RH</h2>
            
            {/* Equipements */}
            <div className="bg-white p-4 border rounded-lg">
              <h3 className="font-bold mb-3">Équipements & Investissements Matériels</h3>
              <div className="space-y-2 mb-2">
                {equipments.map((eq, idx) => (
                  <div key={eq.id} className="flex gap-2 text-sm">
                    <input className="flex-[2] p-2 border rounded" placeholder="Nom" value={eq.name} onChange={e => {const n=[...equipments]; n[idx].name=e.target.value; setEquipments(n)}} />
                    <input type="number" className="w-20 p-2 border rounded" placeholder="Qté" value={eq.qty} onChange={e => {const n=[...equipments]; n[idx].qty=parseFloat(e.target.value); setEquipments(n)}} />
                    <input type="number" className="flex-1 p-2 border rounded" placeholder="Coût unit." value={eq.cost} onChange={e => {const n=[...equipments]; n[idx].cost=parseFloat(e.target.value); setEquipments(n)}} />
                    <button onClick={() => setEquipments(equipments.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setEquipments([...equipments, { id: generateId(), name: '', desc: '', qty: 1, cost: 0 }])} className="text-sm font-bold text-primary">+ Ajouter équipement</button>
                <span className="font-bold">Total: {formatMoney(getTotalEquipments())} DA</span>
              </div>
            </div>

            {/* RH */}
            <div className="bg-white p-4 border rounded-lg">
              <h3 className="font-bold mb-3">Ressources Humaines</h3>
              <div className="space-y-2 mb-2">
                {positions.map((pos, idx) => (
                  <div key={pos.id} className="flex gap-2 text-sm">
                    <input className="flex-[2] p-2 border rounded" placeholder="Poste" value={pos.title} onChange={e => {const n=[...positions]; n[idx].title=e.target.value; setPositions(n)}} />
                    <input type="number" className="w-20 p-2 border rounded" placeholder="Nbr" value={pos.count} onChange={e => {const n=[...positions]; n[idx].count=parseFloat(e.target.value); setPositions(n)}} />
                    <input type="number" className="flex-1 p-2 border rounded" placeholder="Salaire Net" value={pos.salary} onChange={e => {const n=[...positions]; n[idx].salary=parseFloat(e.target.value); setPositions(n)}} />
                    <button onClick={() => setPositions(positions.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setPositions([...positions, { id: generateId(), title: '', profile: '', count: 1, salary: 30000 }])} className="text-sm font-bold text-primary">+ Ajouter poste</button>
                <span className="font-bold">Masse Salariale (+26%): {formatMoney(getTotalSalaries())} DA</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Local & Aménagements</label>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <input type="number" className="p-2 border rounded" placeholder="Surface (m²)" value={formData.surface} onChange={e => handleChange('surface', e.target.value)} />
                <select className="p-2 border rounded" value={formData.typeLocal} onChange={e => handleChange('typeLocal', e.target.value)}>
                  <option value="">Type de bail...</option>
                  <option value="Location">Location</option>
                  <option value="Propriété">Propriété</option>
                  <option value="Domiciliation">Domiciliation</option>
                </select>
              </div>
              <textarea className="w-full p-2 border rounded h-20" placeholder="Description des aménagements nécessaires..." value={formData.amenagements} onChange={e => handleChange('amenagements', e.target.value)}></textarea>
            </div>
          </div>
        );

      case 6: // Finance
        const finance = calculateFinancials();
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">6. Plan Financier</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Investissements */}
              <div className="bg-white p-4 border rounded-lg shadow-sm">
                <h3 className="font-bold mb-3 text-primary">A. Investissements Initiaux</h3>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {investments.map((inv, idx) => (
                    <div key={inv.id} className="flex gap-2 text-xs">
                      <input className="flex-[2] p-1 border rounded" value={inv.nature} onChange={e => {const n=[...investments]; n[idx].nature=e.target.value; setInvestments(n)}} />
                      <input type="number" className="flex-1 p-1 border rounded" value={inv.amountHT} onChange={e => {const n=[...investments]; n[idx].amountHT=parseFloat(e.target.value); n[idx].amountTTC=n[idx].amountHT*(1+n[idx].tva/100); setInvestments(n)}} />
                      <button onClick={() => setInvestments(investments.filter((_, i) => i !== idx))} className="text-red-500">×</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setInvestments([...investments, { id: generateId(), nature: 'Frais préliminaires', amountHT: 0, tva: 19, amountTTC: 0 }])} className="text-xs font-bold text-primary mb-2">+ Ajouter ligne</button>
                <div className="bg-slate-100 p-2 rounded text-right font-bold text-sm">Total TTC: {formatMoney(getTotalInvestTTC())} DA</div>
              </div>

              {/* BFR */}
              <div className="bg-white p-4 border rounded-lg shadow-sm">
                <h3 className="font-bold mb-3 text-primary">B. Besoin en Fonds de Roulement</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <label>Délai Clients (jours)</label>
                    <input type="number" className="w-16 p-1 border rounded text-right" value={formData.delaiClients} onChange={e => handleChange('delaiClients', e.target.value)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <label>Rotation Stock (jours)</label>
                    <input type="number" className="w-16 p-1 border rounded text-right" value={formData.rotationStock} onChange={e => handleChange('rotationStock', e.target.value)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <label>Délai Fournisseurs (jours)</label>
                    <input type="number" className="w-16 p-1 border rounded text-right" value={formData.delaiFournisseurs} onChange={e => handleChange('delaiFournisseurs', e.target.value)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <label>Achats Mensuels Moyens</label>
                    <input type="number" className="w-24 p-1 border rounded text-right" value={formData.achatsMensuels} onChange={e => handleChange('achatsMensuels', e.target.value)} />
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center font-bold text-yellow-800 mt-2">
                    BFR Estimé : {formatMoney(calculateBFR())} DA
                  </div>
                </div>
              </div>
            </div>

            {/* Compte de Résultat Simplifié */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold mb-3">C. Compte de Résultat Prévisionnel (Année 1)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="block text-slate-500 text-xs">Chiffre d'Affaires (HT)</label>
                    <input type="number" className="w-full p-2 border rounded font-bold" value={formData.caAn1} onChange={e => handleChange('caAn1', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs">Achats Consommés</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.achatsAnnuels} onChange={e => handleChange('achatsAnnuels', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs">Loyer Annuel</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.loyer} onChange={e => handleChange('loyer', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="block text-slate-500 text-xs">Masse Salariale (Annuelle)</label>
                    <div className="p-2 bg-white border rounded text-slate-700">{formatMoney(getTotalSalaries() * 12)}</div>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs">Autres Charges (Énergie, Assurance...)</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.autresCharges} onChange={e => handleChange('autresCharges', e.target.value)} />
                  </div>
                  <div className="bg-green-100 p-2 rounded border border-green-200 mt-4">
                    <div className="flex justify-between font-bold text-green-900">
                      <span>Résultat Net Estimé :</span>
                      <span>{formatMoney(finance.resultNet)} DA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicateurs de Rentabilité */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="text-xs text-slate-500 uppercase">VAN (5 ans)</div>
                <div className={`font-black text-lg ${finance.van > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatMoney(finance.van)}</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="text-xs text-slate-500 uppercase">TRI</div>
                <div className="font-black text-lg text-primary">{finance.tri}%</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="text-xs text-slate-500 uppercase">ROE</div>
                <div className="font-black text-lg text-primary">{finance.roe}%</div>
              </div>
            </div>
          </div>
        );

      case 7: // Annexes
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">7. Annexes & Documents</h2>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-4">Checklist des pièces à joindre</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['docStatuts', 'docRC', 'docNIF', 'docCV', 'docDiplomes', 'docAuto'].map(doc => (
                  <label key={doc} className="flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                    <input type="checkbox" checked={formData[doc]} onChange={e => handleChange(doc, e.target.checked)} className="w-5 h-5 text-primary rounded" />
                    <span className="text-sm font-medium">
                      {doc === 'docStatuts' && 'Statuts de la société'}
                      {doc === 'docRC' && 'Registre de Commerce'}
                      {doc === 'docNIF' && 'Carte NIF / NIS'}
                      {doc === 'docCV' && 'CV des fondateurs'}
                      {doc === 'docDiplomes' && 'Diplômes & Certificats'}
                      {doc === 'docAuto' && 'Autorisations spécifiques (agréments)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes Complémentaires (optionnel)</label>
              <textarea 
                className="w-full p-4 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Ajoutez ici toute information supplémentaire utile pour votre business plan..."
                value={formData.notesAnnexes}
                onChange={e => handleChange('notesAnnexes', e.target.value)}
              ></textarea>
            </div>
          </div>
        );

      case 8: // Export
        const financials = calculateFinancials();
        const bfr = calculateBFR();
        
        return (
          <div className="space-y-8 animate-fade-in py-8">
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Votre Business Plan est prêt !</h2>
                <p className="text-slate-600">Vous avez complété toutes les étapes nécessaires.</p>
            </div>

            {/* AI Advisor Integrated */}
            <div className="max-w-2xl mx-auto">
                <AiAdvisor data={{ formData, financials }} type="business-plan" />
            </div>

            <div className="max-w-md mx-auto bg-white p-6 rounded-xl border shadow-sm text-left space-y-3">
              <h3 className="font-bold text-slate-900 border-b pb-2 mb-2">Récapitulatif</h3>
              <div className="flex justify-between text-sm"><span>Entreprise :</span> <strong>{formData.nomEntreprise || '-'}</strong></div>
              <div className="flex justify-between text-sm"><span>Promoteur :</span> <strong>{formData.promoteur || '-'}</strong></div>
              <div className="flex justify-between text-sm"><span>Rentabilité (VAN) :</span> <strong className={financials.van > 0 ? 'text-green-600' : 'text-red-500'}>{formatMoney(financials.van)} DA</strong></div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={handleSaveToDashboard} className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                <span className="material-symbols-outlined">save</span>
                Sauvegarder
              </button>
              <button onClick={handleExportPdf} className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                <span className="material-symbols-outlined">download</span>
                Télécharger PDF
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black text-primary-dark">Générateur Business Plan Pro</h1>
              <p className="text-slate-500">Créez un dossier complet et professionnel en quelques étapes.</p>
            </div>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Étape {step}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${(step/totalSteps)*100}%` }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Précédent
          </button>
          
          {step < totalSteps && (
            <button 
              onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2"
            >
              Suivant <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolBusinessPlan;
