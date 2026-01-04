
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/userService';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  
  const { login, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Redirection automatique si déjà admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
        navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if ((location.state as any)?.message) {
        setInfoMessage((location.state as any).message);
        if (isLogin && (location.state as any).message.toLowerCase().includes('créez')) {
            setIsLogin(false);
        }
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      
      const sessionUser = userService.findUserByEmail(email);
      if (sessionUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      alert("Erreur d'authentification : " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    setIsLoading(true);
    try {
        // On s'assure que l'admin est bien chargé dans le service
        const adminEmail = 'admin@comptalink.dz';
        await login(adminEmail, 'admin');
        navigate('/admin');
    } catch (e) {
        alert("Erreur de connexion forcée à l'administration.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Retour au site
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 relative">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {isLogin ? 'Accès Privé' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin ? 'Accédez à votre terminal de gestion' : 'Rejoignez l\'élite entrepreneuriale'}
          </p>
        </div>

        {infoMessage && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-fade-in">
                <p className="text-sm text-blue-700 font-medium">{infoMessage}</p>
            </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom complet</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm" placeholder="Votre nom" />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Adresse email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            {isLoading ? 'Traitement...' : (isLogin ? 'Ouvrir la session' : "Créer mon espace")}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-primary hover:underline">
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà membre ? Se connecter"}
          </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100">
            <button 
                type="button"
                onClick={handleAdminDemo}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
            >
                <span className="material-symbols-outlined text-sm text-primary">shield_person</span>
                Accès Administrateur Système
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
