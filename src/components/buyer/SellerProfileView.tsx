import React from 'react';
import { Seller } from '../../types';
import { useApp } from '../../context/AppContext';
import { TrustScoreBadge } from '../common/TrustScoreBadge';
import { ProductCard } from './ProductCard';
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Calendar,
  Package,
  Award,
  Star,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface SellerProfileViewProps {
  seller: Seller;
  onBack: () => void;
}

export const SellerProfileView: React.FC<SellerProfileViewProps> = ({ seller, onBack }) => {
  const { products } = useApp();

  const sellerProducts = products.filter(p => p.sellerId === seller.id);

  return (
    <div className="bg-slate-50 min-h-full pb-20 animate-in fade-in duration-200">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          id="btn-seller-back"
          onClick={onBack}
          className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        <h2 className="font-bold text-slate-900 text-sm truncate">Vitrine Vendeur C’ECO</h2>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Cover + Profile banner */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
          <div className="h-32 w-full relative bg-slate-800">
            <img
              src={seller.coverUrl}
              alt=""
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          </div>

          <div className="px-5 pb-5 pt-0 relative">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <img
                src={seller.logoUrl}
                alt={seller.businessName}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
              <TrustScoreBadge
                score={seller.trustScore}
                breakdown={seller.scoreBreakdown}
                sellerName={seller.businessName}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{seller.businessName}</h1>
                {seller.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Vérifié C’ECO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">{seller.tagline}</p>
            </div>

            {/* Official DRC Registry Data */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {seller.physicalAddress} ({seller.city})
              </span>
              {seller.rccmNumber && (
                <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                  <FileText className="w-3 h-3 text-slate-400" />
                  RCCM: {seller.rccmNumber}
                </span>
              )}
              {seller.idNatNumber && (
                <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                  Id.Nat: {seller.idNatNumber}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Membre depuis {seller.yearsActive} ans
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {seller.description}
            </p>
          </div>
        </div>

        {/* Key Reliability Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-1">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-slate-900">{seller.trustScore}/100</span>
            <span className="text-[10px] text-slate-400 block font-medium">Trust Score C’ECO</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-1">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-slate-900">{seller.totalSales}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Commandes livrées</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-teal-700">{seller.successRate}%</span>
            <span className="text-[10px] text-slate-400 block font-medium">Taux de réussite</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-1">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <span className="text-lg font-black text-slate-900">{seller.rating} / 5</span>
            <span className="text-[10px] text-slate-400 block font-medium">({seller.reviewCount} avis)</span>
          </div>
        </div>

        {/* Products in this Boutique */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Catalogue de la boutique ({sellerProducts.length} articles)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Stock en temps réel</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sellerProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
