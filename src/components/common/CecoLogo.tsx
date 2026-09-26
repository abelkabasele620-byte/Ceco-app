import React from 'react';

interface CecoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const CecoLogo: React.FC<CecoLogoProps> = ({
  size = 'md',
  showSlogan = false,
  className = '',
  theme = 'light',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Emblem: Secure Shield + Dynamic African Loop */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-700/20`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/6 h-5/6"
        >
          {/* Shield base */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Checkmark + circular flow */}
          <path d="M9 12l2 2 4-4" strokeWidth="2.8" stroke="currentColor" />
        </svg>
        {/* Subtle gold DRC star accent */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white animate-pulse" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${textSizes[size]} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            C’ECO
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            RDC
          </span>
        </div>
        {showSlogan && (
          <span
            className={`text-[11px] font-medium tracking-tight mt-0.5 ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Achète. Paie. Reçois. En toute sécurité.
          </span>
        )}
      </div>
    </div>
  );
};
