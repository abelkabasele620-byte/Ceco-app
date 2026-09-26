import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { TrustScoreBadge } from '../common/TrustScoreBadge';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquare,
  CheckCircle,
  Store,
  ChevronRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onCheckoutNow: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onCheckoutNow,
}) => {
  const {
    formatPriceDetailed,
    addToCart,
    isFavorite,
    toggleFavorite,
    sellers,
    setSelectedSeller,
    setActiveBuyerTab,
  } = useApp();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const { usd, cdf } = formatPriceDetailed(product.priceUSD);
  const seller = sellers.find(s => s.id === product.sellerId);
  const isFav = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleOpenSeller = () => {
    if (seller) {
      setSelectedSeller(seller);
    }
  };

  const handleMessageSeller = () => {
    setActiveBuyerTab('messages');
  };

  return (
    <div className="bg-slate-50 min-h-full pb-24 animate-in fade-in duration-200">
      {/* Top sticky nav */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          id="btn-product-back"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-share-product"
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
            title="Partager le produit"
          >
            <Share2 className="w-4 h-4" />
            {shareCopied && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                Lien copié !
              </span>
            )}
          </button>
          <button
            id="btn-toggle-fav-detail"
            onClick={() => toggleFavorite(product.id)}
            className={`p-2 rounded-xl transition-colors ${
              isFav ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Image Showcase */}
        <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 relative">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg font-semibold">
              {product.condition}
            </div>
            {product.stockAvailable <= 3 && (
              <div className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm">
                <AlertCircle className="w-3 h-3" />
                Plus que {product.stockAvailable} en stock !
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title & Pricing Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Stock disponible : <strong className="text-slate-900">{product.stockAvailable}</strong>
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {product.name}
          </h1>

          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{usd}</span>
                {product.originalPriceUSD && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPriceUSD}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">{cdf}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                Garantie C’ECO
              </span>
            </div>
          </div>
        </div>

        {/* C’ECO Escrow Security Promise Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Protection Sécurisée de la Transaction</h3>
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Votre argent n’est <strong>jamais versé directement au vendeur</strong> avant la livraison. Il est consigné en séquestre protégé par C’ECO et débloqué uniquement après votre vérification et saisie du code secret <strong>OTP</strong>.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-200">
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspection du colis avant OTP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remboursement garanti si non-conforme</span>
            </div>
          </div>
        </div>

        {/* Seller Info Showcase Card */}
        {seller && (
          <div
            id="seller-showcase-card"
            onClick={handleOpenSeller}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Vendeur Certifié C’ECO
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
                Voir la vitrine <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={seller.logoUrl}
                alt={seller.businessName}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {seller.businessName}
                  </h4>
                  {seller.isVerified && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{seller.physicalAddress}</p>
                <div className="mt-1 flex items-center gap-2">
                  <TrustScoreBadge score={seller.trustScore} breakdown={seller.scoreBreakdown} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Commandes</span>
                <span className="font-bold text-slate-800">{seller.totalSales}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Succès</span>
                <span className="font-bold text-emerald-700">{seller.successRate}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Ancienneté</span>
                <span className="font-bold text-slate-800">{seller.yearsActive} ans</span>
              </div>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Caractéristiques techniques</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">{key}</span>
                <span className="text-slate-900 font-semibold text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Description détaillée</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Delivery estimation DRC */}
        <div className="bg-slate-100 rounded-3xl p-4 flex items-start gap-3 text-xs text-slate-600">
          <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Livraison C’ECO Express</span>
            <span>
              Disponible à Kinshasa (Gombe, Limete, Bandal, Kasa-Vubu, Ngaliema...) en 2h à 4h. Livraison sécurisée avec remise du code OTP.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-2 sm:gap-3">
          <button
            id="btn-contact-seller"
            onClick={handleMessageSeller}
            className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex flex-col items-center justify-center shrink-0 text-[10px] font-semibold"
            title="Contacter le vendeur"
          >
            <MessageSquare className="w-4 h-4 text-emerald-700 mb-0.5" />
            <span>Message</span>
          </button>

          <button
            id="btn-add-to-cart-detail"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Ajouter au panier</span>
          </button>

          <button
            id="btn-buy-now-detail"
            onClick={() => onCheckoutNow(product)}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Acheter maintenant</span>
          </button>
        </div>

        {/* Added Toast */}
        {addedToast && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Produit ajouté au panier !
          </div>
        )}
      </div>
    </div>
  );
};
