import React from 'react';
import { Truck } from 'lucide-react';

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

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-[#ff5a3d]/15 border border-[#ff5a3d]/30 text-[#ff5a3d] shadow-sm group-hover:bg-[#ff5a3d]/25 group-hover:border-[#ff5a3d]/50 transition-all duration-200 ${sizeMap[size]} ${className}`}
    >
      <Truck size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
}
