import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrustScoreBadge } from '../common/TrustScoreBadge';
import {
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Truck,
  Eye,
  Store,
  Wallet,
  Building2,
  FileCheck,
} from 'lucide-react';
import { ProductCondition } from '../../types';

export const SellerDashboard: React.FC = () => {
  const {
    sellers,
    products,
    orders,
    formatPriceDetailed,
    updateProductStock,
    addProduct,
    advanceOrderStatus,
  } = useApp();

  // Pick primary seller (Konga Tech RDC)
  const currentSeller = sellers[0];

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'orders' | 'products' | 'payouts'>('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('250');
  const [payoutMethod, setPayoutMethod] = useState('mpesa');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('5');
  const [newProdCat, setNewProdCat] = useState('smartphones');
  const [newProdCondition, setNewProdCondition] = useState<ProductCondition>('Neuf');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80');

  // Seller's orders and products
  const sellerOrders = orders.filter(o => o.sellerId === currentSeller.id);
  const sellerProducts = products.filter(p => p.sellerId === currentSeller.id);

  // Financial calculations
  const pendingEscrowUSD = sellerOrders
    .filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotalUSD, 0);

  const completedSalesUSD = sellerOrders
    .filter(o => o.orderStatus === 'completed')
    .reduce((sum, o) => sum + o.subtotalUSD, 0);

  const availableBalanceUSD = 1240.0; // Simulated released balance ready for withdrawal

  const escrowFormatted = formatPriceDetailed(pendingEscrowUSD);
  const availableFormatted = formatPriceDetailed(availableBalanceUSD);
  const salesFormatted = formatPriceDetailed(completedSalesUSD + availableBalanceUSD);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    addProduct({
      sellerId: currentSeller.id,
      sellerName: currentSeller.businessName,
      sellerTrustScore: currentSeller.trustScore,
      sellerVerified: currentSeller.isVerified,
      name: newProdName,
      description: newProdDesc || 'Produit authentique sous garantie C’ECO.',
      priceUSD: parseFloat(newProdPrice),
      stockAvailable: parseInt(newProdStock, 10) || 1,
      category: newProdCat,
      condition: newProdCondition,
      images: [newProdImage],
      city: currentSeller.city,
      rating: 5.0,
      reviewCount: 0,
      specifications: {
        'Garantie': '1 an pièces et main d’œuvre',
        'Origine': 'Authentique certifié C’ECO',
      },
      tags: ['nouveau', newProdCat],
      isPopular: false,
      isFeatured: false,
    });

    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdPrice('');
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 1800);
  };

  return (
    <div className="bg-slate-50 min-h-full pb-20 p-4 animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Seller Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentSeller.logoUrl}
              alt=""
              className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-slate-900">
                  {currentSeller.businessName}
                </h1>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  RCCM Vérifié
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentSeller.physicalAddress} ({currentSeller.city})</p>
            </div>
          </div>

          <TrustScoreBadge
            score={currentSeller.trustScore}
            breakdown={currentSeller.scoreBreakdown}
            sellerName={currentSeller.businessName}
          />
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors relative ${
              activeSubTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Commandes en cours ({sellerOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mes Produits & Stock ({sellerProducts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'payouts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Retrait des Gains
          </button>
        </div>

        {/* TAB 1: OVERVIEW & WALLET STATS */}
        {activeSubTab === 'overview' && (
          <div className="space-y-4">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Available Balance */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-4 rounded-3xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-semibold">Solde Disponible</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black">{availableFormatted.usd}</span>
                  <span className="text-xs text-emerald-200 block font-semibold">{availableFormatted.cdf}</span>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                >
                  <span>Retirer vers Mobile Money</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pending Escrow */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Fonds en Séquestre</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{escrowFormatted.usd}</span>
                  <span className="text-xs text-slate-500 block font-semibold">{escrowFormatted.cdf}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Libéré instantanément dès la validation du code OTP par le client lors de la remise.
                </p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Volume d'affaires</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900">{salesFormatted.usd}</span>
                  <span className="text-xs text-slate-500 block font-semibold">{salesFormatted.cdf}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{currentSeller.successRate}% de livraisons réussies</span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Catalogue & Inventaire</h3>
                <p className="text-[11px] text-slate-500">
                  {sellerProducts.length} articles répertoriés dans votre boutique
                </p>
              </div>
              <button
                id="btn-seller-add-product"
                onClick={() => setShowAddProductModal(true)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Publier un article</span>
              </button>
            </div>

            {/* Recent Orders to process */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Commandes récentes à traiter</h3>
                <button
                  onClick={() => setActiveSubTab('orders')}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  Voir toutes ({sellerOrders.length})
                </button>
              </div>

              {sellerOrders.slice(0, 3).map(order => {
                const total = formatPriceDetailed(order.totalUSD);
                return (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {order.id}
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium block mt-0.5">
                        Client : {order.buyerName} ({order.shippingAddress.commune})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900">{total.usd}</span>
                      <span className="text-[10px] text-slate-500 block">{total.cdf}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {order.orderStatus === 'paid' && (
                        <button
                          onClick={() => advanceOrderStatus(order.id, 'preparing')}
                          className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                        >
                          Préparer colis
                        </button>
                      )}
                      {order.orderStatus === 'preparing' && (
                        <button
                          onClick={() => advanceOrderStatus(order.id, 'in_delivery')}
                          className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Remettre au coursier
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeSubTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-900">
              Toutes les commandes reçues ({sellerOrders.length})
            </h2>

            {sellerOrders.map(order => {
              const total = formatPriceDetailed(order.totalUSD);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                      <span className="text-xs text-slate-400 block">{order.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800">{total.usd} ({total.cdf})</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Client :</strong> {order.buyerName} ({order.buyerPhone})
                    </p>
                    <p>
                      <strong>Destination :</strong> {order.shippingAddress.commune}, {order.shippingAddress.repere}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Articles :</span>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600">
                        <span>{it.quantity}x {it.product.name}</span>
                        <span className="font-semibold">${it.priceUSD * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Escrow status notice */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      {order.orderStatus === 'completed'
                        ? 'Fonds libérés et crédités sur votre solde disponible.'
                        : 'Paiement sous séquestre C’ECO. Les fonds seront crédités dès que le client communiquera son code OTP au coursier.'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {order.orderStatus === 'paid' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'preparing')}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                      >
                        Marquer comme en préparation
                      </button>
                    )}
                    {order.orderStatus === 'preparing' && (
                      <button
                        onClick={() => advanceOrderStatus(order.id, 'in_delivery')}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Remettre au coursier certifié C’ECO
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PRODUCTS & STOCK MANAGEMENT */}
        {activeSubTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">
                Inventaire de la boutique ({sellerProducts.length})
              </h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </div>

            <div className="space-y-2">
              {sellerProducts.map(p => {
                const price = formatPriceDetailed(p.priceUSD);
                return (
                  <div
                    key={p.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        {p.condition}
                      </span>
                      <h3 className="font-bold text-xs text-slate-900 truncate mt-1">{p.name}</h3>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-extrabold text-xs text-slate-900">{price.usd}</span>
                        <span className="text-[10px] text-slate-400">{price.cdf}</span>
                      </div>
                    </div>

                    {/* Stock controller */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Stock :</span>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => updateProductStock(p.id, Math.max(0, p.stockAvailable - 1))}
                          className="w-6 h-6 rounded bg-white text-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{p.stockAvailable}</span>
                        <button
                          onClick={() => updateProductStock(p.id, p.stockAvailable + 1)}
                          className="w-6 h-6 rounded bg-white text-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PAYOUTS / RETRAITS */}
        {activeSubTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Solde prêt au retrait</span>
                  <span className="text-2xl font-black text-slate-900">{availableFormatted.usd}</span>
                  <span className="text-xs text-slate-500 block font-semibold">{availableFormatted.cdf}</span>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Initier un virement Mobile Money</span>
                </button>
              </div>
            </div>

            {/* Past Payouts History */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-slate-900">Historique des décaissements</h3>
              <div className="divide-y divide-slate-100 text-xs text-slate-600">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Retrait M-Pesa (+243 81 220 9010)</span>
                    <span className="text-[10px] text-slate-400">04 Septembre 2026</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">$450.00</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">Exécuté avec succès</span>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Retrait Orange Money (+243 89 540 1289)</span>
                    <span className="text-[10px] text-slate-400">28 Août 2026</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">$320.00</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">Exécuté avec succès</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Demande de retrait des gains</h3>

            {payoutSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Virement initié avec succès !</h4>
                <p className="text-xs text-slate-500">
                  Les fonds ont été transférés sur votre compte Mobile Money {payoutMethod.toUpperCase()}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Montant en USD (Max {availableBalanceUSD}$)
                  </label>
                  <input
                    type="number"
                    max={availableBalanceUSD}
                    min="10"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Équivalent : {(parseFloat(payoutAmount || '0') * 2850).toLocaleString()} FC
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Moyen de retrait Mobile Money
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="mpesa">M-Pesa Vodacom RDC</option>
                    <option value="orangemoney">Orange Money RDC</option>
                    <option value="airtelmoney">Airtel Money RDC</option>
                    <option value="bank">Virement Bancaire (Rawbank / Equity BCDC)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md"
                  >
                    Confirmer le retrait
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Publier un nouvel article sur C’ECO</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iPhone 14 Pro 128 Go Gold"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prix (USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {newProdPrice ? `${(parseFloat(newProdPrice) * 2850).toLocaleString()} FC` : '0 FC'}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock initial</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={e => setNewProdStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={newProdCat}
                    onChange={e => setNewProdCat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="smartphones">Téléphones</option>
                    <option value="laptops">Informatique</option>
                    <option value="solar">Énergie Solaire</option>
                    <option value="appliances">Électroménager</option>
                    <option value="fashion">Mode & Vêtements</option>
                    <option value="furniture">Mobilier</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">État</label>
                  <select
                    value={newProdCondition}
                    onChange={e => setNewProdCondition(e.target.value as ProductCondition)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Neuf">Neuf</option>
                    <option value="Reconditionné A+">Reconditionné A+</option>
                    <option value="Occasion Certifiée">Occasion Certifiée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL de l'image</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={e => setNewProdImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  placeholder="État de la batterie, garantie, accessoires inclus..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  id="btn-confirm-add-product"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md"
                >
                  Publier l'article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
