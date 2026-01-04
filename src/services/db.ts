
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BlogPost, Category, BlogStats } from '../../types';

interface ComptaLinkDB extends DBSchema {
  posts: {
    key: string;
    value: BlogPost;
    indexes: { 'by-date': string };
  };
  categories: {
    key: string;
    value: Category;
  };
  stats: {
    key: string;
    value: BlogStats;
  };
}

const DB_NAME = 'comptalink-db-v2'; // Changement de version pour forcer une structure propre
const DB_VERSION = 1;

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<ComptaLinkDB>>;

  constructor() {
    this.requestPersistence();
    this.dbPromise = openDB<ComptaLinkDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('posts')) {
          const postStore = db.createObjectStore('posts', { keyPath: 'id' });
          postStore.createIndex('by-date', 'createdAt');
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'postId' });
        }
      },
    });
  }

  private async requestPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  }

  // Assure que la DB est prête avant toute opération
  private async getDB() {
    return await this.dbPromise;
  }

  async getAllPosts(): Promise<BlogPost[]> {
    const db = await this.getDB();
    return db.getAllFromIndex('posts', 'by-date');
  }

  async getPostById(id: string): Promise<BlogPost | undefined> {
    const db = await this.getDB();
    return db.get('posts', id);
  }

  async savePost(post: BlogPost): Promise<void> {
    const db = await this.getDB();
    await db.put('posts', post);
  }

  async deletePost(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('posts', id);
  }

  async clearPosts(): Promise<void> {
    const db = await this.getDB();
    await db.clear('posts');
  }

  async getAllCategories(): Promise<Category[]> {
    const db = await this.getDB();
    return db.getAll('categories');
  }

  async saveCategory(category: Category): Promise<void> {
    const db = await this.getDB();
    await db.put('categories', category);
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('categories', id);
  }

  async clearCategories(): Promise<void> {
    const db = await this.getDB();
    await db.clear('categories');
  }

  async getStats(postId: string): Promise<BlogStats | undefined> {
    const db = await this.getDB();
    return db.get('stats', postId);
  }

  async saveStats(stats: BlogStats): Promise<void> {
    const db = await this.getDB();
    await db.put('stats', stats);
  }

  async clearStats(): Promise<void> {
    const db = await this.getDB();
    await db.clear('stats');
  }
}

export const dbService = new DatabaseService();
