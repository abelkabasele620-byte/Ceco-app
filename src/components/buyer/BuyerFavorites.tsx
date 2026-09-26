import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const BuyerFavorites: React.FC = () => {
  const { products, favorites, setActiveBuyerTab } = useApp();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="bg-slate-50 min-h-full pb-24 p-4 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">Mes Favoris</h1>
          <p className="text-xs text-slate-500">
            Articles enregistrés pour achat ultérieur ({favoriteProducts.length})
          </p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Aucun favori enregistré</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Cliquez sur l'icône cœur sur les fiches produits pour les retrouver ici à tout moment.
            </p>
            <button
              onClick={() => setActiveBuyerTab('home')}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 transition-colors"
            >
              Explorer les articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {favoriteProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
