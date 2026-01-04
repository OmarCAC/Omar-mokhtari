
import { useState, useEffect, useCallback } from 'react';
import { THEMES, ThemeConfig } from '../styles/themes';
import { siteSettingsStorage } from '../../services/siteSettingsStorage';

export const useTheme = () => {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    const session = localStorage.getItem('comptalink_theme_id');
    if (session) return session;
    return siteSettingsStorage.getSettings().defaultThemeId;
  });

  const applyTheme = useCallback((themeId: string) => {
    const root = document.documentElement;
    const settings = siteSettingsStorage.getSettings();
    const baseTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const custom = settings.themeCustomizations?.[themeId] || {};
    
    // Fusion des couleurs
    const primary = custom.primary || baseTheme.colors.primary;
    const accent = custom.accent || baseTheme.colors.accent;
    
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-dark', baseTheme.colors.primaryDark);
    root.style.setProperty('--color-secondary', baseTheme.colors.secondary);
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-bg-light', baseTheme.colors.bgLight);
    root.style.setProperty('--color-bg-dark', baseTheme.colors.bgDark);
    
    // Fusion Typographie
    root.style.setProperty('--font-display', custom.fontDisplay || baseTheme.fonts.display);
    root.style.setProperty('--font-body', custom.fontBody || baseTheme.fonts.body);
    
    // Fusion UI
    root.style.setProperty('--radius-theme', custom.radius || baseTheme.ui.radius);
    root.style.setProperty('--shadow-theme', baseTheme.ui.shadow);

    localStorage.setItem('comptalink_theme_id', themeId);
  }, []);

  useEffect(() => {
    applyTheme(currentThemeId);

    const handleUpdate = () => {
        const settings = siteSettingsStorage.getSettings();
        if (!localStorage.getItem('comptalink_theme_id')) {
            setCurrentThemeId(settings.defaultThemeId);
        } else {
            // Re-appliquer même si l'ID est le même pour prendre en compte les changements de couleurs
            applyTheme(currentThemeId);
        }
    };

    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, [currentThemeId, applyTheme]);

  return {
    currentTheme: THEMES.find(t => t.id === currentThemeId) || THEMES[0],
    setTheme: (id: string) => setCurrentThemeId(id),
    allThemes: THEMES,
    refresh: () => applyTheme(currentThemeId)
  };
};
