
export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isVisible: boolean;
  isExternal: boolean;
  order: number;
  parentId?: string;
  accessLevel: 'public' | 'member' | 'admin';
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
  youtube: string;
  tiktok: string;
}

export interface ThemeCustomization {
  primary?: string;
  accent?: string;
  fontDisplay?: string;
  fontBody?: string;
  radius?: string;
}

export interface PageSeo {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonical?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

export interface SiteSettings {
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  footerText: string;
  messageRetentionDays: number;
  defaultThemeId: string;
  themeCustomizations: Record<string, ThemeCustomization>;
  mainMenu: MenuItem[];
  socialLinks: SocialLinks;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroImage: string;
  homePrimaryCta: { label: string; link: string };
  homeSecondaryCta: { label: string; link: string };
  homeServicesTitle: string;
  homeServicesSubtitle: string;
  servicesHeroImage: string; // Ajouté
  toolsHeroImage: string; // Ajouté
  blogHeroImage: string; // Ajouté
  aboutHeroTitle: string;
  aboutHeroSubtitle: string;
  aboutVisionSubtitle: string;
  aboutVisionTitle: string;
  aboutPhilosophyTitle: string;
  aboutPhilosophyText: string;
  aboutPillars: any[];
  seo: Record<string, PageSeo>;
  testimonials: Testimonial[];
}

const STORAGE_KEY = 'comptalink_v12_stable_master';

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Omar Benali',
    role: 'CEO, Horizon Tech DZ',
    content: 'Compalik a transformé notre vision financière. Leur approche technologique de la comptabilité nous permet de piloter notre croissance avec une précision chirurgicale.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 't2',
    name: 'Leila Kassimi',
    role: 'Directrice Financière, Atlas Group',
    content: 'La rigueur des experts de Compalik est exemplaire. En Algérie, il est rare de trouver une telle alliance entre conformité réglementaire et vision stratégique.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 't3',
    name: 'Karim Mansouri',
    role: 'Fondateur, Fintech Solutions',
    content: 'Grâce à l\'ingénierie fiscale de Compalik, nous avons optimisé nos ressources dès la première année. Un partenaire indispensable pour tout entrepreneur ambitieux.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'Compalik',
  logo: '', 
  address: 'Alger Centre, Algérie',
  phone: '+213 (0) 550 00 00 00',
  email: 'contact@compalik.dz',
  footerText: 'Bâtir l\'infrastructure du succès pour l\'élite entrepreneuriale algérienne.',
  messageRetentionDays: 365,
  defaultThemeId: 'professional',
  themeCustomizations: {},
  mainMenu: [
    { id: 'm1', label: 'ACCUEIL', path: '/', isVisible: true, isExternal: false, order: 1, accessLevel: 'public' },
    { id: 'm2', label: 'MANIFESTE', path: '/about', isVisible: true, isExternal: false, order: 2, accessLevel: 'public' },
    { id: 'm3', label: 'EXCELLENCE', path: '/services', isVisible: true, isExternal: false, order: 3, accessLevel: 'public' },
    { id: 'm4', label: 'ARSENAL TECH', path: '/outils', isVisible: true, isExternal: false, order: 4, accessLevel: 'public' },
    { id: 'm5', label: 'SAVOIR', path: '/blog', isVisible: true, isExternal: false, order: 5, accessLevel: 'public' },
    { id: 'm6', label: 'CONTACT', path: '/contact', isVisible: true, isExternal: false, order: 6, accessLevel: 'public' },
  ],
  socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '', whatsapp: '213', youtube: '', tiktok: '' },
  homeHeroTitle: 'Bâtir la puissance de demain.',
  homeHeroSubtitle: 'Compalik redéfinit l\'expertise comptable en Algérie : une alliance entre rigueur absolue et intelligence souveraine.',
  homeHeroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
  homePrimaryCta: { label: 'Commencer l\'ascension', link: '/services' },
  homeSecondaryCta: { label: 'Calculateur', link: '/outils/calculateur-honoraires' },
  homeServicesTitle: 'Pôles d\'Ingénierie',
  homeServicesSubtitle: 'Une ingénierie financière conçue pour la domination du marché.',
  servicesHeroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop',
  toolsHeroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
  blogHeroImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop',
  aboutHeroTitle: 'Dominer par la Précision.',
  aboutHeroSubtitle: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  aboutVisionSubtitle: 'Le savoir est la seule véritable richesse de l\'entrepreneur moderne.',
  aboutVisionTitle: 'Notre Doctrine',
  aboutPhilosophyTitle: 'L\'humain guidé par la technologie.',
  aboutPhilosophyText: 'L\'innovation n\'est utile que si elle sert une ambition souveraine.',
  aboutPillars: [],
  seo: {},
  testimonials: DEFAULT_TESTIMONIALS
};

export const siteSettingsStorage = {
  getSettings: (): SiteSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored);
      
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        themeCustomizations: parsed.themeCustomizations || {},
        testimonials: (parsed.testimonials && parsed.testimonials.length > 0) 
          ? parsed.testimonials 
          : DEFAULT_TESTIMONIALS
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: SiteSettings): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('site-settings-updated'));
    window.dispatchEvent(new Event('storage'));
  }
};
