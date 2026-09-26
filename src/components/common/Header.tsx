import React, { useState } from 'react';
import { useApp, AppViewMode } from '../../context/AppContext';
import { CecoLogo } from './CecoLogo';
import {
  Smartphone,
  Maximize2,
  Bell,
  Check,
  ShoppingBag,
  Store,
  Bike,
  ShieldAlert,
  FileCode2,
  DollarSign,
  Coins,
} from 'lucide-react';

interface HeaderProps {
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const {
    activeRole,
    setActiveRole,
    deviceFrame,
    setDeviceFrame,
    currency,
    setCurrency,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    user,
    cartTotalCount,
    setActiveBuyerTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const roles: { id: AppViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'buyer', label: 'Acheteur', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'seller', label: 'Vendeur', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'courier', label: 'Coursier Delivery', icon: <Bike className="w-3.5 h-3.5" />, badge: 'OTP' },
    { id: 'admin', label: 'Admin Web', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: 'Supervision' },
    { id: 'docs', label: 'Architecture & Spécifications', icon: <FileCode2 className="w-3.5 h-3.5" />, badge: 'BDD 30 tables' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Upper bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <CecoLogo size="sm" showSlogan={false} theme="dark" />

          {/* Device Frame Viewport Toggle (for mobile app simulator) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              id="btn-frame-mobile"
              onClick={() => setDeviceFrame('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                deviceFrame === 'mobile'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Affichage simulateur smartphone Android / iOS"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vue Mobile</span>
            </button>
            <button
              id="btn-frame-desktop"
              onClick={() => setDeviceFrame('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                deviceFrame === 'desktop'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Affichage étendu plein écran"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Plein Écran</span>
            </button>
          </div>
        </div>

        {/* Currency & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              id="btn-curr-usd"
              onClick={() => setCurrency('USD')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
                currency === 'USD' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>USD</span>
            </button>
            <button
              id="btn-curr-cdf"
              onClick={() => setCurrency('CDF')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all ${
                currency === 'CDF' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3 h-3" />
              <span>CDF</span>
            </button>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {unreadNotifs.length} nouvelles
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      id="btn-read-all-notifs"
                      onClick={markAllNotificationsRead}
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3" />
                      Tout marquer lu
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Aucune notification.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`py-2.5 px-1.5 flex items-start gap-2.5 rounded-lg cursor-pointer transition-colors ${
                          !n.read ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !n.read ? 'bg-emerald-600' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900 leading-snug">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Cart Pill (in Buyer role) */}
          {activeRole === 'buyer' && (
            <button
              id="btn-quick-cart"
              onClick={() => setActiveBuyerTab('cart')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Panier</span>
              {cartTotalCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                  {cartTotalCount}
                </span>
              )}
            </button>
          )}

          {/* User avatar badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold block leading-tight">{user.fullName}</span>
              <span className="text-[10px] text-slate-400 block">{user.city} (RDC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-3 sm:px-6 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Rôles C’ECO :
          </span>

          {roles.map(r => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                id={`role-btn-${r.id}`}
                onClick={() => setActiveRole(r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight ${
                      isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
