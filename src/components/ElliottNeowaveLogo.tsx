import React, { useState } from 'react';

interface ElliottNeowaveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ElliottNeowaveLogo: React.FC<ElliottNeowaveLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Pixel dimensions based on size
  const sizeMap = {
    sm: { box: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-base', sub: 'text-xs' },
    xl: { box: 'w-18 h-18 sm:w-20 sm:h-20', icon: 'w-10 h-10 sm:w-12 sm:h-12', text: 'text-lg', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon Box */}
      <div
        className={`${currentSize.box} rounded-2xl bg-gradient-to-b from-[#14171a] to-[#090a0c] border border-[#27272a] flex items-center justify-center shrink-0 shadow-xl relative overflow-hidden group`}
      >
        {/* Subtle Neon Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(29,155,240,0.15),transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity" />

        {!imgError ? (
          <img
            src="https://elliottneowave.ir/favicon.ico"
            alt="Elliott Neowave Logo"
            className={`${currentSize.icon} object-contain relative z-10 filter drop-shadow-[0_2px_8px_rgba(29,155,240,0.3)] transition-transform group-hover:scale-105`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Fidelity Custom Elliott Neowave Vector Insignia */
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${currentSize.icon} relative z-10`}
          >
            {/* Background Grid Accent */}
            <circle cx="24" cy="24" r="21" stroke="#27272a" strokeWidth="1.2" strokeDasharray="3 3" />
            
            {/* Neowave Dynamic Impulse & Correction Polywave */}
            {/* Wave 1-2-3-4-5 (Gold/Cyan) */}
            <path
              d="M7 34 L14 26 L19 30 L27 12 L33 22 L41 8"
              stroke="url(#enGradient)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Wave Nodes */}
            <circle cx="14" cy="26" r="2" fill="#1d9bf0" />
            <circle cx="19" cy="30" r="2" fill="#f59e0b" />
            <circle cx="27" cy="12" r="2.5" fill="#10b981" />
            <circle cx="33" cy="22" r="2" fill="#f59e0b" />
            <circle cx="41" cy="8" r="3" fill="#38bdf8" />
            
            {/* Secondary Golden Ratio Harmonizer Arc */}
            <path
              d="M10 38 C18 41, 30 40, 39 31"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="enGradient" x1="7" y1="34" x2="41" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="0.5" stopColor="#1d9bf0" />
                <stop offset="1" stopColor="#00ba7c" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.text} font-black text-white tracking-tight`}>
              Elliott Neowave
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#16181c] text-[#1d9bf0] border border-[#1d9bf0]/30">
              IR
            </span>
          </div>
          <span className={`${currentSize.sub} text-[#71767b] font-mono`}>
            elliottneowave.ir
          </span>
        </div>
      )}
    </div>
  );
};
