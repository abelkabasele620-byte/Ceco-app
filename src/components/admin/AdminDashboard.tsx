import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Search,
  SlidersHorizontal,
  DollarSign,
  Package,
  Store,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { TrustScoreBadge } from '../common/TrustScoreBadge';

export const AdminDashboard: React.FC = () => {
  const {
    sellers,
    orders,
    disputes,
    products,
    formatPriceDetailed,
    resolveDispute,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpis' | 'disputes' | 'sellers' | 'orders' | 'security'>('kpis');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    disputes.length > 0 ? disputes[0].id : null
  );

  // Stats calculation
  const totalVolumeUSD = orders.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalEscrowUSD = orders
    .filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotalUSD, 0);
  const totalCommissionUSD = totalVolumeUSD * 0.05; // 5% marketplace commission

  const volumeFormatted = formatPriceDetailed(totalVolumeUSD);
  const escrowFormatted = formatPriceDetailed(totalEscrowUSD);
  const commissionFormatted = formatPriceDetailed(totalCommissionUSD);

  const pendingDisputes = disputes.filter(d => d.status === 'open' || d.status === 'investigating');
  const selectedDispute = disputes.find(d => d.id === selectedDisputeId);

  return (
    <div className="bg-slate-100 min-h-full pb-20 p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-xl shadow-xs">
              C’
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black">
                  C’ECO Back-Office & Administration
                </h1>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Super Admin RDC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervision des flux sécurisés, régulation du séquestre et arbitrage des litiges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300 font-semibold font-mono">
              Nœud Kinshasa : En ligne (100%)
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kpis'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vue Financière & KPIs
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'disputes'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Centre de Litiges</span>
            {pendingDisputes.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                {pendingDisputes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sellers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vendeurs & Vérifications RCCM ({sellers.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Flux des Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cybersécurité & Anti-Fraude
          </button>
        </div>

        {/* TAB 1: FINANCIAL OVERVIEW & ESCROW MONITOR */}
        {activeTab === 'kpis' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Volume Total Transactions</span>
                <span className="text-2xl font-black text-slate-900">{volumeFormatted.usd}</span>
                <span className="text-xs text-slate-400 block font-semibold">{volumeFormatted.cdf}</span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                  +18.4% ce mois (Kinshasa, Lubumbashi)
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Fonds Retenus en Séquestre</span>
                <span className="text-2xl font-black text-amber-600">{escrowFormatted.usd}</span>
                <span className="text-xs text-slate-400 block font-semibold">{escrowFormatted.cdf}</span>
                <span className="text-[10px] text-slate-500 block pt-1">
                  Sécurisé sur compte bancaire dédié Rawbank / M-Pesa
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Revenus Commissions C’ECO</span>
                <span className="text-2xl font-black text-emerald-700">{commissionFormatted.usd}</span>
                <span className="text-xs text-slate-400 block font-semibold">{commissionFormatted.cdf}</span>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                  Modèle économique pérenne (5% par vente achevée)
                </span>
              </div>
            </div>

            {/* Mobile Money Operator Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">
                Répartition des canaux de paiement RDC
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <span className="font-bold text-red-700 block">Vodacom M-Pesa</span>
                  <span className="text-lg font-black text-slate-900">52%</span>
                  <span className="text-[10px] text-slate-500">Volume principal</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100">
                  <span className="font-bold text-orange-700 block">Orange Money</span>
                  <span className="text-lg font-black text-slate-900">28%</span>
                  <span className="text-[10px] text-slate-500">Kinshasa & Ouest</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                  <span className="font-bold text-rose-700 block">Airtel Money</span>
                  <span className="text-lg font-black text-slate-900">14%</span>
                  <span className="text-[10px] text-slate-500">Provinces & Lubumbashi</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">Cartes / Afrimoney</span>
                  <span className="text-lg font-black text-slate-900">6%</span>
                  <span className="text-[10px] text-slate-500">Entreprises & B2B</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESOLUTION CENTER & DISPUTES */}
        {activeTab === 'disputes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Disputes List */}
            <div className="md:col-span-1 space-y-2">
              <h3 className="font-bold text-xs text-slate-800">
                Dossiers en arbitrage ({disputes.length})
              </h3>
              <div className="space-y-2">
                {disputes.map(d => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDisputeId(d.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedDisputeId === d.id
                        ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{d.id}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'resolved_refunded'
                            ? 'bg-blue-100 text-blue-800'
                            : d.status === 'resolved_released'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                      {d.reason.replace('_', ' ')}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      Commande : {d.orderId}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Detail & Decision Controls */}
            <div className="md:col-span-2">
              {selectedDispute ? (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Dossier de médiation</span>
                      <h3 className="font-bold text-base text-slate-900">{selectedDispute.id}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      Ouvert le {selectedDispute.createdAt}
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-rose-900 block">
                      Motif invoqué par l'acheteur : {selectedDispute.reason.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      "{selectedDispute.description}"
                    </p>
                  </div>

                  {/* Evidence previews */}
                  {selectedDispute.evidenceImages.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 block">Preuves photographiques :</span>
                      <div className="flex items-center gap-2">
                        {selectedDispute.evidenceImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Buttons */}
                  {selectedDispute.status === 'open' || selectedDispute.status === 'investigating' ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-900 block">
                        Décision du médiateur C’ECO :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          id="btn-arbitrate-refund"
                          onClick={() => resolveDispute(selectedDispute.id, 'refund_buyer')}
                          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Rembourser l'acheteur (Annuler)</span>
                        </button>
                        <button
                          id="btn-arbitrate-release"
                          onClick={() => resolveDispute(selectedDispute.id, 'release_to_seller')}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Débloquer les fonds au vendeur</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                      <strong>Décision finale :</strong> Dossier clôturé ({selectedDispute.status})
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400">
                  Sélectionnez un litige pour examiner le dossier.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SELLERS AND RCCM VERIFICATION */}
        {activeTab === 'sellers' && (
          <div className="space-y-3">
            <h2 className="font-bold text-xs text-slate-900">
              Vendeurs enregistrés et statut juridique RDC ({sellers.length})
            </h2>

            <div className="space-y-3">
              {sellers.map(s => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.logoUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900">{s.businessName}</h4>
                        {s.isVerified && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Vérifié
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{s.physicalAddress} ({s.city})</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                        <span>RCCM: {s.rccmNumber}</span>
                        <span>•</span>
                        <span>Id.Nat: {s.idNatNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TrustScoreBadge score={s.trustScore} breakdown={s.scoreBreakdown} />
                    <button className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">
                      Audit boutique
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS AUDIT */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-bold text-xs text-slate-900">
              Audit des commandes en cours ({orders.length})
            </h2>

            <div className="space-y-2">
              {orders.map(o => (
                <div
                  key={o.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{o.id}</span>
                    <span className="text-slate-500">
                      {o.buyerName} → {o.sellerName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">${o.totalUSD}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      OTP: {o.deliveryOtp}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                    {o.orderStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CYBERSECURITY & FRAUD DETECTION */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm">Système Anti-Fraude & Renseignement C’ECO</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Surveillance des discussions</span>
                <p className="text-slate-600">
                  Détection automatique des tentatives de contournement (échanges de numéros privés, propositions de cash hors-plateforme).
                </p>
                <span className="text-[10px] font-bold text-emerald-700 block pt-1">
                  Moteur actif • 0 violation critique aujourd'hui
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Protection des codes OTP</span>
                <p className="text-slate-600">
                  Génération chiffrée pseudo-aléatoire à 6 chiffres. Taux d'échec limité à 3 tentatives avant blocage de sécurité.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 block pt-1">
                  Chiffrement AES-256 opérationnel
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
