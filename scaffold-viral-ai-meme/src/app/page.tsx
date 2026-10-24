'use client';

import React, { useState } from 'react';
import { siteConfig } from '../../site.config';
import { toast } from 'sonner';
import WaitlistModal from '../components/WaitlistModal';
import BrandLogo from '../components/BrandLogo';
import { trackEvent } from '../lib/analytics';

export default function HomePage() {
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [reservedPack, setReservedPack] = useState<string | undefined>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      trackEvent('upload_photo', {
        fileName: file.name,
        fileSize: file.size,
      });
      toast.success('Photo loaded successfully!', {
        description: `${file.name} is ready for driver face synthesis.`,
      });
    }
  };

  const handleCreateClick = () => {
    trackEvent('click_create_video', {
      hasFile: Boolean(selectedFile),
      consentChecked,
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
    // Direct user to priority waitlist modal with free credits
    setReservedPack('Driver Preview');
    setShowWaitlistModal(true);
  };

  const handleSelectPack = (packType: 'solo' | 'trio' | 'crew') => {
    const packName = siteConfig.pricing[packType].name;
    trackEvent('click_select_pack', {
      packType,
      packName,
      price: siteConfig.pricing[packType].price,
    });
    setReservedPack(packName);
    setShowWaitlistModal(true);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background Ambient Cyber Halos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      {/* 1. Header */}
      <header className="border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 bg-[#090d16]/80 backdrop-blur-xl z-40">
        <a href="/" className="flex items-center gap-3 group">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent group-hover:opacity-90 transition">
              {siteConfig.name}
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.15)]">
              AI ENGINE
            </span>
          </div>
        </a>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#examples" className="hover:text-sky-300 transition-colors">Examples</a>
            <a href="#photo-tips" className="hover:text-sky-300 transition-colors">Photo Tips</a>
            <a href="#pricing" className="hover:text-sky-300 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-sky-300 transition-colors">FAQ</a>
          </nav>
          {/* Join Waitlist CTA Button */}
          <button
            onClick={() => {
              setReservedPack(undefined);
              setShowWaitlistModal(true);
              trackEvent('click_nav_waitlist_btn');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-95 border border-white/20 flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Join Waitlist</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Double-Column Workspace */}
      <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Mobile Phone Frame / 9:16 Video Player */}
        <div className="flex flex-col items-center">
          <div className="relative group w-full max-w-[320px] sm:max-w-[340px]">
            {/* Ambient Backlight Halo behind Phone */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/25 via-indigo-500/20 to-purple-500/20 rounded-[44px] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Smartphone Outer Bezel */}
            <div className="relative rounded-[40px] p-2.5 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/90 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-2xl">
              {/* Dynamic Island / Notch */}
              <div className="w-20 h-3.5 bg-black/90 rounded-full mx-auto absolute top-3.5 left-1/2 -translate-x-1/2 z-20 border border-white/10 flex items-center justify-end px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
              </div>

              {/* Inner Screen Video Container */}
              <div className="relative aspect-[9/16] rounded-[30px] overflow-hidden bg-black/95">
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

                {/* Status Chip (Top Left) */}
                <div className="absolute top-4 left-4 z-10 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-slate-300 font-mono flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>11s Loop</span>
                </div>

                {/* Audio Toggle Floating Pill */}
                <button
                  onClick={() => {
                    const nextMuted = !isMuted;
                    setIsMuted(nextMuted);
                    trackEvent('click_toggle_mute', { muted: nextMuted });
                  }}
                  className="absolute bottom-4 right-4 bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-1.5 transition z-10 shadow-lg hover:border-sky-400/40"
                  title={isMuted ? "Click to enable sound" : "Mute sound"}
                >
                  {isMuted ? "🔇 Unmute Audio" : "🔊 Sound ON"}
                </button>
              </div>
            </div>
          </div>

          {/* Carousel thumbnails */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-5">
            {siteConfig.examples.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveExampleIndex(idx);
                  trackEvent('click_switch_example', { exampleId: ex.id, title: ex.title, index: idx });
                }}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                  activeExampleIndex === idx
                    ? 'border-sky-400 bg-sky-500/15 text-sky-300 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : 'border-white/10 bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Hero Heading & Upload Console */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              VIRAL AI MEME ENGINE
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 leading-[1.12]">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Put Yourself In The
              </span>
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                “Hit The Road, Dude”
              </span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"> Meme</span>
            </h1>

            <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
              {siteConfig.heroDescription}
            </p>
          </div>

          {/* High-Tech Upload Dropzone Card */}
          <div className="relative group border-2 border-dashed border-white/15 hover:border-sky-400/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xl shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.12)]">
            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-white">{selectedFile?.name}</span>
                  <span className="text-xs text-emerald-400 mt-0.5">✓ Ready for driver replacement</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    trackEvent('click_remove_photo');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline mt-1 transition"
                >
                  Change & upload another photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2 w-full py-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-105 group-hover:border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <strong className="text-base font-bold text-white group-hover:text-sky-300 transition">
                  Drop your portrait photo here
                </strong>
                <span className="text-xs text-slate-400">or click to browse from device</span>
                <span className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
                  JPG, PNG, WEBP · UP TO 10 MB
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Engine Specs Strip */}
          <div className="grid grid-cols-3 gap-2.5 text-xs bg-slate-900/50 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Format</span>
              <span className="font-bold text-white mt-0.5 block">{siteConfig.videoAspectRatio}</span>
            </div>
            <div className="text-center border-x border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Length</span>
              <span className="font-bold text-white mt-0.5 block">{siteConfig.videoDurationSeconds} Seconds</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">GPU Speed</span>
              <span className="font-bold text-sky-400 mt-0.5 block">⚡ Fast 60s</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-400 leading-normal p-1 select-none">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => {
                setConsentChecked(e.target.checked);
                trackEvent('click_toggle_consent', { checked: e.target.checked });
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>{siteConfig.consentCheckboxText}</span>
          </label>

          {/* Glowing Radiant CTA Generate Button */}
          <button
            onClick={handleCreateClick}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white font-black text-base transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:shadow-[0_0_45px_rgba(56,189,248,0.55)] active:scale-[0.99] flex items-center justify-center gap-2 group border border-white/20"
          >
            <span>Create My Video</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </section>

      {/* 3. Examples Gallery Section */}
      <section id="examples" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full border-t border-white/[0.08]">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] inline-block">
            MEME REMIX GALLERY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-white">
            Hit The Road Dude Remix Gallery
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2.5 max-w-xl mx-auto">
            From the classic white pickup confrontation to pets and viral characters. Click any video to test audio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {siteConfig.examples.map((ex, idx) => (
            <div
              key={ex.id}
              className="flex flex-col bg-slate-900/60 border border-white/10 hover:border-sky-500/40 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-[0_15px_35px_-5px_rgba(56,189,248,0.15)] hover:-translate-y-1 group"
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                      Style 0{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">11s · 9:16 HD</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2.5">{ex.title}</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveExampleIndex(idx);
                    trackEvent('click_use_example_style', { exampleId: ex.id, title: ex.title, index: idx });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-sky-500 hover:text-white text-slate-200 font-bold text-xs transition-all duration-200 border border-white/10 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>Use this style in Editor</span>
                  <span>↑</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Photo Quality Tips Section */}
      <section id="photo-tips" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 w-full border-t border-white/[0.08]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.12)] max-w-[320px] group">
              <img
                src="/images/photo-tip-portrait.jpg"
                alt="Ideal portrait for Hit The Road Dude AI generation"
                className="w-full h-auto object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-emerald-400/40">
                <span>✓</span>
                <span>Optimal Photo Framing</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/30 w-fit shadow-[0_0_12px_rgba(56,189,248,0.15)]">
              QUALITY BENCHMARK
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Photo Tips for Perfect Lip-Sync & Face Matching
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our AI replaces the pickup driver using single-frame facial geometry mapping. Following these 4 simple recommendations ensures crisp cinematic rendering:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur flex flex-col gap-1.5">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <span>✓</span> Single Person or Pet
                </span>
                <span className="text-xs text-slate-300 leading-normal">
                  Face clearly visible and looking directly into camera lens.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur flex flex-col gap-1.5">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <span>✓</span> Balanced Lighting
                </span>
                <span className="text-xs text-slate-300 leading-normal">
                  Even illumination without harsh backlit glare or shadows.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur flex flex-col gap-1.5">
                <span className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                  <span>✕</span> No Sunglasses or Masks
                </span>
                <span className="text-xs text-slate-300 leading-normal">
                  Eyes and eyebrows needed for facial expression tracking.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur flex flex-col gap-1.5">
                <span className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                  <span>✕</span> Avoid Heavy Blur
                </span>
                <span className="text-xs text-slate-300 leading-normal">
                  Close-up portraits up to 10 MB in JPG, PNG, or WebP.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section (One-Time Video Packs) */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 w-full border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] inline-block">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-white">
            One-Time Video Packs. Never Re-billed.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            No recurring subscription. Pay once, use your video credits whenever you need them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Solo Card */}
          <div className="border border-white/10 rounded-3xl p-7 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                Single Video
              </span>
              <h3 className="text-xl font-bold text-white mt-3">{siteConfig.pricing.solo.name}</h3>
              <p className="text-xs text-slate-400 mt-1">1 video remake. Perfect for testing your first meme remix.</p>
              <div className="text-4xl font-black text-white mt-5">
                ${siteConfig.pricing.solo.price}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 1 video</span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>1 High-Resolution 9:16 Video</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Single-Photo AI Face Matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Synchronized Lip-Sync Audio</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Instant MP4 Download</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPack('solo')}
              className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs mt-8 transition-all"
            >
              Choose Solo Pack
            </button>
          </div>

          {/* Trio (Featured / Most Popular) */}
          <div className="relative border-2 border-sky-400/80 rounded-3xl p-7 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-[#0c1220] backdrop-blur-xl flex flex-col justify-between shadow-[0_0_40px_rgba(56,189,248,0.22)] hover:shadow-[0_0_55px_rgba(56,189,248,0.35)] -translate-y-2 transition-all duration-300">
            {/* Recommended Floating Pill */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase font-black bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full shadow-lg shadow-sky-500/30 border border-white/20">
              RECOMMENDED · BEST VALUE
            </span>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  SAVE 19%
                </span>
                <span className="text-xs text-slate-400 font-mono">$5.66 / video</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-3">{siteConfig.pricing.trio.name} Pack</h3>
              <p className="text-xs text-slate-400 mt-1">3 video remakes. Try yourself, friends, or pets.</p>
              <div className="text-4xl font-black text-white mt-5">
                ${siteConfig.pricing.trio.price}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 3 videos</span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>3 High-Resolution 9:16 Videos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Priority GPU Queue Allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Support for Both Humans & Pets</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Commercial Use Rights</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Credit Returned If Render Fails</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPack('trio')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs mt-8 transition-all duration-200 shadow-[0_0_25px_rgba(56,189,248,0.35)] active:scale-95 border border-white/20"
            >
              Choose Trio Pack
            </button>
          </div>

          {/* Crew Card */}
          <div className="border border-white/10 rounded-3xl p-7 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  SAVE 28%
                </span>
                <span className="text-xs text-slate-400 font-mono">$4.99 / video</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-3">{siteConfig.pricing.crew.name} Pack</h3>
              <p className="text-xs text-slate-400 mt-1">5 videos for your whole group, team, or channel.</p>
              <div className="text-4xl font-black text-white mt-5">
                ${siteConfig.pricing.crew.price}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 5 videos</span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>5 High-Resolution 9:16 Videos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Fastest Turbo GPU Processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Highest Bitrate Render Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>Dedicated Creator Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPack('crew')}
              className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs mt-8 transition-all"
            >
              Choose Crew Pack
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 w-full border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] inline-block">
            EVERYTHING YOU NEED TO KNOW
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-4 text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3.5">
          {siteConfig.faqs.map((faq, i) => (
            <details
              key={i}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  trackEvent('click_expand_faq', { question: faq.question });
                }
              }}
              className="group border border-white/10 hover:border-sky-500/30 rounded-2xl p-5 bg-slate-900/50 backdrop-blur-xl transition duration-200"
            >
              <summary className="font-semibold text-base cursor-pointer select-none text-white group-hover:text-sky-300 transition flex items-center justify-between list-none">
                <span>{faq.question}</span>
                <span className="text-slate-500 group-hover:text-sky-400 transition-transform group-open:rotate-45 text-lg font-bold">
                  +
                </span>
              </summary>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed border-t border-white/5 pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 flex flex-col items-center justify-center gap-5 text-center text-xs text-slate-500 bg-[#070a12]">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <span className="font-bold text-slate-300 text-sm">{siteConfig.name}</span>
        </div>

        {/* Authoritative Outgoing Reference Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <a
            href="https://knowyourmeme.com/memes/state-property-hit-the-road-dude"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-300 transition underline underline-offset-4"
          >
            Meme Lore (Know Your Meme)
          </a>
          <span>•</span>
          <a
            href="https://www.tiktok.com/tag/hittheroaddude"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-300 transition underline underline-offset-4"
          >
            TikTok Trend
          </a>
          <span>•</span>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition"
          >
            Google Privacy Policy
          </a>
          <span>•</span>
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition"
          >
            Terms of Service
          </a>
        </div>

        <p className="max-w-md text-[11px] text-slate-500 leading-relaxed">
          © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.disclaimer}
        </p>
      </footer>

      {/* Global Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        reservedPack={reservedPack}
      />
    </div>
  );
}
