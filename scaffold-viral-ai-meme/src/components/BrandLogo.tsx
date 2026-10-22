import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dimMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const dim = dimMap[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl p-0.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-md shadow-orange-500/20 group hover:shadow-orange-500/30 transition duration-300 ${sizeMap[size]} ${className}`}
    >
      <div className="w-full h-full bg-[#0d0f12] rounded-[14px] flex items-center justify-center overflow-hidden">
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          <defs>
            <linearGradient id="logoAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="logoRoad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective Road converging into horizon */}
          <path
            d="M24 50L28 26H36L40 50H24Z"
            fill="url(#logoRoad)"
            opacity="0.8"
          />
          {/* Road center dividing dash */}
          <line
            x1="32"
            y1="30"
            x2="32"
            y2="34"
            stroke="#FCD34D"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="32"
            y1="39"
            x2="32"
            y2="46"
            stroke="#FCD34D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Iconic Pickup Cab & Windshield */}
          <path
            d="M21 34L24 23C24.8 20.8 26.6 20 29 20H35C37.4 20 39.2 20.8 40 23L43 34H21Z"
            fill="#090B0E"
            stroke="url(#logoAmber)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Pickup Hood & Body Front */}
          <path
            d="M14 41C14 37 17 34 21 34H43C47 34 50 37 50 41V46C50 47.1 49.1 48 48 48H16C14.9 48 14 47.1 14 46V41Z"
            fill="url(#logoAmber)"
          />

          {/* Headlights (Glowing white/amber) */}
          <circle cx="19" cy="40" r="2.5" fill="#FFFFFF" filter="url(#logoGlow)" />
          <circle cx="45" cy="40" r="2.5" fill="#FFFFFF" filter="url(#logoGlow)" />

          {/* Grille slats */}
          <line x1="26" y1="41" x2="38" y2="41" stroke="#090B0E" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="44" x2="36" y2="44" stroke="#090B0E" strokeWidth="2" strokeLinecap="round" />

          {/* AI 4-Point Star Sparkle in top-right */}
          <path
            d="M48 10C48 14 52 14 52 14C52 14 48 14 48 18C48 14 44 14 44 14C44 14 48 14 48 10Z"
            fill="#FCD34D"
            filter="url(#logoGlow)"
          />
        </svg>
      </div>
    </div>
  );
}
