
export type BotTone = 'formal' | 'friendly' | 'pedagogic' | 'technical';
export type BotLanguage = 'fr' | 'ar' | 'en';

export interface ChatBotConfig {
  systemPrompt: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  tone: BotTone;
  language: BotLanguage;
  collectLeads: boolean;
  lastModified: string;
  modifiedBy: string;
}

const CONFIG_KEY = 'comptalink_chat_config';

const DEFAULT_CONFIG: ChatBotConfig = {
  systemPrompt: `Tu es l'Expert-Conseil IA de ComptaLink, un cabinet d'expertise comptable digital en Algérie.
Ton ton est professionnel, rassurant et précis. 

DOMAINES D'EXPERTISE :
- Fiscalité Algérienne (G50, IFU, IBS, IRG, TAP/TLS).
- Création d'entreprise (EURL, SARL, SPA, Auto-entrepreneur).
- Labellisation Startup DZ.
- Gestion comptable via le SCF (Système Comptable Financier).

CONSIGNES :
1. Rappelle que ComptaLink utilise l'IA pour automatiser la saisie, réduisant les coûts de 30%.
2. Suggère toujours un RDV avec un expert humain pour les cas complexes.`,
  welcomeMessage: "Bonjour 👋 ! Je suis votre assistant ComptaLink. Je peux vous aider sur la fiscalité algérienne ou la création de votre startup. Que souhaitez-vous savoir ?",
  suggestedQuestions: [
    "Quels sont vos tarifs ?",
    "Comment créer une SARL ?",
    "Avantages du Label Startup ?",
    "Comment faire ma G50 ?"
  ],
  tone: 'pedagogic',
  language: 'fr',
  collectLeads: true,
  lastModified: new Date().toISOString(),
  modifiedBy: 'Système'
};

export const aiConfigService = {
  getConfig: (): ChatBotConfig => {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig: (config: ChatBotConfig): void => {
    const updatedConfig = {
      ...config,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
    window.dispatchEvent(new Event('chat-config-updated'));
  },

  resetToDefault: (): ChatBotConfig => {
    aiConfigService.saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
};
