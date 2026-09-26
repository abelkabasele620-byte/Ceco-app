import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { TrustScoreBadge } from '../common/TrustScoreBadge';
import { Heart, MapPin, CheckCircle, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { formatPriceDetailed, isFavorite, toggleFavorite, addToCart, setSelectedProduct } = useApp();

  const isFav = isFavorite(product.id);
  const { usd, cdf } = formatPriceDetailed(product.priceUSD);

  const handleClick = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      setSelectedProduct(product);
    }
  };

  return (
    <div
      id={`card-product-${product.id}`}
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Tag */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide">
            {product.condition}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          id={`btn-fav-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
            isFav
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/85 text-slate-600 hover:bg-white hover:text-rose-600'
          }`}
          title="Ajouter aux favoris"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick Add To Cart button (shows on hover / touch) */}
        <button
          id={`btn-add-cart-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          title="Ajouter au panier"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller line with Verified check & Trust Score */}
          <div className="flex items-center justify-between gap-1 mb-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 truncate font-medium">
              {product.sellerName}
              {product.sellerVerified && (
                <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
              )}
            </span>
            <TrustScoreBadge score={product.sellerTrustScore} size="sm" showModalTrigger={false} />
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 text-base">{usd}</span>
              {product.originalPriceUSD && (
                <span className="text-[11px] text-slate-400 line-through">
                  ${product.originalPriceUSD}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-500 block">{cdf}</span>
          </div>

          {/* Location pill */}
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            <MapPin className="w-2.5 h-2.5 text-slate-400" />
            <span className="truncate max-w-[65px]">{product.commune || product.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
