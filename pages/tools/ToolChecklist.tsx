
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pdfService } from '../../src/services/pdfService';

// --- TYPES ---

interface Task {
  id: number;
  title: string;
  details?: string;
  resource?: string;
  time?: string;
  phaseId: number;
}

interface Section {
  title: string;
  tasks: Task[];
}

interface Phase {
  id: number;
  name: string;
  icon: string;
  duration: string;
  description: string;
  sections: Section[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
}

interface AppState {
  completedTasks: number[];
  unlockedBadges: string[];
  started: boolean;
}

// --- DATA ---

const PHASES: Phase[] = [
  {
    id: 1,
    name: "Idéation & Validation",
    icon: "💡",
    duration: "0-2 semaines",
    description: "Valider l'idée, le problème, la solution et le marché",
    sections: [
      {
        title: "Définir l'idée",
        tasks: [
          { id: 1, title: "Identifier un problème spécifique et urgent", details: "Décrivez le pain point en 1-2 phrases. Qui souffre de ce problème ? Quelle ampleur ?", resource: "Template Problem Statement", time: "1 heure", phaseId: 1 },
          { id: 2, title: "Imaginer une solution innovante", details: "Décrivez votre solution. En quoi est-elle différente de l'existant ?", resource: "Template Solution Description", time: "2 heures", phaseId: 1 },
          { id: 3, title: "Définir votre proposition de valeur unique (UVP)", details: "Complétez: Notre [produit/service] aide [cible] à [bénéfice] grâce à [différenciation]", resource: "Value Proposition Canvas", time: "1 heure", phaseId: 1 },
          { id: 4, title: "Identifier votre marché cible (buyer persona)", details: "Créez 1-3 personas détaillés: âge, profession, problèmes, motivations", resource: "Template Buyer Persona", time: "2 heures", phaseId: 1 },
          { id: 5, title: "Évaluer la taille du marché (TAM/SAM/SOM)", details: "Estimez le marché total, adressable, et capturable", resource: "Calculateur Market Size", time: "3 heures", phaseId: 1 }
        ]
      },
      {
        title: "Valider l'idée",
        tasks: [
          { id: 6, title: "Réaliser 20 interviews de clients potentiels", details: "Interrogez votre cible sur le problème et leur intérêt pour votre solution", resource: "Script d'interview", time: "1 semaine", phaseId: 1 },
          { id: 7, title: "Analyser les concurrents (5 minimum)", details: "Listez concurrents directs et indirects, leurs forces/faiblesses", resource: "Template Analyse Concurrentielle", time: "4 heures", phaseId: 1 },
          { id: 8, title: "Créer un Lean Canvas", details: "Résumé 1-page de votre business model", resource: "Lean Canvas Generator", time: "1 heure", phaseId: 1 },
          { id: 9, title: "Tester l'intérêt avec landing page MVP", details: "Créez page web simple expliquant votre concept + formulaire email", resource: "Outils: Carrd, Tally", time: "4 heures", phaseId: 1 },
          { id: 10, title: "Mesurer l'intérêt (target: 50+ emails)", details: "Diffusez landing page sur réseaux sociaux, groupes, forums", time: "1 semaine", phaseId: 1 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Business Plan & Pitch",
    icon: "📋",
    duration: "2-4 semaines",
    description: "Créer business plan et pitch deck professionnels",
    sections: [
      {
        title: "Business Plan",
        tasks: [
          { id: 16, title: "Rédiger Executive Summary", resource: "Outil Business Plan", time: "3 heures", phaseId: 2 },
          { id: 17, title: "Rédiger section Problème et Solution", time: "4 heures", phaseId: 2 },
          { id: 18, title: "Rédiger Analyse de Marché", resource: "Templates", time: "6 heures", phaseId: 2 },
          { id: 19, title: "Rédiger Modèle Économique et Prévisions", resource: "Outil Prévisions Financières", time: "8 heures", phaseId: 2 },
          { id: 20, title: "Finaliser Business Plan complet", resource: "Template Business Plan", time: "2 jours", phaseId: 2 }
        ]
      },
      {
        title: "Pitch Deck",
        tasks: [
          { id: 22, title: "Créer slide Problème", time: "1 heure", phaseId: 2 },
          { id: 23, title: "Créer slides Solution, Produit, Marché", time: "3 heures", phaseId: 2 },
          { id: 24, title: "Créer slides Business Model, Traction, Équipe", time: "3 heures", phaseId: 2 },
          { id: 25, title: "Designer pitch deck (graphisme pro)", resource: "Outils: Canva, Figma", time: "4 heures", phaseId: 2 },
          { id: 26, title: "Répéter le pitch (10 fois minimum)", details: "Entraînez-vous à pitcher en 5, 10, et 15 minutes", time: "1 semaine", phaseId: 2 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Création Juridique",
    icon: "🏢",
    duration: "4-6 semaines",
    description: "Immatriculation, RC, NIF, statuts, registres",
    sections: [
      {
        title: "Structure & Statuts",
        tasks: [
          { id: 28, title: "Choisir la forme juridique (EURL, SARL, SPA)", resource: "Guide Formes Juridiques", time: "2 heures", phaseId: 3 },
          { id: 31, title: "Rédiger les statuts notariés", resource: "Chez le notaire", time: "1-2 jours", phaseId: 3 },
          { id: 33, title: "Déposer le capital social à la banque", details: "Ouvrir compte bloqué. Min: 100.000 DA (EURL/SARL)", time: "1 jour", phaseId: 3 }
        ]
      },
      {
        title: "Administratif",
        tasks: [
          { id: 35, title: "Constituer le dossier CNRC", details: "Statuts, bail, casier judiciaire, etc.", resource: "Checklist CNRC", time: "3 jours", phaseId: 3 },
          { id: 36, title: "Dépôt et obtention du Registre de Commerce", details: "Coût: ~10.000-15.000 DA", time: "3-7 jours", phaseId: 3 },
          { id: 43, title: "Obtenir le NIF et NIS", details: "Auprès des impôts (DGI) et ONS", time: "1 semaine", phaseId: 3 },
          { id: 45, title: "Déclaration d'existence (G01)", details: "Dans les 30 jours début activité", resource: "Formulaire G01", time: "1 jour", phaseId: 3 },
          { id: 48, title: "Affiliation CNAS / CASNOS", details: "Sécurité sociale employeur et gérant", time: "2 jours", phaseId: 3 }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Branding & Identité",
    icon: "🎨",
    duration: "4-6 semaines",
    description: "Nom, logo, charte graphique, marque INAPI",
    sections: [
      {
        title: "Identité Visuelle",
        tasks: [
          { id: 53, title: "Brainstorming nom de marque", resource: "Outils: Namelix", time: "4 heures", phaseId: 4 },
          { id: 54, title: "Vérifier disponibilité (.dz, INAPI)", time: "2 heures", phaseId: 4 },
          { id: 56, title: "Dépôt de marque INAPI", details: "Protection de la propriété intellectuelle", time: "1 jour", phaseId: 4 },
          { id: 58, title: "Création du Logo & Charte Graphique", details: "Couleurs, typographie, déclinaisons", time: "2 semaines", phaseId: 4 }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Développement MVP",
    icon: "💻",
    duration: "6-12 semaines",
    description: "Développer et lancer le Minimum Viable Product",
    sections: [
      {
        title: "Conception",
        tasks: [
          { id: 65, title: "Cahier des charges technique", details: "Fonctionnalités clés du MVP", time: "1 semaine", phaseId: 5 },
          { id: 66, title: "Choix de la stack technique", time: "2 jours", phaseId: 5 },
          { id: 68, title: "Roadmap de développement", time: "1 jour", phaseId: 5 }
        ]
      },
      {
        title: "Développement & Test",
        tasks: [
          { id: 71, title: "Développement Sprint 1 (Core)", time: "2 semaines", phaseId: 5 },
          { id: 76, title: "Beta Test (Early Adopters)", details: "Feedback de 10-20 utilisateurs", time: "2 semaines", phaseId: 5 },
          { id: 80, title: "Mise en production (Launch)", time: "1 jour", phaseId: 5 }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Label & Financement",
    icon: "💰",
    duration: "8-14 semaines",
    description: "Obtenir label startup et lever des fonds",
    sections: [
      {
        title: "Label Startup",
        tasks: [
          { id: 84, title: "Inscription sur startup.dz", time: "30 min", phaseId: 6 },
          { id: 89, title: "Soumission dossier Label", details: "BP, Pitch, RC, NIF, MVP", time: "2 heures", phaseId: 6 },
          { id: 90, title: "Présentation devant le Comité", time: "1 jour", phaseId: 6 }
        ]
      },
      {
        title: "Levée de fonds",
        tasks: [
          { id: 91, title: "Calculer valorisation", resource: "Outil Valorisation", time: "2 heures", phaseId: 6 },
          { id: 94, title: "Contacter investisseurs (ASF, VC)", time: "Continu", phaseId: 6 }
        ]
      }
    ]
  }
];

const BADGES: Badge[] = [
  { id: 'visionnaire', name: 'Visionnaire', icon: '🚀', description: 'Idée validée (Phase 1 complétée)', condition: 'phase_1' },
  { id: 'planificateur', name: 'Planificateur', icon: '📋', description: 'Business Plan prêt (Phase 2 complétée)', condition: 'phase_2' },
  { id: 'officiel', name: 'Officiel', icon: '🏢', description: 'Entreprise créée (Phase 3 complétée)', condition: 'phase_3' },
  { id: 'creatif', name: 'Créatif', icon: '🎨', description: 'Identité définie (Phase 4 complétée)', condition: 'phase_4' },
  { id: 'batisseur', name: 'Bâtisseur', icon: '💻', description: 'MVP lancé (Phase 5 complétée)', condition: 'phase_5' },
  { id: 'labellise', name: 'Labellisé', icon: '🏆', description: 'Prêt pour le Label (Phase 6 complétée)', condition: 'phase_6' },
];

const ToolChecklist: React.FC = () => {
  const [state, setState] = useState<AppState>({
    completedTasks: [],
    unlockedBadges: [],
    started: false
  });
  
  const [activePhase, setActivePhase] = useState<number | null>(1);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('comptalink_checklist_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('comptalink_checklist_state', JSON.stringify(state));
  }, [state]);

  const toggleTask = (taskId: number, phaseId: number) => {
    setState(prev => {
      const isCompleted = prev.completedTasks.includes(taskId);
      const newCompleted = isCompleted 
        ? prev.completedTasks.filter(id => id !== taskId)
        : [...prev.completedTasks, taskId];
      
      // Check badges
      const newBadges = [...prev.unlockedBadges];
      
      // Check phase completion for badge
      const phaseTasks = PHASES.find(p => p.id === phaseId)?.sections.flatMap(s => s.tasks.map(t => t.id)) || [];
      const isPhaseComplete = phaseTasks.every(id => newCompleted.includes(id));
      
      if (isPhaseComplete) {
        const badgeId = BADGES.find(b => b.condition === `phase_${phaseId}`)?.id;
        if (badgeId && !newBadges.includes(badgeId)) {
          newBadges.push(badgeId);
          triggerConfetti();
        }
      }

      return {
        ...prev,
        completedTasks: newCompleted,
        unlockedBadges: newBadges
      };
    });
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const startChecklist = () => {
    setState(prev => ({ ...prev, started: true }));
    window.scrollTo(0, 0);
  };

  const resetProgress = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser toute votre progression ?")) {
      setState({ completedTasks: [], unlockedBadges: [], started: false });
    }
  };

  const exportPdf = () => {
    const totalTasks = PHASES.reduce((acc, p) => acc + p.sections.reduce((a, s) => a + s.tasks.length, 0), 0);
    const percent = Math.round((state.completedTasks.length / totalTasks) * 100);
    
    pdfService.generateChecklistPdf({
        phases: PHASES,
        completedTasks: state.completedTasks,
        percent
    });
  };

  // Calculs
  const totalTasks = PHASES.reduce((acc, p) => acc + p.sections.reduce((a, s) => a + s.tasks.length, 0), 0);
  const progressPercent = Math.round((state.completedTasks.length / totalTasks) * 100);

  // Render Helpers
  const renderConfetti = () => {
    if (!showConfetti) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random()}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 4)]
            }}
          />
        ))}
      </div>
    );
  };

  // --- VIEWS ---

  if (!state.started) {
    return (
      <div className="bg-background-light min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            ✅ Checklist Création Startup DZ
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Le guide ultime étape par étape pour transformer votre idée en startup à succès en Algérie. Suivez le parcours, débloquez des badges et lancez votre projet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-black text-primary mb-2">{totalTasks}</div>
              <div className="text-slate-500 font-medium">Tâches organisées</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-black text-primary mb-2">{PHASES.length}</div>
              <div className="text-slate-500 font-medium">Phases clés</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-black text-primary mb-2">{BADGES.length}</div>
              <div className="text-slate-500 font-medium">Badges à débloquer</div>
            </div>
          </div>

          <button 
            onClick={startChecklist}
            className="px-10 py-5 bg-primary text-white text-xl font-bold rounded-2xl hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/30"
          >
            Commencer mon parcours 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen py-12 px-4">
      {renderConfetti()}
      <div className="max-w-6xl mx-auto">
        
        {/* Header / Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Progress Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Votre Progression</h2>
                <span className="text-3xl font-black text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-sm text-slate-500 text-right">{state.completedTasks.length}/{totalTasks} tâches complétées</p>
            </div>
            
            <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
              {BADGES.map(badge => {
                const isUnlocked = state.unlockedBadges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`flex flex-col items-center p-3 min-w-[100px] rounded-xl border-2 transition-all ${isUnlocked ? 'border-yellow-400 bg-yellow-50 opacity-100 scale-105' : 'border-slate-100 bg-slate-50 opacity-50 grayscale'}`}
                    title={badge.description}
                  >
                    <span className="text-3xl mb-1">{badge.icon}</span>
                    <span className="text-xs font-bold text-slate-700 text-center leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Rechercher une tâche</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Ex: Statuts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Filtrer par statut</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setFilter('all')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
                >
                  Tout
                </button>
                <button 
                  onClick={() => setFilter('todo')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'todo' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
                >
                  A faire
                </button>
                <button 
                  onClick={() => setFilter('done')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'done' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
                >
                  Fait
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
                <button onClick={exportPdf} className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">download</span> PDF
                </button>
                <button onClick={resetProgress} className="flex-1 py-2 text-xs text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-lg font-bold">
                    Réinitialiser
                </button>
            </div>
          </div>
        </div>

        {/* Phases & Tasks */}
        <div className="space-y-6">
          {PHASES.map((phase) => {
            // Filtrage des tâches
            const phaseTasks = phase.sections.flatMap(s => s.tasks);
            const visibleTasks = phaseTasks.filter(t => {
              const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
              const isCompleted = state.completedTasks.includes(t.id);
              const matchesFilter = filter === 'all' || (filter === 'done' && isCompleted) || (filter === 'todo' && !isCompleted);
              return matchesSearch && matchesFilter;
            });

            const completedCount = phaseTasks.filter(t => state.completedTasks.includes(t.id)).length;
            const phaseProgress = Math.round((completedCount / phaseTasks.length) * 100);
            const isOpen = activePhase === phase.id || searchTerm.length > 0;

            if (visibleTasks.length === 0 && filter !== 'all') return null;

            return (
              <div key={phase.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isOpen ? 'border-primary/30 ring-4 ring-primary/5' : 'border-slate-200 hover:border-primary/20'}`}>
                
                {/* Phase Header */}
                <div 
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setActivePhase(isOpen ? null : phase.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-3xl shadow-sm">
                      {phase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{phase.name}</h3>
                      <p className="text-sm text-slate-500">{phase.duration} • {completedCount}/{phaseTasks.length} tâches</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-full transition-all" style={{ width: `${phaseProgress}%` }}></div>
                    </div>
                    <span className="font-bold text-sm text-slate-700 w-10 text-right">{phaseProgress}%</span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </div>

                {/* Task List */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-8 animate-fade-in">
                    {phase.sections.map((section, sIdx) => {
                      // Filter section tasks based on global filter
                      const sectionVisibleTasks = section.tasks.filter(t => visibleTasks.includes(t));
                      if (sectionVisibleTasks.length === 0) return null;

                      return (
                        <div key={sIdx}>
                          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-4 pl-2 border-l-4 border-primary">
                            {section.title}
                          </h4>
                          <div className="space-y-3">
                            {sectionVisibleTasks.map((task) => {
                              const isChecked = state.completedTasks.includes(task.id);
                              return (
                                <div 
                                  key={task.id} 
                                  onClick={() => toggleTask(task.id, phase.id)}
                                  className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-primary/50 hover:shadow-sm'}`}
                                >
                                  <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 group-hover:border-primary'}`}>
                                    {isChecked && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h5 className={`font-bold text-base mb-1 ${isChecked ? 'text-green-800 line-through decoration-green-500/50' : 'text-slate-900'}`}>
                                      {task.title}
                                    </h5>
                                    {task.details && (
                                      <p className="text-sm text-slate-600 mb-2">{task.details}</p>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-3 mt-2">
                                      {task.time && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                                          {task.time}
                                        </span>
                                      )}
                                      {task.resource && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                          <span className="material-symbols-outlined text-[14px]">link</span>
                                          {task.resource}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Besoin d'un accompagnement personnalisé ?</h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Cette checklist est un excellent point de départ. Pour aller plus loin et sécuriser chaque étape, nos experts sont là pour vous.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Contacter un expert
            </Link>
            <Link to="/outils/business-plan" className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
              Faire mon Business Plan
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ToolChecklist;
