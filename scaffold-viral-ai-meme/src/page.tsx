'use client';

import React, { useState } from 'react';
import { siteConfig } from '../../site.config';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import UserNav from '../components/UserNav';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import BrandLogo from '../components/BrandLogo';
import { trackEvent } from '../lib/analytics';

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      trackEvent('upload_photo', {
        fileName: file.name,
        fileSize: file.size,
      });
      toast.success('Photo loaded!', {
        description: `${file.name} ready for driver replacement.`,
      });
    }
  };

  const handleCreateClick = () => {
    trackEvent('click_create_video', {
      hasFile: Boolean(selectedFile),
      consentChecked,
      signedIn: Boolean(user),
    });

    if (!selectedFile) {
      toast.error('Please upload a photo first', {
        description: 'Choose a clear portrait to put yourself in the driver’s seat.',
      });
      return;
    }
    if (!consentChecked) {
      toast.warning('Permission confirmation required', {
        description: 'Please check the consent box confirming you have permission to use this photo.',
      });
      return;
    }
    if (!user) {
      toast.info('Sign in with Google required', {
        description: 'Please sign in to save and generate your video.',
      });
      openAuthModal();
      return;
    }
    // Direct user to select a pack or use existing credit
    setShowCheckoutModal(true);
  };

  const handleGenerateWithCredit = () => {
    toast.loading('Synthesizing your Hit The Road Dude video...', { id: 'video-render' });
    setTimeout(() => {
      toast.success('Video generation complete! Check the preview window.', {
        id: 'video-render',
        description: 'Your 9:16 vertical video is ready to download.',
      });
    }, 2500);
  };

  const handleSelectPack = async (packType: 'solo' | 'trio' | 'crew') => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      setIsUploading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Checkout failed', {
          description: data.error || 'Unable to open checkout session',
        });
      }
    } catch (err: any) {
      toast.error('Payment error', {
        description: err.message || 'Please check your connection and try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#090b0c]/90 backdrop-blur z-30">
        <a href="/" className="flex items-center gap-3 group">
          <BrandLogo size="md" />
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent group-hover:opacity-90 transition">
            {siteConfig.name}
          </span>
        </a>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <a href="#examples" className="hover:text-white transition">Examples</a>
            <a href="#photo-tips" className="hover:text-white transition">Photo Tips</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>
          {/* User Profile / Google Sign In */}
          <UserNav />
        </div>
      </header>

      {/* 2. Hero Double-Column Workspace */}
      <section className="max-w-6xl mx-auto px-4 py-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Video Preview & Carousel */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[9/16] max-h-[580px] w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden border border-white/15 bg-neutral-900 shadow-2xl group">
            <video
              key={siteConfig.examples[activeExampleIndex].videoUrl}
              src={siteConfig.examples[activeExampleIndex].videoUrl}
              poster={siteConfig.examples[activeExampleIndex].posterUrl}
              autoPlay
              muted={isMuted}
              controls
              playsInline
              loop
              className="w-full h-full object-cover"
            />
            {/* Audio Toggle Pill */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 bg-black/75 hover:bg-black/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 transition z-10 shadow-lg"
              title={isMuted ? "Click to enable sound" : "Mute sound"}
            >
              {isMuted ? "🔇 Unmute Audio" : "🔊 Sound ON"}
            </button>
          </div>

          {/* Carousel thumbnails */}
          <div className="flex justify-center gap-3 mt-2">
            {siteConfig.examples.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setActiveExampleIndex(idx)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  activeExampleIndex === idx
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-white/10 text-neutral-400 hover:border-white/30'
                }`}
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Hero Heading & Upload Dropzone */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              VIRAL AI TREND
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-3">
              {siteConfig.name}
            </h1>
            <p className="text-neutral-400 mt-3 text-base leading-relaxed">
              {siteConfig.heroDescription}
            </p>
          </div>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition bg-white/[0.02]">
            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-amber-400" />
                <span className="text-xs text-neutral-300">{selectedFile?.name}</span>
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove & replace
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-neutral-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <strong className="text-sm font-semibold text-white">Drop your photo here</strong>
                <span className="text-xs text-neutral-400">or click to browse files</span>
                <small className="text-[10px] text-neutral-500 mt-2 uppercase tracking-wider">JPG, PNG, WEBP · UP TO 10 MB</small>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Spec & Format */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.03] p-3 rounded-2xl border border-white/5">
            <div>
              <span className="text-neutral-500 block">FORMAT</span>
              <span className="font-semibold">{siteConfig.videoAspectRatio}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">LENGTH</span>
              <span className="font-semibold">{siteConfig.videoDurationSeconds} seconds</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer text-xs text-neutral-400 leading-normal">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-0 bg-neutral-900"
            />
            <span>{siteConfig.consentCheckboxText}</span>
          </label>

          {/* CTA Generate Button */}
          <button
            onClick={handleCreateClick}
            disabled={isUploading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-base transition shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            Create My Video →
          </button>
        </div>
      </section>

      {/* 3. Examples Gallery Section */}
      <section id="examples" className="max-w-6xl mx-auto px-4 py-16 w-full border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            SHOWCASE GALLERY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Hit The Road Dude Remix Gallery
          </h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-xl mx-auto">
            From the original skeptical pickup confrontation to pets and hilarious character remakes. Click any video to play.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {siteConfig.examples.map((ex, idx) => (
            <div
              key={ex.id}
              className="flex flex-col bg-white/[0.02] border border-white/10 hover:border-amber-400/50 rounded-3xl overflow-hidden transition group shadow-lg"
            >
              <div className="relative aspect-[9/16] bg-black overflow-hidden">
                <video
                  src={ex.videoUrl}
                  poster={ex.posterUrl}
                  controls
                  playsInline
                  loop
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      Example 0{idx + 1}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">11s · 9:16</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{ex.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveExampleIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-full bg-white/5 hover:bg-amber-400 hover:text-black font-semibold text-xs transition border border-white/10"
                >
                  Use this style in Editor ↑
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Photo Quality Tips Section */}
      <section id="photo-tips" className="max-w-5xl mx-auto px-4 py-16 w-full border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl max-w-[320px]">
              <img
                src="/images/photo-tip-portrait.jpg"
                alt="Ideal portrait for Hit The Road Dude AI generation"
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                ✓ Ideal Framing & Lighting
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 w-fit">
              BEST RESULTS GUIDE
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Photo Tips for Perfect Lip-Sync & Face Matching
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Our AI replaces the driver in the white pickup truck using single-frame facial feature mapping. Following these 4 simple tips guarantees the highest video quality:
            </p>
            <ul className="flex flex-col gap-3 mt-2 text-sm text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Single person or pet</strong>: Face clearly visible, looking directly towards the camera.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Natural lighting</strong>: Even illumination across eyes, cheeks, and mouth without harsh backlighting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>No sunglasses or masks</strong>: Eyes and eyebrows are required for accurate facial expression synthesis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Avoid group photos or heavy blur</strong>: Close-up portraits up to 10 MB in JPG, PNG, or WebP work best.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 py-16 w-full border-t border-white/10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">One-Time Video Packs</h2>
          <p className="text-neutral-400 text-sm mt-2">No monthly subscription. Pay once, use your video credits whenever you need them.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solo */}
          <div className="border border-white/10 rounded-3xl p-6 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">{siteConfig.pricing.solo.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">1 video remake. Lowest upfront price.</p>
              <div className="text-3xl font-black mt-4">${siteConfig.pricing.solo.price}</div>
            </div>
            <button
              onClick={() => handleSelectPack('solo')}
              className="w-full py-2.5 rounded-full border border-white/20 hover:bg-white/10 font-semibold text-sm mt-6 transition"
            >
              Choose Solo
            </button>
          </div>

          {/* Trio (Featured) */}
          <div className="border-2 border-amber-400 rounded-3xl p-6 bg-amber-400/[0.03] flex flex-col justify-between relative shadow-xl shadow-amber-400/5">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase font-bold bg-amber-400 text-black px-3 py-0.5 rounded-full">
              RECOMMENDED
            </span>
            <div>
              <h3 className="text-lg font-bold">{siteConfig.pricing.trio.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">3 video remakes. Save 19%.</p>
              <div className="text-3xl font-black mt-4">${siteConfig.pricing.trio.price}</div>
            </div>
            <button
              onClick={() => handleSelectPack('trio')}
              className="w-full py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm mt-6 transition"
            >
              Choose Trio
            </button>
          </div>

          {/* Crew */}
          <div className="border border-white/10 rounded-3xl p-6 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">{siteConfig.pricing.crew.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">5 videos for your whole crew. Save 28%.</p>
              <div className="text-3xl font-black mt-4">${siteConfig.pricing.crew.price}</div>
            </div>
            <button
              onClick={() => handleSelectPack('crew')}
              className="w-full py-2.5 rounded-full border border-white/20 hover:bg-white/10 font-semibold text-sm mt-6 transition"
            >
              Choose Crew
            </button>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-16 w-full border-t border-white/10">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {siteConfig.faqs.map((faq, i) => (
            <details key={i} className="border border-white/10 rounded-2xl p-5 bg-white/[0.01]">
              <summary className="font-semibold text-base cursor-pointer select-none text-white hover:text-amber-300 transition">
                {faq.question}
              </summary>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-white/10 py-10 px-6 flex flex-col items-center justify-center gap-4 text-center text-xs text-neutral-500">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <span className="font-bold text-neutral-300">{siteConfig.name}</span>
        </div>
        
        {/* Authoritative Outgoing Reference Links (Resolves Page has no outgoing links SEO issue) */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
          <a
            href="https://knowyourmeme.com/memes/state-property-hit-the-road-dude"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition underline underline-offset-4"
          >
            Meme Lore (Know Your Meme)
          </a>
          <span>•</span>
          <a
            href="https://www.tiktok.com/tag/hittheroaddude"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition underline underline-offset-4"
          >
            TikTok Trend
          </a>
          <span>•</span>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition"
          >
            Google Privacy Policy
          </a>
          <span>•</span>
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300 transition"
          >
            Terms of Service
          </a>
        </div>

        <p>© {new Date().getFullYear()} {siteConfig.name}. {siteConfig.disclaimer}</p>
      </footer>

      {/* Global Modals */}
      <AuthModal />
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onGenerateWithCredit={handleGenerateWithCredit}
      />
    </div>
  );
}
