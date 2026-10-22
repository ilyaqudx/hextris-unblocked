'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import BrandLogo from './BrandLogo';
import { trackEvent } from '../lib/analytics';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservedPack?: string;
}

export default function WaitlistModal({ isOpen, onClose, reservedPack }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Fetch current waitlist count
    fetch('/api/waitlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && typeof data.count === 'number') {
          setWaitlistCount(data.count);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    trackEvent('click_submit_waitlist', { email, reservedPack });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reservedPack: reservedPack || undefined,
          source: reservedPack ? `pricing_${reservedPack}` : 'hero_waitlist',
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setIsSuccess(true);
        toast.success('You have been added to the waitlist!', {
          description: 'We will notify you first with 3 free video credits upon launch.',
        });
      } else {
        toast.error('Submission failed', {
          description: data.error || 'Please try again later.',
        });
      }
    } catch (err: any) {
      toast.error('Network error', {
        description: err.message || 'Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#121517] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <BrandLogo size="lg" />

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <h3 className="text-2xl font-black text-white">You're On The Priority List!</h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              We've registered <strong className="text-amber-300">{email}</strong> for early access. You'll receive an exclusive invite code with 3 free video credits as soon as the render queue opens.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                🚀 EARLY ACCESS QUEUE
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white mt-3">
                Join the Priority Waitlist
              </h2>
              {reservedPack && (
                <div className="mt-2 text-xs font-semibold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20 inline-block">
                  Reserved Tier: {reservedPack.toUpperCase()} Pack
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Be the first to create viral “Hit the road, dude” AI videos. Waitlist members get priority GPU rendering and <strong className="text-white">3 free video credits</strong> at launch.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 focus:border-amber-400 text-white placeholder-neutral-500 text-sm outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? 'Securing your spot...' : 'Claim Early Access & 3 Free Credits →'}
              </button>
            </form>

            {/* Social Proof */}
            <div className="mt-5 flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {waitlistCount && waitlistCount > 0
                  ? `${waitlistCount + 128} creators waiting in queue`
                  : 'Join 140+ creators on the priority list'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
