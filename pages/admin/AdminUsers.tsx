
import React, { useEffect, useState } from 'react';
import { userService } from '../../src/services/userService';
import { permissionService, AVAILABLE_FEATURES, RolePermissions } from '../../src/services/permissionService';
import { User, UserRole } from '../../src/context/AuthContext';

interface RoleConfigDisplay {
  label: string;
  description: string;
  limit: string;
}

const INITIAL_ROLE_DISPLAY: Record<string, RoleConfigDisplay> = {
  free: { label: 'Gratuit', description: 'Accès essentiel pour démarrer', limit: '1 Projet' },
  premium: { label: 'Premium', description: 'Pack complet pour les pros', limit: 'Illimité' },
  admin: { label: 'Administrateur', description: 'Gestion totale du système', limit: 'N/A' }
};

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [roleDisplays, setRoleDisplays] = useState(INITIAL_ROLE_DISPLAY);
  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoleData();
    window.addEventListener('comptalink-users-changed', loadUsers);
    return () => window.removeEventListener('comptalink-users-changed', loadUsers);
  }, []);

  const loadUsers = () => {
    setUsers(userService.getAllUsers());
  };

  const loadRoleData = () => {
    setRolePermissions(permissionService.getPermissions());
    const savedDisplay = localStorage.getItem('comptalink_role_displays');
    if (savedDisplay) setRoleDisplays(JSON.parse(savedDisplay));
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        // Enregistrement définitif dans le stockage
        userService.updateUserProfile(editingUser.id, editingUser);
        
        // Fermeture de la modale et notification
        setEditingUser(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Rechargement immédiat de la liste locale
        loadUsers();
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("Supprimer cet utilisateur définitivement ?")) {
      userService.deleteUser(userId);
      loadUsers();
    }
  };

  const handleTogglePermission = (featureId: string) => {
    if (!editingRoleKey) return;
    setRolePermissions(prev => {
        const currentPerms = prev[editingRoleKey] || [];
        const newPerms = currentPerms.includes(featureId)
            ? currentPerms.filter(id => id !== featureId)
            : [...currentPerms, featureId];
        return { ...prev, [editingRoleKey]: newPerms };
    });
  };

  const handleSaveRoleConfig = () => {
    permissionService.savePermissions(rolePermissions);
    localStorage.setItem('comptalink_role_displays', JSON.stringify(roleDisplays));
    setEditingRoleKey(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'premium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'free': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const featuresByCategory = AVAILABLE_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FEATURES>);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs & Accès</h1>
          <p className="text-slate-500 text-sm">Gérez les comptes clients et configurez les droits d'accès.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}>Comptes Utilisateurs</button>
            <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}>Paramétrage Rôles</button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in shadow-sm">
          <span className="material-symbols-outlined">check_circle</span> Mise à jour réussie.
        </div>
      )}

      {activeTab === 'users' && (
        <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'admin', 'premium', 'free'].map((role) => (
                        <button key={role} onClick={() => setRoleFilter(role as any)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all border ${roleFilter === role ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{role === 'all' ? 'Tous' : role}</button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input type="text" placeholder="Rechercher..." className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-primary/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs">
                            <tr>
                                <th className="p-4 pl-6">Utilisateur</th>
                                <th className="p-4">Entreprise</th>
                                <th className="p-4">Rôle</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border border-slate-200" alt={user.name} />
                                            <div>
                                                <p className="font-bold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-slate-700">{user.companyName || 'N/A'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <button onClick={() => setEditingUser({...user})} className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">edit_note</span></button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined">delete</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setEditingUser(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Édition Profil</h2>
                    <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleSaveUser} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Assignation du Rôle</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['free', 'premium', 'admin', 'guest'].map(r => (
                                <button 
                                    key={r} 
                                    type="button"
                                    onClick={() => setEditingUser({...editingUser, role: r as UserRole})}
                                    className={`p-3 rounded-xl border-2 font-bold text-xs uppercase transition-all ${editingUser.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Informations de base</label>
                        <input type="text" className="w-full p-3 border rounded-xl mb-3" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder="Nom complet" />
                        <input type="text" className="w-full p-3 border rounded-xl" value={editingUser.companyName || ''} onChange={e => setEditingUser({...editingUser, companyName: e.target.value})} placeholder="Nom de l'entreprise" />
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 text-slate-500 font-bold">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-primary-dark transition-all">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {Object.keys(roleDisplays).map((key) => (
                <div key={key} className={`bg-white rounded-xl shadow-sm border overflow-hidden border-slate-200`}>
                    <div className="p-6">
                        <h3 className="font-bold text-lg text-slate-800">{roleDisplays[key].label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{roleDisplays[key].description}</p>
                        <div className="mt-6 pt-6 border-t">
                            <button onClick={() => setEditingRoleKey(key)} className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">Gérer les permissions</button>
                        </div>
                    </div>
                </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default AdminUsers;
