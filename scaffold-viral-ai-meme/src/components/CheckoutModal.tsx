'use client';

import React, { useState } from 'react';
import { siteConfig } from '../../site.config';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import BrandLogo from './BrandLogo';
import { trackEvent } from '../lib/analytics';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateWithCredit: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onGenerateWithCredit,
}: CheckoutModalProps) {
  const { user, useCredit } = useAuth();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPack = async (packType: 'solo' | 'trio' | 'crew') => {
    trackEvent('checkout_pack_select', {
      pack: packType,
      price: siteConfig.pricing[packType].price,
    });

    try {
      setLoadingPack(packType);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Checkout error', {
          description: data.error || 'Failed to initiate Stripe session',
        });
      }
    } catch (err: any) {
      toast.error('Payment initiation error', {
        description: err.message || 'Please check your internet connection',
      });
    } finally {
      setLoadingPack(null);
    }
  };

  const handleUseCreditClick = () => {
    trackEvent('use_credit_render', {
      remainingCredits: (user?.credits || 1) - 1,
    });
    const success = useCredit();
    if (success) {
      onClose();
      onGenerateWithCredit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#121517] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <BrandLogo size="md" className="mb-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            VIDEO PACKS
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-3">
            Choose a Video Pack
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            No subscription. Pay once, use your video credits anytime.
          </p>
        </div>

        {/* If user has existing credits */}
        {user && user.credits > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-300 font-semibold">Available Balance</p>
              <p className="text-lg font-black text-white">⚡ {user.credits} {user.credits === 1 ? 'Credit' : 'Credits'}</p>
            </div>
            <button
              onClick={handleUseCreditClick}
              className="py-2 px-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition shadow"
            >
              Use 1 Credit & Render Now →
            </button>
          </div>
        )}

        {/* Pack Options */}
        <div className="flex flex-col gap-3">
          {/* Solo */}
          <div className="border border-white/10 hover:border-white/20 rounded-2xl p-4 bg-white/[0.02] flex items-center justify-between transition">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{siteConfig.pricing.solo.name}</h4>
                <span className="text-[10px] text-neutral-400">1 Video Credit</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Lowest upfront price</p>
            </div>
            <button
              onClick={() => handleSelectPack('solo')}
              disabled={loadingPack !== null}
              className="py-2 px-5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition disabled:opacity-50"
            >
              {loadingPack === 'solo' ? 'Redirecting...' : `$${siteConfig.pricing.solo.price}`}
            </button>
          </div>

          {/* Trio (Recommended) */}
          <div className="border-2 border-amber-400 rounded-2xl p-4 bg-amber-400/[0.04] flex items-center justify-between transition relative shadow-lg shadow-amber-400/5">
            <span className="absolute -top-2.5 right-6 text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-full">
              POPULAR · SAVE 19%
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{siteConfig.pricing.trio.name}</h4>
                <span className="text-[10px] text-amber-300 font-semibold">3 Video Credits</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">$5.66 per video</p>
            </div>
            <button
              onClick={() => handleSelectPack('trio')}
              disabled={loadingPack !== null}
              className="py-2 px-5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition disabled:opacity-50 shadow"
            >
              {loadingPack === 'trio' ? 'Redirecting...' : `$${siteConfig.pricing.trio.price}`}
            </button>
          </div>

          {/* Crew */}
          <div className="border border-white/10 hover:border-white/20 rounded-2xl p-4 bg-white/[0.02] flex items-center justify-between transition">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{siteConfig.pricing.crew.name}</h4>
                <span className="text-[10px] text-neutral-400">5 Video Credits</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Save 28% for group remixes</p>
            </div>
            <button
              onClick={() => handleSelectPack('crew')}
              disabled={loadingPack !== null}
              className="py-2 px-5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition disabled:opacity-50"
            >
              {loadingPack === 'crew' ? 'Redirecting...' : `$${siteConfig.pricing.crew.price}`}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-neutral-500 mt-5">
          🔒 Secure 256-bit Stripe checkout · Instant credit activation · No subscription
        </p>
      </div>
    </div>
  );
}
