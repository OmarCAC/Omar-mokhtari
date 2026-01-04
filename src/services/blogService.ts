
import { BlogPost, BlogStats, BlogUser, Category, INITIAL_CHECKLIST } from "../../types";
import { supabase } from "../lib/supabase";

export const MOCK_USERS: BlogUser[] = [
  { id: 'u1', name: 'Admin Principal', role: 'admin', avatar: '' },
];

export const BlogService = {
  
  // Catégories
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('blog_categories').select('*').order('name');
    if (error) return [];
    return data.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: c.color,
      description: c.description,
      isVisible: c.is_visible
    }));
  },

  saveCategory: async (category: Category): Promise<void> => {
    const payload = {
      name: category.name,
      slug: category.slug,
      color: category.color,
      description: category.description,
      is_visible: category.isVisible
    };
    if (category.id && !category.id.startsWith('c')) {
      await supabase.from('blog_categories').update(payload).eq('id', category.id);
    } else {
      await supabase.from('blog_categories').insert([payload]);
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    await supabase.from('blog_categories').delete().eq('id', id);
  },

  // Articles
  getAllPosts: async (): Promise<BlogPost[]> => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      content: p.content,
      featuredImageUrl: p.featured_image_url,
      featuredImageAlt: p.featured_image_alt || p.title,
      categoryId: p.category_id,
      tagIds: p.target_keywords || [],
      status: p.status,
      authorId: p.author_id,
      createdAt: p.created_at,
      publishedAt: p.published_at,
      updatedAt: p.updated_at,
      targetKeywords: p.target_keywords || [],
      wordCount: p.word_count,
      qualityChecklist: INITIAL_CHECKLIST,
      isPinned: p.is_pinned
    }));
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
      ...data,
      categoryId: data.category_id,
      featuredImageUrl: data.featured_image_url,
      isPinned: data.is_pinned,
      wordCount: data.word_count
    } as any;
  },

  savePost: async (post: BlogPost): Promise<void> => {
    const payload = {
      title: post.title,
      slug: post.slug || post.title.toLowerCase().replace(/ /g, '-'),
      summary: post.summary,
      content: post.content,
      featured_image_url: post.featuredImageUrl,
      category_id: post.categoryId,
      status: post.status,
      is_pinned: post.isPinned,
      word_count: post.wordCount,
      target_keywords: post.targetKeywords,
      published_at: post.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    if (post.id && post.id.length > 20) { // UUID check simple
      await supabase.from('blog_posts').update(payload).eq('id', post.id);
    } else {
      await supabase.from('blog_posts').insert([payload]);
    }
  },

  deletePost: async (id: string): Promise<void> => {
    await supabase.from('blog_posts').delete().eq('id', id);
  },

  incrementViews: async (postId: string) => {
    // Optionnel : nécessite une table de stats ou un champ views
  },

  calculateWordCount: (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).length;
  }
};
