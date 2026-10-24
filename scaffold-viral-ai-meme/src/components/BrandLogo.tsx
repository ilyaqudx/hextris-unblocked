import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeMap = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
    xl: 'w-14 h-14 p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 30,
  };

  const isz = iconSizes[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-[#ff5a3d]/15 border border-[#ff5a3d]/30 text-[#ff5a3d] shadow-sm group-hover:bg-[#ff5a3d]/25 group-hover:border-[#ff5a3d]/50 transition-all duration-200 ${sizeMap[size]} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={isz}
        height={isz}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        {/* Pickup Truck Cab and Body */}
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    </div>
  );
}
