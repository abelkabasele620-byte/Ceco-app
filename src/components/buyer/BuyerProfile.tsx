import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  LifeBuoy,
  LogOut,
  ChevronRight,
  CheckCircle,
  FileText,
  Key,
  Database,
  RefreshCw,
  LogIn,
} from 'lucide-react';

export const BuyerProfile: React.FC = () => {
  const {
    user,
    setAuthModalOpen,
    supabaseSession,
    isSupabaseConnected,
    signOutFromSupabase,
    refreshProductsFromSupabase,
    isSupabaseLoading,
  } = useApp();
  const [supportModal, setSupportModal] = useState(false);
  const [securityModal, setSecurityModal] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSync = async () => {
    await refreshProductsFromSupabase();
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-full pb-24 p-4 animate-in fade-in duration-200">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 truncate">{user.fullName}</h2>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Vérifié
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.phone}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {user.city} (République Démocratique du Congo)
            </p>
          </div>
        </div>

        {/* Supabase Cloud Connection & Account Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">Backend Supabase PostgreSQL</h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  bnsexwoxjgqjphytgawc.supabase.co
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              />
              {isSupabaseConnected ? 'En ligne' : 'Prêt (Migration)'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
            <div className="flex justify-between items-center">
              <span>Statut de session :</span>
              <strong className="text-slate-900">
                {supabaseSession ? 'Connecté (Supabase Auth)' : 'Session Locale active'}
              </strong>
            </div>
            {supabaseSession && (
              <div className="flex justify-between items-center text-[11px]">
                <span>Email connecté :</span>
                <span className="font-mono text-emerald-800 font-semibold">{user.email || supabaseSession.user?.email}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            {supabaseSession ? (
              <button
                type="button"
                onClick={signOutFromSupabase}
                className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion / Inscription</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSync}
              disabled={isSupabaseLoading}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Synchroniser le catalogue avec Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{syncDone ? 'Synchronisé !' : 'Actualiser'}</span>
            </button>
          </div>
        </div>

        {/* C’ECO Account Security status */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-4 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs">Protection du compte C’ECO active</h3>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Authentification par numéro de téléphone RDC avec code OTP à chaque connexion sensible. Transactions protégées par séquestre bancaire & Mobile Money.
          </p>
        </div>

        {/* Menu list */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
          <div
            onClick={() => setSecurityModal(true)}
            className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Sécurité & Mots de passe</span>
                <span className="text-[10px] text-slate-400">Authentification à deux facteurs, sessions</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => setSupportModal(true)}
            className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Centre d'aide & Support C’ECO</span>
                <span className="text-[10px] text-slate-400">Assistance 7j/7, FAQ et signalements</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Conditions Générales d’Utilisation</span>
                <span className="text-[10px] text-slate-400">Règlement des ventes et charte de confiance RDC</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* App Info footer */}
        <div className="text-center pt-4 text-slate-400 text-[11px] space-y-1">
          <p className="font-semibold text-slate-600">C’ECO RDC v2.4.0 (Production Build)</p>
          <p>« Achète. Paie. Reçois. En toute sécurité. »</p>
        </div>
      </div>

      {/* Security Modal */}
      {securityModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Paramètres de sécurité</h3>
              <p className="text-xs text-slate-500 mt-1">
                Numéro vérifié : <strong>{user.phone}</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center">
                <span>Vérification OTP par SMS</span>
                <span className="text-emerald-700 font-bold">Activée</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cryptage bout-en-bout</span>
                <span className="text-emerald-700 font-bold">TLS 1.3 / AES-256</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Session active sur appareil</span>
                <span className="text-slate-500">Kinshasa (Gombe)</span>
              </div>
            </div>
            <button
              onClick={() => setSecurityModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Assistance Client C’ECO</h3>
                <p className="text-xs text-slate-500">Kinshasa & provinces de RDC</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="font-bold block text-slate-900">Ligne directe Support :</span>
                <span className="font-mono text-emerald-800 font-bold">+243 81 000 CECO (+243 81 000 2326)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="font-bold block text-slate-900">Bureau Kinshasa :</span>
                <span>Boulevard du 30 Juin, Immeuble Future Tower, Gombe</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="font-bold block text-slate-900">Horaires :</span>
                <span>Lundi au Samedi : 08h00 à 19h00 (Heure de Kinshasa)</span>
              </div>
            </div>

            <button
              onClick={() => setSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
