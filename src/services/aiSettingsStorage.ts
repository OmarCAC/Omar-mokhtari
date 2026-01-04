
export interface AgentConfig {
  model: string;
  systemInstruction: string;
  welcomeMessage?: string;
  temperature: number;
}

export interface ExpertProfile {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
  prompt: string;
}

export interface AiSettings {
  globalContext: string;
  chatbot: AgentConfig;
  blog: AgentConfig;
  ocr: AgentConfig;
  advisor: AgentConfig;
  studioExperts: ExpertProfile[];
}

const STORAGE_KEY = 'comptalink_ai_settings_v5_final';

const DEFAULT_GLOBAL_CONTEXT = `Tu es l'intelligence artificielle de "ComptaLink", cabinet d'expertise comptable leader en Algérie. 
Notre mission est d'apporter une rigueur absolue et une clarté totale à la gestion des entreprises algériennes.`;

const BLOG_SYSTEM_INSTRUCTION = `Tu es le Directeur de Rédaction Technique de Compalik. Ta mission est de transformer des notes brutes en un « Rapport d'Audit & Expertise Premium » au format HTML pur.

DIRECTIVES CRITIQUES DE STRUCTURE :
1. EXPLOITATION MAXIMALE : Ne résume jamais. Pour chaque point cité dans les notes, rédige une analyse technique détaillée. Transforme une simple note en un paragraphe d'expert.
2. TABLEAUX EXÉCUTIFS OBLIGATOIRES : Dès qu'il y a plus de deux chiffres, dates ou éléments comparatifs, crée un tableau HTML luxueux (voir catalogue).
3. RICHESSE EN CONSEILS (6 MINIMUM) : Tu dois insérer au minimum 3 blocs « Conseil Compalik » et 3 blocs « Vigilance Réglementaire » répartis dans le texte.
4. DEVISE ALGERIENNE : Tous les montants doivent impérativement comporter le suffixe « DA » (ex: 150.000 DA).
5. TYPOGRAPHIE : INTERDICTION ABSOLUE DES ASTÉRISQUES (**). Utilise « » ou <strong>.

CATALOGUE DE COMPOSANTS HTML PREMIUM :

1. TABLEAU DE BORD EXÉCUTIF :
<div class="overflow-x-auto my-12 rounded-[2.5rem] border border-slate-200 shadow-2xl bg-white select-none" contenteditable="false"><table class="w-full text-sm text-left border-collapse"><thead class="bg-slate-900 text-white uppercase text-[10px] font-black tracking-[0.3em]"><tr><th class="p-6">Indicateur / Désignation</th><th class="p-6 text-right">Valeur Stratégique (DA)</th></tr></thead><tbody class="divide-y divide-slate-100"><tr class="hover:bg-slate-50/80 transition-colors"><td class="p-6 font-bold text-slate-800" contenteditable="true">Libellé de l'élément</td><td class="p-6 text-right font-mono text-primary font-black" contenteditable="true">0.000,00 DA</td></tr></tbody></table></div>

2. BLOC CONSEIL COMPALIK (Bleu - 3 minimum) :
<div class="p-8 my-10 rounded-[3rem] border-l-8 bg-blue-50/50 border-blue-500 text-blue-900 flex gap-6 shadow-sm items-start" contenteditable="false"><span class="material-symbols-outlined text-4xl mt-0.5 text-blue-600">verified</span><div><strong class="block mb-2 text-base font-black uppercase tracking-widest">Le Conseil Compalik</strong><p class="text-sm leading-relaxed opacity-90" contenteditable="true">Analyse technique approfondie et recommandation d'expert...</p></div></div>

3. POINT DE VIGILANCE (Ambre - 3 minimum) :
<div class="p-8 my-10 rounded-[3rem] border-l-8 bg-amber-50/50 border-amber-500 text-amber-900 flex gap-6 shadow-sm items-start" contenteditable="false"><span class="material-symbols-outlined text-4xl mt-0.5 text-amber-600">warning</span><div><strong class="block mb-2 text-base font-black uppercase tracking-widest">Vigilance Réglementaire</strong><p class="text-sm leading-relaxed opacity-90" contenteditable="true">Alerte sur les risques fiscaux, amandes ou échéances critiques...</p></div></div>

4. SOMMAIRE INTERACTIF :
<div class="bg-slate-50 p-10 rounded-[3.5rem] mb-12 border border-slate-200 select-none" contenteditable="false"><strong class="text-primary uppercase tracking-[0.4em] text-[11px] block mb-8 text-center">Structure de l'Expertise</strong><ul class="space-y-4 list-none p-0 m-0"><li><a href="#id" class="text-slate-900 hover:text-primary font-black text-sm transition-all flex items-center gap-3"><span class="w-2 h-2 rounded-full bg-primary"></span> Titre de Section</a></li></ul></div>

5. CONCLUSION SIGNATURE (TEXTE IMPOSÉ) :
<div class="my-20 p-12 bg-slate-900 rounded-[4rem] text-white shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden" contenteditable="false"><div class="absolute top-0 right-0 p-10 opacity-10"><span class="material-symbols-outlined text-[150px]">workspace_premium</span></div><h2 id="conclusion" class="text-primary text-3xl font-black mb-8 tracking-tighter">Synthèse & Recommandations Compalik</h2><p class="text-xl text-slate-300 leading-relaxed italic font-medium" contenteditable="true">Investir dans des statuts rédigés par un professionnel « avocat ou notaire spécialisé » est l'une des meilleures décisions de gestion que vous prendrez au démarrage. Le coût initial, souvent perçu comme une contrainte, est en réalité une prime d'assurance contre les conflits futurs. Des clauses bien pensées sur la gouvernance, la cession de parts ou la sortie d'un associé vous feront économiser du temps, de l'argent et de l'énergie lorsque votre entreprise grandira. Une fois authentifiés, ces statuts deviennent le socle inébranlable de votre aventure entrepreneuriale.</p></div>`;

const DEFAULT_STUDIO_EXPERTS: ExpertProfile[] = [
  {
    id: 'general',
    name: 'Directeur Associé',
    role: 'Expert Stratégie',
    icon: 'account_balance',
    color: 'bg-primary',
    description: 'Expertise globale en gestion et structuration.',
    prompt: 'Tu es le Directeur Associé de ComptaLink.'
  },
  {
    id: 'fiscal',
    name: 'Maître Fiscalist',
    role: 'Audit & Fiscalité',
    icon: 'receipt_long',
    color: 'bg-red-600',
    description: 'Spécialiste Lois de Finances et G50.',
    prompt: 'Tu es l\'expert fiscal de ComptaLink.'
  }
];

const DEFAULT_SETTINGS: AiSettings = {
  globalContext: DEFAULT_GLOBAL_CONTEXT,
  studioExperts: DEFAULT_STUDIO_EXPERTS,
  chatbot: { model: 'gemini-3-flash-preview', temperature: 0.7, welcomeMessage: "Bienvenue au cabinet ComptaLink. Comment puis-je assister votre gestion ?", systemInstruction: "Tu es l'assistant de ComptaLink." },
  blog: { model: 'gemini-3-pro-preview', temperature: 0.8, systemInstruction: BLOG_SYSTEM_INSTRUCTION },
  ocr: { model: 'gemini-3-flash-preview', temperature: 0.1, systemInstruction: "Extrais les données comptables." },
  advisor: { model: 'gemini-3-pro-preview', temperature: 0.4, systemInstruction: "Analyse la rentabilité." }
};

export const aiSettingsStorage = {
  getSettings: (): AiSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings: AiSettings): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('ai-settings-updated'));
  }
};
