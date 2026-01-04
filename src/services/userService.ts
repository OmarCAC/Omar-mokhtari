
import { User, UserRole } from "../context/AuthContext";

const USERS_DB_KEY = "comptalink_users_db_v6"; // Incrément de version pour forcer la mise à jour

const SYSTEM_ADMIN: User = {
  id: "u-admin",
  name: "Administrateur",
  email: "admin@comptalink.dz",
  role: "admin",
  companyName: "Compalik HQ",
  avatar: "https://ui-avatars.com/api/?name=Admin&background=1d85ed&color=fff"
};

export const userService = {
  getAllUsers: (): User[] => {
    try {
      const stored = localStorage.getItem(USERS_DB_KEY);
      let users: User[] = stored ? JSON.parse(stored) : [SYSTEM_ADMIN];
      
      // Sécurité : Vérifier si l'admin système est présent, sinon l'ajouter
      const adminExists = users.some(u => u.email === SYSTEM_ADMIN.email);
      if (!adminExists) {
        users = [SYSTEM_ADMIN, ...users];
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
      
      return users;
    } catch {
      return [SYSTEM_ADMIN];
    }
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = userService.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: (name: string, email: string, role: UserRole = 'free'): User => {
    const users = userService.getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("Cet email est déjà utilisé.");

    const newUser: User = {
      id: 'u-' + Date.now(),
      name,
      email,
      role,
      companyName: '',
      legalForm: 'SARL',
      address: '',
      nif: '',
      rc: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d85ed&color=fff`
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
    window.dispatchEvent(new Event('comptalink-users-changed'));
    return newUser;
  },

  updateUserProfile: (userId: string, data: Partial<User>): void => {
    const users = userService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      
      const session = localStorage.getItem('comptalink_active_session');
      if (session) {
          const parsedSession = JSON.parse(session);
          if (parsedSession.id === userId) {
              localStorage.setItem('comptalink_active_session', JSON.stringify(users[index]));
          }
      }
      
      window.dispatchEvent(new Event('comptalink-users-changed'));
    }
  },

  deleteUser: (userId: string): void => {
    const users = userService.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('comptalink-users-changed'));
  }
};
