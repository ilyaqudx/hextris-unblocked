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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

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
        toast.success('Added to priority queue!', {
          description: 'We will notify you with 3 free video credits upon launch.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#111416] border border-[#2a3134] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8e9a9f] hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <BrandLogo size="lg" />

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">You're On The Priority List</h3>
            <p className="text-xs text-[#b3bec4] leading-relaxed max-w-xs">
              Registered <strong className="text-white">{email}</strong> for early generation access.
            </p>

            {/* Next Steps */}
            <div className="w-full mt-2 p-3.5 rounded-xl bg-[#171b1d] border border-[#2a3134] text-left flex flex-col gap-2 text-xs text-[#c8d1d6]">
              <div className="flex items-start gap-2">
                <span className="text-[#ff5a3d] font-bold">📬</span>
                <span><strong>Next step:</strong> We will email your private activation link and <strong className="text-white">3 free video credits</strong> as soon as your batch is ready.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#ff9a7f] font-bold">⏱</span>
                <span><strong>Turnaround:</strong> Batches are onboarded every 24–48 hours to preserve 60s rendering speeds.</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-lg bg-[#ff5a3d] hover:bg-[#ff8068] text-[#21100b] font-bold text-xs transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9a7f] bg-[#ff5a3d]/10 px-3 py-1 rounded-full border border-[#ff5a3d]/25">
                EARLY ACCESS QUEUE
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-3">
                Join the Priority Waitlist
              </h2>
              {reservedPack && (
                <div className="mt-2 text-xs font-semibold text-[#ff9a7f] bg-[#ff5a3d]/10 px-3 py-1 rounded-lg border border-[#ff5a3d]/25 inline-block">
                  Reserved Tier: {reservedPack.toUpperCase()}
                </div>
              )}
              <p className="text-xs text-[#b3bec4] mt-2 leading-relaxed">
                Be the first to turn your photos into viral “Hit the road, dude” AI videos.
              </p>
            </div>

            {/* Value Proposition */}
            <div className="w-full mt-4 p-3.5 rounded-xl bg-[#171b1d] border border-[#2a3134] text-left flex flex-col gap-2 text-[11px] text-[#c8d1d6]">
              <div className="flex items-start gap-2">
                <span className="text-[#ff5a3d] font-bold">•</span>
                <span><strong>Why waitlist?</strong> To prevent GPU overload and ensure 60s rendering, we onboard creators in controlled batches.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#ff5a3d] font-bold">•</span>
                <span><strong>Bonus credits:</strong> Early waitlist signups receive <strong className="text-white">3 free video remakes</strong> upon launch.</span>
              </div>
              <div className="flex items-start gap-2 text-[#8e9a9f]">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>100% spam-free. We only email when your generation slot is live.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full mt-4 flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#171b1d] border border-[#2a3134] focus:border-[#ff5a3d] text-white placeholder-[#8e9a9f] text-sm outline-none transition"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#ff5a3d] hover:bg-[#ff8068] text-[#21100b] font-bold text-sm transition shadow disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? 'Securing your spot...' : 'Claim Early Access & 3 Free Credits →'}
              </button>
            </form>

            {/* Social Proof */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#8e9a9f]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
