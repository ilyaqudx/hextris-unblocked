'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';

export default function UserNav() {
  const { user, openAuthModal, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={openAuthModal}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold text-white border border-white/15 transition shadow-sm active:scale-95"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Credit Balance Badge */}
      <a
        href="#pricing"
        className="text-xs bg-amber-400/10 text-amber-300 border border-amber-400/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 hover:bg-amber-400/20 transition cursor-pointer"
        title="Your video credits"
      >
        <span>⚡</span>
        <span>{user.credits} {user.credits === 1 ? 'Credit' : 'Credits'}</span>
      </a>

      {/* User Avatar Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 rounded-full border border-white/20 hover:border-amber-400/50 transition bg-white/5"
        aria-label="User menu"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-semibold text-neutral-300 pr-2 hidden sm:inline max-w-[100px] truncate">
          {user.name}
        </span>
      </button>

      {/* User Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-12 w-56 bg-[#16191c] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 text-xs">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
          </div>

          <a
            href="#pricing"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition"
          >
            <span>Buy Credits</span>
            <span className="text-amber-400 font-bold">⚡ {user.credits}</span>
          </a>

          <button
            onClick={() => {
              setDropdownOpen(false);
              signOut();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition mt-1 border-t border-white/5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
