
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Shim sécurisé pour éviter que l'application ne plante si 'process.env' n'est pas injecté par le build
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

/**
 * Récupération des variables d'environnement (Vite / Process)
 */
const getEnv = (key: string): string => {
  try {
    const meta = import.meta as any;
    if (meta?.env && meta.env[key]) return meta.env[key];
  } catch (e) {}
  
  try {
    if (process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return "";
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

// Indicateur pour savoir si on est en mode réel ou simulé
export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http'));

/**
 * Simulateur pour le développement sans clés API
 */
const createMockSupabase = () => {
  console.warn("⚠️ CONFIGURATION SUPABASE MANQUANTE : Mode 'Simulateur' activé.");

  const getStorage = (table: string) => {
    try {
      return JSON.parse(localStorage.getItem(`mock_db_${table}`) || "[]");
    } catch { return []; }
  };

  const createChain = (table: string, data: any[]) => {
    const api: any = {
      select: () => api,
      order: () => api,
      limit: (n: number) => createChain(table, data.slice(0, n)),
      eq: (col: string, val: any) => createChain(table, data.filter(item => item[col] === val)),
      single: async () => ({ data: data[0] || null, error: null }),
      insert: async (values: any) => {
        const current = getStorage(table);
        const payload = Array.isArray(values) ? values : [values];
        const newItems = payload.map(v => ({ 
          ...v, 
          id: v.id || Math.random().toString(36).substr(2, 9), 
          created_at: new Date().toISOString() 
        }));
        localStorage.setItem(`mock_db_${table}`, JSON.stringify([...current, ...newItems]));
        return { data: newItems, error: null };
      },
      update: (values: any) => ({
        eq: (col: string, val: any) => {
          const current = getStorage(table);
          const updated = current.map((item: any) => item[col] === val ? { ...item, ...values } : item);
          localStorage.setItem(`mock_db_${table}`, JSON.stringify(updated));
          return Promise.resolve({ data: values, error: null });
        }
      }),
      delete: () => ({
        eq: (col: string, val: any) => {
          const current = getStorage(table);
          localStorage.setItem(`mock_db_${table}`, JSON.stringify(current.filter((item: any) => item[col] !== val)));
          return Promise.resolve({ error: null });
        }
      }),
      then: (resolve: any) => resolve({ data, error: null })
    };
    return api;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: JSON.parse(sessionStorage.getItem('mock_session') || 'null') }, error: null }),
      onAuthStateChange: (callback: any) => {
        const handler = () => callback(sessionStorage.getItem('mock_session') ? 'SIGNED_IN' : 'SIGNED_OUT', JSON.parse(sessionStorage.getItem('mock_session') || 'null'));
        window.addEventListener('storage', handler);
        return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handler) } } };
      },
      signInWithPassword: async ({ email }: any) => {
        if (email === 'admin@comptalink.dz') {
            const session = { user: { id: 'admin-id', email: 'admin@comptalink.dz' } };
            sessionStorage.setItem('mock_session', JSON.stringify(session));
            return { data: { session, user: session.user }, error: null };
        }
        return { data: { user: null }, error: new Error("Utilisez l'accès démo admin.") };
      },
      signOut: async () => { sessionStorage.removeItem('mock_session'); return { error: null }; }
    },
    from: (table: string) => createChain(table, getStorage(table))
  } as any;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();
