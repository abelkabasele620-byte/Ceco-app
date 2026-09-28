import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const {
    user,
    supabaseSession,
    isSupabaseConnected,
    signInWithSupabase,
    signUpWithSupabase,
    signOutFromSupabase,
    setActiveRole,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+243 ');
  const [role, setRole] = useState<UserRole>('buyer');
  const [city, setCity] = useState('Kinshasa');
  const [businessName, setBusinessName] = useState('');
  const [rccmNumber, setRccmNumber] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await signInWithSupabase(email, password);
      if (res.success) {
        setSuccessMessage('Connexion réussie ! Profil synchronisé avec Supabase.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Erreur lors de la connexion.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await signUpWithSupabase({
        email,
        password,
        fullName,
        phone,
        role,
        city,
        businessName: role === 'seller' ? businessName : undefined,
        rccmNumber: role === 'seller' ? rccmNumber : undefined,
      });

      if (res.success) {
        setSuccessMessage(
          res.message || 'Compte C’ECO créé avec succès ! Bienvenue sur la plateforme.'
        );
        setActiveRole(role as any);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Erreur lors de la création du compte.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur d’inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-lg text-white">
              C’
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {supabaseSession
                  ? 'Mon Compte C’ECO (Supabase)'
                  : mode === 'login'
                  ? 'Connexion C’ECO'
                  : 'Inscription Utilisateur'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[10px] text-slate-300 font-mono">
                  {isSupabaseConnected
                    ? 'Supabase Cloud Connecté'
                    : 'Supabase Prêt (Synchronisation)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Supabase status banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block">Base de données Supabase RDC</span>
                <span className="text-[10px] text-emerald-800 font-mono">
                  bnsexwoxjgqjphytgawc.supabase.co
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              PostgreSQL
            </span>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* If already logged in */}
          {supabaseSession ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{user.fullName}</h3>
                    <p className="text-xs text-slate-500">{user.email || supabaseSession.user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Rôle : {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong>Ville :</strong> {user.city}
                </p>
                <p>
                  <strong>Téléphone :</strong> {user.phone}
                </p>
                {user.businessName && (
                  <p>
                    <strong>Boutique :</strong> {user.businessName} (RCCM: {user.rccmNumber || 'En cours'})
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await signOutFromSupabase();
                    setSuccessMessage('Déconnecté avec succès.');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Se déconnecter
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Switcher: Login / Register */}
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Adresse Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="ex: abel.kabasele@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connexion Supabase...</span>
                      </>
                    ) : (
                      <>
                        <span>Accéder à mon espace C’ECO</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Inscrivez-vous gratuitement
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Role Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Type de compte C’ECO
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setRole('buyer')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          role === 'buyer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Acheteur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('seller')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          role === 'seller'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        <span>Vendeur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('courier')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          role === 'courier'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        <span>Livreur</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nom complet ou Raison sociale
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Ex: Jonathan Mutombo"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Téléphone RDC
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+243 81 220 9010"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Ville
                      </label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Kinshasa">Kinshasa</option>
                        <option value="Lubumbashi">Lubumbashi</option>
                        <option value="Goma">Goma</option>
                        <option value="Kolwezi">Kolwezi</option>
                        <option value="Matadi">Matadi</option>
                      </select>
                    </div>
                  </div>

                  {/* Vendeur Specific: Business & RCCM */}
                  {role === 'seller' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                        Identité juridique Boutique RDC
                      </span>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="Nom commercial de la boutique"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                      />
                      <input
                        type="text"
                        value={rccmNumber}
                        onChange={e => setRccmNumber(e.target.value)}
                        placeholder="N° RCCM (ex: CD/KIN/RCCM/22-B-01490)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Adresse Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="votre.email@domaine.cd"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mot de passe (min. 6 caractères)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création du compte...</span>
                      </>
                    ) : (
                      <>
                        <span>Valider mon inscription C’ECO</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    Déjà inscrit ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Connectez-vous ici
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
