
import { supabase } from "../lib/supabase";

export interface SavedProject {
  id: string;
  type: string;
  name: string;
  date: string;
  data: any;
}

// Fix: Add missing DashboardStats interface
export interface DashboardStats {
  totalRevenue: number;
  pendingRevenue: number;
  projectedCash: number;
  invoicesCount: number;
  projectsCount: number;
  monthlyData: { month: string; income: number; expense: number; }[];
}

export const userStorage = {
  getProjects: async (): Promise<SavedProject[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) return [];
    return data.map(p => ({
      id: p.id,
      type: p.type,
      name: p.name,
      date: p.updated_at,
      data: p.data
    }));
  },

  saveProject: async (project: any): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non connecté");

    const payload = {
      user_id: session.user.id,
      type: project.type,
      name: project.name,
      data: project.data,
      updated_at: new Date().toISOString()
    };

    if (project.id && project.id.length > 20) {
      const { data } = await supabase.from('user_projects').update(payload).eq('id', project.id).select().single();
      return data.id;
    } else {
      const { data } = await supabase.from('user_projects').insert([payload]).select().single();
      return data.id;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    await supabase.from('user_projects').delete().eq('id', id);
  },

  getUserProfile: () => {
    // Note: Le profil est géré par AuthContext via la table 'profiles'
    return JSON.parse(localStorage.getItem('comptalink_user_profile') || '{}');
  },

  getStorageUsage: () => 0, // Plus pertinent en mode Cloud

  getAggregatedStats: async (): Promise<DashboardStats> => {
    const projects = await userStorage.getProjects();
    return {
        totalRevenue: 0,
        pendingRevenue: 0,
        projectedCash: 0,
        invoicesCount: projects.filter(p => p.type === 'invoice').length,
        projectsCount: projects.length,
        monthlyData: []
    };
  }
};
