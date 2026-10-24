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
        toast.success('You have been added to the priority waitlist!', {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0c1220]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(56,189,248,0.15)] z-10 flex flex-col items-center text-center backdrop-blur-2xl">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent blur-sm rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <BrandLogo size="lg" />

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              ✓
            </div>
            <h3 className="text-2xl font-black text-white">You're On The Priority List!</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              We've registered <strong className="text-sky-300">{email}</strong> for early access.
            </p>

            {/* Clear Next Steps Explanation */}
            <div className="w-full mt-2 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-left flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="text-sky-400 font-bold">📬</span>
                <span><strong>Next step:</strong> We will email your private activation link and <strong className="text-sky-300">3 free video credits</strong> as soon as your batch is ready.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">⏱</span>
                <span><strong>Estimated time:</strong> We roll out slots in batches every 24–48 hours. Check your inbox (or promotions tab)!</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-lg shadow-sky-500/25"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.15)] inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                EARLY ACCESS QUEUE
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white mt-3 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                Join the Priority Waitlist
              </h2>
              {reservedPack && (
                <div className="mt-2 text-xs font-semibold text-sky-300 bg-sky-500/10 px-3 py-1 rounded-xl border border-sky-500/30 inline-block shadow-sm">
                  Reserved Tier: {reservedPack.toUpperCase()}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Be the first to turn your photos into viral “Hit the road, dude” AI videos.
              </p>
            </div>

            {/* Purpose & Value Proposition Box */}
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-left flex flex-col gap-2.5 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>Why waitlist?</strong> To prevent GPU overload and ensure ultra-fast 60s rendering, we onboard creators in controlled batches.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span><strong>How we contact you:</strong> We'll email your private invite link with <strong className="text-sky-300">3 free video credits</strong> when your slot opens.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>100% spam-free. We only email you when your generation slot is live.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full mt-4 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/80 border border-white/15 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 text-white placeholder-slate-500 text-sm outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white font-extrabold text-sm transition shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? 'Securing your spot...' : 'Claim Early Access & 3 Free Credits →'}
              </button>
            </form>

            {/* Social Proof */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
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
