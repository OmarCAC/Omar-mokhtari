
import { siteSettingsStorage } from "../../../services/siteSettingsStorage";

export type MediaPage = 'home' | 'about' | 'services' | 'tools' | 'blog';

export interface ManagedAsset {
  id: string;
  page: MediaPage;
  label: string;
  url: string;
  key: string;
  type: 'setting';
}

export const mediaStorage = {
  getSiteAssets: (): ManagedAsset[] => {
    const settings = siteSettingsStorage.getSettings();
    const assets: ManagedAsset[] = [];

    // 1. Accueil
    assets.push({
      id: 'asset-home-hero',
      page: 'home',
      label: 'Image de fond Hero',
      url: settings.homeHeroImage,
      key: 'homeHeroImage',
      type: 'setting'
    });

    // 2. Manifeste
    assets.push({
      id: 'asset-about-hero',
      page: 'about',
      label: 'Visuel Doctrine (À Propos)',
      url: settings.aboutHeroSubtitle,
      key: 'aboutHeroSubtitle',
      type: 'setting'
    });

    // 3. Excellence
    assets.push({
      id: 'asset-services-hero',
      page: 'services',
      label: 'Bannière Intercalaire Excellence',
      url: settings.servicesHeroImage,
      key: 'servicesHeroImage',
      type: 'setting'
    });

    // 4. Arsenal Tech
    assets.push({
      id: 'asset-tools-hero',
      page: 'tools',
      label: 'Fond Hero Arsenal',
      url: settings.toolsHeroImage,
      key: 'toolsHeroImage',
      type: 'setting'
    });

    // 5. Savoir
    assets.push({
      id: 'asset-blog-hero',
      page: 'blog',
      label: 'Fond Hero Savoir',
      url: settings.blogHeroImage,
      key: 'blogHeroImage',
      type: 'setting'
    });

    return assets;
  },

  updateAssetUrl: (asset: ManagedAsset, newUrl: string): void => {
    if (asset.type === 'setting') {
      const settings = siteSettingsStorage.getSettings();
      siteSettingsStorage.saveSettings({
        ...settings,
        [asset.key]: newUrl
      });
    }
  }
};
