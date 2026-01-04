
const LIMIT_KEY = 'comptalink_chat_limit';
const MAX_REQUESTS = 10;
const WINDOW_MS = 60000; // 1 minute

export const rateLimiting = {
  checkLimit: (): { allowed: boolean; remaining: number } => {
    const now = Date.now();
    const stored = localStorage.getItem(LIMIT_KEY);
    let requests: number[] = stored ? JSON.parse(stored) : [];

    // Nettoyer les requêtes hors de la fenêtre de temps
    requests = requests.filter(timestamp => now - timestamp < WINDOW_MS);
    
    if (requests.length >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0 };
    }

    requests.push(now);
    localStorage.setItem(LIMIT_KEY, JSON.stringify(requests));
    
    return { 
      allowed: true, 
      remaining: MAX_REQUESTS - requests.length 
    };
  }
};
