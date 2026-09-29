import { useState } from 'react';
import { useUserRole } from './hooks/useUserRole';
import { AuthModal } from './components/AuthModal';
import { CourierDashboard } from './components/CourierDashboard'; // Votre composant avec la validation OTP
import { supabase } from './lib/supabaseClient';

export function App() {
  const { role, loading } = useUserRole();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Chargement de C'ECO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* En-tête principal */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-emerald-400 tracking-wide">C'ECO</h1>
          {role && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Espace {role === 'buyer' ? 'Acheteur' : role === 'seller' ? 'Vendeur' : role === 'courier' ? 'Livreur' : 'Admin'}
            </span>
          )}
        </div>

        <div>
          {role ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Se connecter / S'inscrire
            </button>
          )}
        </div>
      </header>

      {/* Contenu dynamique selon le rôle */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {!role && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-2xl font-bold text-white">Bienvenue sur C'ECO Marketplace</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Achetez et vendez en toute confiance grâce à notre système de séquestre sécurisé.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg hover:bg-emerald-400 transition-colors"
            >
              Commencer maintenant
            </button>
          </div>
        )}

        {/* Vue Livreur */}
        {role === 'courier' && <CourierDashboard />}

        {/* Vue Vendeur */}
        {role === 'seller' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h2 className="text-lg font-bold text-emerald-400 mb-2">Tableau de bord Vendeur</h2>
            <p className="text-xs text-slate-400">Gérez vos articles, vos stocks et vos ventes en cours.</p>
            {/* Insérez ou importez ici votre composant SellerDashboard */}
          </div>
        )}

        {/* Vue Acheteur */}
        {role === 'buyer' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <h2 className="text-lg font-bold text-emerald-400 mb-1">Espace Acheteur</h2>
              <p className="text-xs text-slate-400">Parcourez le catalogue et suivez vos commandes actives.</p>
            </div>
            {/* Insérez ou importez ici vos composants Marketplace & BuyerOrders */}
          </div>
        )}

        {/* Vue Administrateur */}
        {role === 'admin' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h2 className="text-lg font-bold text-amber-400 mb-2">Espace Administration</h2>
            <p className="text-xs text-slate-400">Gestion globale des utilisateurs, litiges et séquestres.</p>
          </div>
        )}
      </main>

      {/* Fenêtre modale de connexion / inscription */
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
