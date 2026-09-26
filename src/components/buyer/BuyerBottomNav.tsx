import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Heart,
  ShoppingBag,
  Package,
  MessageSquare,
  User,
} from 'lucide-react';
import { BuyerTab } from '../../types';

export const BuyerBottomNav: React.FC = () => {
  const {
    activeBuyerTab,
    setActiveBuyerTab,
    cart,
    orders,
    setSelectedProduct,
    setSelectedSeller,
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = orders.filter(
    o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  ).length;

  const handleTabClick = (tab: BuyerTab) => {
    // Reset any open sub-views when clicking bottom tabs
    setSelectedProduct(null);
    setSelectedSeller(null);
    setActiveBuyerTab(tab);
  };

  const navItems: { id: BuyerTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 'cart',
      label: 'Panier',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: totalCartCount,
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: <Package className="w-5 h-5" />,
      badge: activeOrdersCount,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const isActive = activeBuyerTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
