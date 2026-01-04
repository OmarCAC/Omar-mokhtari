
import { BlogPost, BlogStats, BlogUser, Category, INITIAL_CHECKLIST } from "../types";
import { dbService } from "../src/services/db";

// Mock Users
export const MOCK_USERS: BlogUser[] = [
  { id: 'u1', name: 'Admin Principal', role: 'admin', avatar: '' },
  { id: 'u2', name: 'Amina Kaddour', role: 'author', avatar: '' },
  { id: 'u3', name: 'Karim Zitouni', role: 'editor', avatar: '' },
];

// Catégories par défaut
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Fiscalité', slug: 'fiscalite', color: 'bg-red-100 text-red-800', description: 'Tout sur les impôts et taxes en Algérie.', isVisible: true },
  { id: 'c2', name: 'Juridique', slug: 'juridique', color: 'bg-blue-100 text-blue-800', description: 'Droit des affaires et réglementations.', isVisible: true },
  { id: 'c3', name: 'Social', slug: 'social', color: 'bg-green-100 text-green-800', description: 'Gestion RH, CNAS et contrats.', isVisible: true },
  { id: 'c4', name: 'Entrepreneuriat', slug: 'entrepreneuriat', color: 'bg-purple-100 text-purple-800', description: 'Conseils pour lancer et gérer sa boite.', isVisible: true },
  { id: 'c5', name: 'Technologie', slug: 'technologie', color: 'bg-indigo-100 text-indigo-800', description: 'Digitalisation et outils modernes.', isVisible: true },
  { id: 'c6', name: 'Conseils', slug: 'conseils', color: 'bg-orange-100 text-orange-800', description: 'Astuces de gestion au quotidien.', isVisible: true },
];

const INITIAL_POSTS_DATA: BlogPost[] = [
  {
    id: 'post-1',
    title: "Comment choisir son statut juridique en Algérie ?",
    slug: "choisir-statut-juridique-algerie",
    summary: "SARL, EURL, SPA... Entre les différentes formes juridiques, le choix peut s'avérer difficile. Nous décryptons pour vous les avantages et inconvénients.",
    content: "<h2>Choisir le bon statut juridique</h2><p>C'est une étape cruciale pour tout entrepreneur en Algérie. Ce choix impacte votre fiscalité, votre responsabilité et votre gestion quotidienne.</p><h3>1. La SARL (Société à Responsabilité Limitée)</h3><p>C'est la forme la plus répandue pour les PME. Elle nécessite au moins deux associés. L'avantage principal est que la responsabilité est limitée aux apports.</p><h3>2. L'EURL (Entreprise Unipersonnelle à Responsabilité Limitée)</h3><p>C'est une SARL à associé unique. Parfaite pour se lancer seul tout en protégeant son patrimoine personnel.</p><h3>3. La SPA (Société Par Actions)</h3><p>Réservée aux grands projets nécessitant des capitaux importants. Elle offre une crédibilité forte mais impose une gestion plus lourde.</p>",
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFnP7bgFOlVL_BumPxcmghjbVlub_ixMnEVIRelf42fwA9uKiqKNcCJsYETrL060_BieVgfilm-rg5imyuXbr2l0XE3m_w0CxCoaeZ3Yo4zsvPFJ7MTcmtOrxgn2TPJVHceLWUZBBWGPQhIcu9ZI8LdhJ5ngX9bB4AeGGR16XoBPJuayOhNQ6u0-BT2mE2LYyV1CbLva6nPQKxzEvnuRR1Bq9dv0m94s8Rg7H7uOwlXmYV4GMu6jxepgV9V715POVWnEUI0LCkvhfO",
    featuredImageAlt: "Statut juridique entreprise",
    categoryId: 'c2', 
    tagIds: [],
    status: 'published',
    authorId: 'u2',
    createdAt: new Date('2024-05-15').toISOString(),
    updatedAt: new Date('2024-05-15').toISOString(),
    publishedAt: new Date('2024-05-15').toISOString(),
    targetKeywords: ['statut juridique', 'SARL', 'EURL'],
    wordCount: 150,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: true
  },
  {
    id: 'post-2',
    title: "Guide complet de la déclaration d'impôts G50",
    slug: "guide-declaration-g50",
    summary: "La déclaration mensuelle G50 est une obligation pour la plupart des entreprises. Retrouvez notre tutoriel pas à pas pour ne rien manquer.",
    content: "<h2>Comprendre la G50</h2><p>La G50 est le formulaire unique pour déclarer et payer vos impôts mensuels (TAP, TVA, IRG, IBS...).</p><ul><li><strong>Quand déclarer ?</strong> Au plus tard le 20 du mois suivant.</li><li><strong>Cadre TAP :</strong> Indiquez le chiffre d'affaires imposable.</li><li><strong>Cadre TVA :</strong> Détaillez la TVA collectée et déductible.</li></ul><p>Conseil : Utilisez nos outils pour pré-calculer les montants.</p>",
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvqPyvhM99XbvcYi-UHtDT6U-GMEMlNVL4uSOGyyZRttKyGPOl1ND7Jc6nxpnUBvJltr9Yr69v8mBBecxB5aDiVlmtjWyIq44OwbTuy35lFgZrUmuNy7SDu32ssJ7mFLHncRrCD5ZVt6MHZPiKSi0IRalOm_2m626AB9hv6upqVBpu2vZ2vQDbgsOa5j0_sQ1qTiOUiI7TPnXeTCBUfpZQ6FDBt1QS3u6ymQwwEMBLKacWiY-i5GlC45y8aMUr0XCb2pyH9W8cpjkC",
    featuredImageAlt: "Déclaration G50 Algérie",
    categoryId: 'c1',
    tagIds: [],
    status: 'published',
    authorId: 'u3',
    createdAt: new Date('2024-05-10').toISOString(),
    updatedAt: new Date('2024-05-10').toISOString(),
    publishedAt: new Date('2024-05-10').toISOString(),
    targetKeywords: ['G50', 'Impots', 'Fiscalité'],
    wordCount: 120,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: false
  }
];

export const BlogService = {
  
  // --- MIGRATION & INIT ---
  ensureDataInitialized: async () => {
    try {
      const dbPosts = await dbService.getAllPosts();
      
      // Tentative de récupération depuis le miroir local si la DB est vide mais qu'un backup existe
      if (dbPosts.length === 0) {
        const mirrorPosts = localStorage.getItem('comptalink_blog_posts_mirror');
        if (mirrorPosts) {
            console.log("Restauration depuis le miroir local...");
            const parsed = JSON.parse(mirrorPosts);
            if (Array.isArray(parsed) && parsed.length > 0) {
                for (const post of parsed) {
                    await dbService.savePost(post);
                    await BlogService.initStats(post.id);
                }
                return true;
            }
        }

        console.log("DB et Miroir vides : injection des données de démo...");
        for (const cat of DEFAULT_CATEGORIES) {
            await dbService.saveCategory(cat);
        }
        for (const post of INITIAL_POSTS_DATA) {
          await dbService.savePost(post);
          await BlogService.initStats(post.id);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Erreur init DB:", e);
      return false;
    }
  },

  resetDatabase: async () => {
      try {
          await dbService.clearPosts();
          await dbService.clearCategories();
          await dbService.clearStats();
          localStorage.removeItem('comptalink_blog_posts');
          localStorage.removeItem('comptalink_blog_categories');
          localStorage.removeItem('comptalink_blog_posts_mirror'); // Clean mirror too
          await BlogService.ensureDataInitialized();
          return true;
      } catch (e) {
          console.error("Erreur Reset DB:", e);
          return false;
      }
  },

  deleteAllPosts: async () => {
      try {
          await dbService.clearPosts();
          await dbService.clearStats();
          localStorage.removeItem('comptalink_blog_posts_mirror');
          return true;
      } catch (e) {
          console.error("Erreur suppression totale:", e);
          return false;
      }
  },

  // --- SAUVEGARDE & RESTAURATION (FICHIER) ---
  createBackup: async (): Promise<string> => {
    const posts = await dbService.getAllPosts();
    const categories = await dbService.getAllCategories();
    const backup = {
      timestamp: new Date().toISOString(),
      posts,
      categories,
      version: "1.0"
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.posts || !Array.isArray(data.posts)) throw new Error("Format invalide: pas d'articles trouvés");
      
      // On restaure les catégories si présentes
      if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          await dbService.saveCategory(cat);
        }
      }

      // On restaure les articles
      for (const post of data.posts) {
        await dbService.savePost(post);
        await BlogService.initStats(post.id);
      }
      
      // Mise à jour du miroir
      try {
        localStorage.setItem('comptalink_blog_posts_mirror', JSON.stringify(data.posts));
      } catch (e) {
        console.warn("Mise à jour du miroir échouée lors de la restauration (Quota LS dépassé)");
      }
      
      return true;
    } catch (e) {
      console.error("Erreur restauration backup:", e);
      return false;
    }
  },

  // --- SAUVEGARDE D'URGENCE (MIRRORING) ---
  syncToMirror: async () => {
    try {
      const posts = await dbService.getAllPosts();
      localStorage.setItem('comptalink_blog_posts_mirror', JSON.stringify(posts));
    } catch (e) {
      // Si le quota est dépassé, on ignore silencieusement.
      // L'essentiel est que dbService (IndexedDB) a réussi à sauvegarder l'article.
      console.warn("Mirroring failed (Quota exceeded), but data is safe in IndexedDB.");
    }
  },

  recoverFromMirror: async (): Promise<number> => {
      const mirror = localStorage.getItem('comptalink_blog_posts_mirror');
      if (mirror) {
          const posts = JSON.parse(mirror);
          if (Array.isArray(posts)) {
              for (const post of posts) {
                  await dbService.savePost(post);
              }
              return posts.length;
          }
      }
      return 0;
  },

  // --- Categories ---
  getCategories: async (): Promise<Category[]> => {
    try {
        const cats = await dbService.getAllCategories();
        if (!Array.isArray(cats) || cats.length === 0) {
            return DEFAULT_CATEGORIES;
        }
        return cats;
    } catch (e) {
        return DEFAULT_CATEGORIES;
    }
  },

  saveCategory: async (category: Category): Promise<void> => {
    if (category.isVisible === undefined) category.isVisible = true;
    if (!category.id) category.id = Date.now().toString();
    await dbService.saveCategory(category);
  },

  deleteCategory: async (id: string): Promise<void> => {
    await dbService.deleteCategory(id);
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const cats = await BlogService.getCategories();
    return cats.find(c => c.id === id);
  },

  // --- Posts ---
  getAllPosts: async (): Promise<BlogPost[]> => {
    try {
        const posts = await dbService.getAllPosts();
        if (posts.length === 0) {
            return [];
        }
        return posts.reverse();
    } catch (e) {
        console.error("Erreur récupération articles:", e);
        return [];
    }
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const post = await dbService.getPostById(id);
    if (!post) {
        // Fallback: chercher dans le miroir localStorage si IDB échoue
        const mirror = localStorage.getItem('comptalink_blog_posts_mirror');
        if (mirror) {
            const posts = JSON.parse(mirror);
            const backupPost = posts.find((p: BlogPost) => p.id === id);
            if (backupPost) return backupPost;
        }
        return INITIAL_POSTS_DATA.find(p => p.id === id);
    }
    return post;
  },

  getRelatedPosts: async (currentPostId: string, categoryId: string, limit: number = 3): Promise<BlogPost[]> => {
    const allPosts = await BlogService.getAllPosts();
    return allPosts
      .filter(p => p.id !== currentPostId && p.categoryId === categoryId && p.status === 'published')
      .slice(0, limit);
  },

  savePost: async (post: BlogPost): Promise<void> => {
    const now = new Date().toISOString();
    const updatedPost = {
      ...post,
      updatedAt: now,
      publishedAt: post.status === 'published' && !post.publishedAt ? now : post.publishedAt,
      createdAt: post.createdAt || now
    };
    await dbService.savePost(updatedPost);
    await BlogService.initStats(post.id);
    
    // MISE A JOUR DU MIROIR DE SECURITÉ
    await BlogService.syncToMirror();
  },

  importPosts: async (newPosts: BlogPost[]): Promise<number> => {
    const currentPosts = await BlogService.getAllPosts();
    let importedCount = 0;

    for (const post of newPosts) {
      const exists = currentPosts.some(p => p.id === post.id || p.slug === post.slug);
      
      if (!exists) {
        const completePost = {
            ...post,
            id: post.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
            createdAt: post.createdAt || new Date().toISOString(),
            updatedAt: post.updatedAt || new Date().toISOString(),
            status: post.status || 'draft',
            wordCount: post.wordCount || BlogService.calculateWordCount(post.content || ''),
            qualityChecklist: post.qualityChecklist || { ...INITIAL_CHECKLIST }
        };
        
        await dbService.savePost(completePost as BlogPost);
        await BlogService.initStats(completePost.id);
        importedCount++;
      }
    }
    
    // Sync après import
    if (importedCount > 0) {
        await BlogService.syncToMirror();
    }
    
    return importedCount;
  },

  deletePost: async (id: string): Promise<void> => {
    await dbService.deletePost(id);
    await BlogService.syncToMirror(); // Sync après suppression
  },

  togglePin: async (id: string): Promise<void> => {
    const post = await dbService.getPostById(id);
    if (post) {
      post.isPinned = !post.isPinned;
      await dbService.savePost(post);
      await BlogService.syncToMirror(); // Sync après modif
    }
  },

  // --- Stats ---
  getStats: async (postId: string): Promise<BlogStats | undefined> => {
    return await dbService.getStats(postId);
  },

  initStats: async (postId: string) => {
    const existing = await dbService.getStats(postId);
    if (!existing) {
      await dbService.saveStats({
        postId,
        views: 0,
        avgReadTimeSeconds: 0,
        primaryCtaClicks: 0,
        shares: 0,
        lastUpdatedAt: new Date().toISOString()
      });
    }
  },

  incrementViews: async (postId: string) => {
    const stats = await dbService.getStats(postId);
    if (stats) {
      stats.views += 1;
      await dbService.saveStats(stats);
    } else {
      await BlogService.initStats(postId);
    }
  },

  // --- Utils ---
  calculateWordCount: (html: string): number => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  },

  calculateReadTime: (wordCount: number): number => {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  }
};

// Export sécurisé
export const CATEGORIES = DEFAULT_CATEGORIES;
