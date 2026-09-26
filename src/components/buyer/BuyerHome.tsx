import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { TrustScoreBadge } from '../common/TrustScoreBadge';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle,
  Truck,
  Sparkles,
  Smartphone,
  Laptop,
  SunMedium,
  Tv,
  Car,
  Home,
  Armchair,
  Shirt,
  Watch,
  Package,
  X,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { ProductCondition } from '../../types';

export const BuyerHome: React.FC = () => {
  const {
    user,
    products,
    categories,
    sellers,
    setSelectedSeller,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedProduct,
    setActiveBuyerTab,
  } = useApp();

  // Search & Filter drawer state
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'popular' | 'rating'>('relevance');

  // Category Icon mapper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'SunMedium':
        return <SunMedium className="w-5 h-5" />;
      case 'Tv':
        return <Tv className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Armchair':
        return <Armchair className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Filtered products calculation
  const filteredProducts = products.filter(p => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSeller = p.sellerName.toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchDesc && !matchSeller) return false;
    }

    // Category
    if (selectedCategory && p.category !== selectedCategory) {
      return false;
    }

    // Condition
    if (filterCondition !== 'all' && p.condition !== filterCondition) {
      return false;
    }

    // City
    if (filterCity !== 'all' && p.city !== filterCity) {
      return false;
    }

    // Verified seller
    if (filterVerifiedOnly && !p.sellerVerified) {
      return false;
    }

    // Min Trust Score
    if (minTrustScore > 0 && p.sellerTrustScore < minTrustScore) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price_desc') return b.priceUSD - a.priceUSD;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
    return 0;
  });

  const popularProducts = products.filter(p => p.isPopular);
  const featuredProducts = products.filter(p => p.isFeatured);

  const activeFilterCount =
    (filterCondition !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (filterVerifiedOnly ? 1 : 0) +
    (minTrustScore > 0 ? 1 : 0) +
    (selectedCategory ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory(null);
    setFilterCondition('all');
    setFilterCity('all');
    setFilterVerifiedOnly(false);
    setMinTrustScore(0);
    setSortBy('relevance');
    setSearchQuery('');
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Personalized Greeting & Location Bar (Section 9) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
            />
            <div>
              <span className="text-[11px] text-slate-300 block">Bienvenue sur C’ECO</span>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Bonjour, {user.fullName.split(' ')[0]} 👋
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{user.city} (RDC)</span>
          </div>
        </div>

        {/* Search Bar with Filter Trigger (Section 10) */}
        <div className="relative flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher téléphone, solaire, mode, pièces..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/90 text-white placeholder:text-slate-400 text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-open-filters"
            onClick={() => setShowFilterDrawer(true)}
            className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center transition-all ${
              activeFilterCount > 0
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Filtres avancés"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* C’ECO Slogan Pill */}
        <div className="flex items-center justify-between text-[11px] text-emerald-200/90 pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            « Achète. Paie. Reçois. En toute sécurité. »
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-900/60 px-2 py-0.5 rounded">
            Séquestre Garanti
          </span>
        </div>
      </div>

      {/* Trust & Guarantee highlights strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="font-bold text-slate-900 text-[11px]">Trust Score</span>
          <span className="text-[9px] text-slate-400">Vendeurs certifiés</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center">
          <Zap className="w-4 h-4 text-amber-500 mb-1" />
          <span className="font-bold text-slate-900 text-[11px]">Mobile Money</span>
          <span className="text-[9px] text-slate-400">M-Pesa, Orange, Airtel</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center">
          <Truck className="w-4 h-4 text-teal-600 mb-1" />
          <span className="font-bold text-slate-900 text-[11px]">Code OTP</span>
          <span className="text-[9px] text-slate-400">Remise sécurisée</span>
        </div>
      </div>

      {/* Categories Horizontal Scroll (Section 11) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Catégories</h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[11px] text-emerald-700 font-semibold hover:underline"
            >
              Toutes les catégories
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tous ({products.length})</span>
          </button>

          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Pill Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100 text-xs">
          <span className="font-bold text-emerald-950 text-[11px]">Filtres actifs :</span>
          {selectedCategory && (
            <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              Catégorie: {selectedCategory}
            </span>
          )}
          {filterCity !== 'all' && (
            <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              Ville: {filterCity}
            </span>
          )}
          {filterVerifiedOnly && (
            <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              Vendeurs vérifiés
            </span>
          )}
          {minTrustScore > 0 && (
            <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              Trust Score ≥ {minTrustScore}
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[10px] text-rose-600 font-bold hover:underline ml-auto"
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* If Search or Filters are active, show search results */}
      {(searchQuery || activeFilterCount > 0) ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Résultats de recherche ({sortedProducts.length})
            </h3>
            <span className="text-xs text-slate-500">
              Tri : {sortBy === 'price_asc' ? 'Prix croissant' : sortBy === 'rating' ? 'Mieux notés' : 'Pertinence'}
            </span>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">Aucun produit trouvé</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Essayez d'ajuster vos critères ou de supprimer certains filtres.
              </p>
              <button
                onClick={resetFilters}
                className="py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Standard Home Layout with Featured, Sellers and Popular sections */
        <div className="space-y-6">
          {/* Popular Products (Section 9) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Produits Populaires</h3>
              </div>
              <span className="text-xs text-emerald-700 font-semibold cursor-pointer">
                Tout voir ({popularProducts.length})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {popularProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Featured Verified Sellers Showcase (Section 9 & 13) */}
          <div className="bg-slate-100/80 rounded-3xl p-4 space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Vendeurs Vérifiés C’ECO</h3>
                <p className="text-[10px] text-slate-500">Boutiques avec identité et RCCM validés</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                {sellers.length} boutiques
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sellers.map(s => (
                <div
                  key={s.id}
                  id={`seller-card-${s.id}`}
                  onClick={() => setSelectedSeller(s)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={s.logoUrl}
                    alt={s.businessName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {s.businessName}
                      </h4>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{s.tagline}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <TrustScoreBadge score={s.trustScore} size="sm" showModalTrigger={false} />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {s.totalSales} ventes
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* New Arrivals & All Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Nouveautés & Recommandations</h3>
              </div>
              <span className="text-xs text-slate-500">Stock garanti</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Drawer (Section 10: Design de la recherche) */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Filtres de recherche C’ECO</h3>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* City Filter DRC */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Ville en RDC
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Kinshasa', 'Lubumbashi', 'Goma', 'Kolwezi'].map(city => (
                    <button
                      key={city}
                      onClick={() => setFilterCity(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        filterCity === city
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {city === 'all' ? 'Toutes les villes' : city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  État du produit
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Neuf', 'Reconditionné A+', 'Occasion Certifiée'].map(cond => (
                    <button
                      key={cond}
                      onClick={() => setFilterCondition(cond)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        filterCondition === cond
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cond === 'all' ? 'Tous états' : cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Seller only toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Vendeurs vérifiés uniquement
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Boutiques avec documents légaux validés
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={filterVerifiedOnly}
                  onChange={e => setFilterVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </div>

              {/* Min Trust Score */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Trust Score minimum
                  </label>
                  <span className="text-xs font-extrabold text-emerald-800">
                    {minTrustScore > 0 ? `≥ ${minTrustScore}/100` : 'Indifférent'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={minTrustScore}
                  onChange={e => setMinTrustScore(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="relevance">Pertinence C’ECO</option>
                  <option value="price_asc">Prix croissant ($)</option>
                  <option value="price_desc">Prix décroissant ($)</option>
                  <option value="popular">Popularité & Ventes</option>
                  <option value="rating">Meilleure note vendeurs</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md"
              >
                Appliquer ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
