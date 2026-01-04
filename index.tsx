import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Composant de gestion d'erreur global (Error Boundary)
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare props to fix TS error 'Property props does not exist on type ErrorBoundary'
  public readonly props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    // Mettre à jour l'état pour afficher l'interface de repli lors du prochain rendu.
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport d'erreurs
    console.error("Erreur critique capturée par ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    // Vide le stockage local qui pourrait contenir des données corrompues
    localStorage.clear();
    // Force le rechargement de la page à la racine
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
          <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl border border-red-100 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups ! Une erreur est survenue.</h1>
            <p className="text-gray-600 mb-6">
              L'application a rencontré un problème inattendu. Cela est souvent dû à des données obsolètes ou incompatibles dans votre navigateur.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
               <p className="text-xs font-mono text-red-600 break-all">
                 {this.state.error?.toString() || "Erreur inconnue"}
               </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recharger la page
              </button>
              <button 
                onClick={this.handleReset} 
                className="w-full px-4 py-3 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
              >
                Réinitialiser l'application (Urgence)
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Le bouton "Réinitialiser" effacera les données locales pour réparer l'application.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);