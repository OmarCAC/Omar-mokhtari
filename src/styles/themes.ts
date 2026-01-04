
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    bgLight: string;
    bgDark: string;
    textMain: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  ui: {
    radius: string;
    shadow: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'professional',
    name: 'Bleu Executive (Défaut)',
    colors: {
      primary: '#1d85ed',
      primaryDark: '#0f172a',
      secondary: '#475569',
      accent: '#38bdf8',
      bgLight: '#f8fafc',
      bgDark: '#020617',
      textMain: '#1e293b'
    },
    fonts: {
      display: 'Manrope',
      body: 'Manrope'
    },
    ui: {
      radius: '16px',
      shadow: '0 10px 30px -5px rgba(29, 133, 237, 0.1)'
    }
  },
  {
    id: 'startup',
    name: 'Vert Innovation',
    colors: {
      primary: '#10b981',
      primaryDark: '#064e3b',
      secondary: '#334155',
      accent: '#f59e0b',
      bgLight: '#f0fdf4',
      bgDark: '#022c22',
      textMain: '#064e3b'
    },
    fonts: {
      display: 'Plus Jakarta Sans',
      body: 'Plus Jakarta Sans'
    },
    ui: {
      radius: '24px',
      shadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)'
    }
  },
  {
    id: 'luxury',
    name: 'Or & Carbone',
    colors: {
      primary: '#d4af37',
      primaryDark: '#1a1a1a',
      secondary: '#a1a1aa',
      accent: '#ffffff',
      bgLight: '#ffffff',
      bgDark: '#0a0a0a',
      textMain: '#1a1a1a'
    },
    fonts: {
      display: 'Montserrat',
      body: 'Manrope'
    },
    ui: {
      radius: '0px',
      shadow: '0 0 0 1px rgba(212, 175, 55, 0.3)'
    }
  },
  {
    id: 'modern_dark',
    name: 'Nuit Algéroise',
    colors: {
      primary: '#6366f1',
      primaryDark: '#1e1b4b',
      secondary: '#94a3b8',
      accent: '#f43f5e',
      bgLight: '#f8fafc',
      bgDark: '#030712',
      textMain: '#111827'
    },
    fonts: {
      display: 'Space Grotesk',
      body: 'Manrope'
    },
    ui: {
      radius: '12px',
      shadow: '0 4px 20px rgba(99, 102, 241, 0.15)'
    }
  }
];
