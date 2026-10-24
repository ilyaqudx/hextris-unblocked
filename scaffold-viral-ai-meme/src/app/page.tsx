'use client';

import React, { useState } from 'react';
import { siteConfig } from '../../site.config';
import { toast } from 'sonner';
import WaitlistModal from '../components/WaitlistModal';
import BrandLogo from '../components/BrandLogo';
import { trackEvent } from '../lib/analytics';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  ArrowRight,
  Expand,
  Check,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [reservedPack, setReservedPack] = useState<string | undefined>(undefined);

  const totalExamples = siteConfig.examples.length;

  const handlePrevExample = () => {
    const nextIdx = (activeExampleIndex - 1 + totalExamples) % totalExamples;
    setActiveExampleIndex(nextIdx);
    trackEvent('click_switch_example', {
      exampleId: siteConfig.examples[nextIdx].id,
      title: siteConfig.examples[nextIdx].title,
      index: nextIdx,
    });
  };

  const handleNextExample = () => {
    const nextIdx = (activeExampleIndex + 1) % totalExamples;
    setActiveExampleIndex(nextIdx);
    trackEvent('click_switch_example', {
      exampleId: siteConfig.examples[nextIdx].id,
      title: siteConfig.examples[nextIdx].title,
      index: nextIdx,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      trackEvent('upload_photo', {
        fileName: file.name,
        fileSize: file.size,
      });
      toast.success('Photo uploaded successfully!', {
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

  const scrollToCreate = () => {
    const el = document.getElementById('create');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative text-[#f5f6f6] bg-[#090b0c]">
      {/* 1. Header with Centered Navigation and Larger Font */}
      <header className="h-[72px] border-b border-white/[0.08] px-6 sm:px-12 sticky top-0 bg-[#090b0cf2] backdrop-blur-md z-40">
        <div className="max-w-[1320px] mx-auto h-full flex items-center justify-between relative">
          {/* Left Brand Logo */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <BrandLogo size="md" />
            <span className="text-[17px] sm:text-lg font-bold tracking-tight text-white group-hover:text-white/90 transition">
              Hit The Road <span className="text-[#ff5a3d]">Dude AI</span>
            </span>
          </a>

          {/* Centered Navigation */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-[15px] font-medium text-[#b3bec4] absolute left-1/2 -translate-x-1/2">
            <a href="#create" className="hover:text-white transition-colors py-1">Create</a>
            <a href="#how-it-works" className="hover:text-white transition-colors py-1">How it works</a>
            <a href="#trend" className="hover:text-white transition-colors py-1">Explore the trend</a>
            <a href="#photo-tips" className="hover:text-white transition-colors py-1">Photo Tips</a>
            <a href="#pricing" className="hover:text-white transition-colors py-1">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors py-1">FAQ</a>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                setReservedPack(undefined);
                setShowWaitlistModal(true);
                trackEvent('click_nav_waitlist_btn');
              }}
              className="v-btn-primary px-4 sm:px-5 py-2 text-[14px] font-bold shadow-sm"
            >
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section & Workspace */}
      <section className="max-w-[1240px] mx-auto px-6 pt-12 pb-16 w-full">
        {/* Centered Hero Heading: Single Line on PC, 2-line Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-[38px] lg:text-[46px] xl:text-[52px] font-bold tracking-tight text-white leading-tight md:whitespace-nowrap">
            Hit The Road Dude AI <span className="text-[#ff5a3d]">Video Generator</span>
          </h1>

          <p className="max-w-[820px] mx-auto text-base sm:text-[17px] text-[#b3bec4] mt-3.5 leading-[1.65]">
            Take the driver's seat in the “Hit the road, dude” meme. One photo, a white pickup and that skeptical “State?” reaction — in an 11-second, 9:16 vertical video. No truck, filming or prompt to write.
          </p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-10 max-w-5xl mx-auto">
          {/* Left Column: High-End 3D Reel Carousel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col" id="examples">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8e9a9f] px-2 mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a3d]" />
                Meme Remix Examples
              </span>
              <span>3 Video Previews</span>
            </div>

            {/* 3D Layered Reel Container */}
            <div className="v-carousel">
              {/* Prev Navigation Arrow */}
              <button
                type="button"
                onClick={handlePrevExample}
                className="v-carousel-arrow prev"
                aria-label="Previous example"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              {/* Render 3 Reels with 3D Positioning */}
              {siteConfig.examples.map((ex, idx) => {
                const isCurrent = idx === activeExampleIndex;
                const isLeft = idx === (activeExampleIndex - 1 + totalExamples) % totalExamples;
                const isRight = idx === (activeExampleIndex + 1) % totalExamples;

                let reelClass = 'v-reel';
                if (isCurrent) reelClass += ' is-active';
                else if (isLeft) reelClass += ' is-left';
                else if (isRight) reelClass += ' is-right';

                return (
                  <div
                    key={ex.id}
                    className={reelClass}
                    onClick={() => {
                      if (!isCurrent) {
                        setActiveExampleIndex(idx);
                        trackEvent('click_switch_example', { exampleId: ex.id, title: ex.title, index: idx });
                      }
                    }}
                  >
                    {isCurrent ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          key={ex.videoUrl}
                          src={ex.videoUrl}
                          poster={ex.posterUrl}
                          autoPlay
                          muted={isMuted}
                          controls
                          playsInline
                          loop
                          className="w-full h-full object-cover"
                        />
                        {/* Top Overlay */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                          <span className="bg-black/70 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] text-white/90 font-mono">
                            11s · 9:16
                          </span>
                          <span className="text-white/70 p-1">
                            <Expand className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        {/* Standardized Enterprise Sound Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextMuted = !isMuted;
                            setIsMuted(nextMuted);
                            trackEvent('click_toggle_mute', { muted: nextMuted });
                          }}
                          className="v-reel-sound"
                          title={isMuted ? "Unmute audio" : "Mute audio"}
                          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-[#ff5a3d]" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full h-full bg-black">
                        <img
                          src={ex.posterUrl}
                          alt={ex.title}
                          className="w-full h-full object-cover brightness-90"
                        />
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors" />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full text-[10px] text-white/80">
                          {ex.title}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Next Navigation Arrow */}
              <button
                type="button"
                onClick={handleNextExample}
                className="v-carousel-arrow next"
                aria-label="Next example"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Carousel Bottom Indicator */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-xs font-semibold text-white">
                {siteConfig.examples[activeExampleIndex].title}
              </span>
              <div className="v-dots">
                {siteConfig.examples.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveExampleIndex(idx);
                      trackEvent('click_switch_example', {
                        exampleId: siteConfig.examples[idx].id,
                        title: siteConfig.examples[idx].title,
                        index: idx,
                      });
                    }}
                    className={`v-dot ${activeExampleIndex === idx ? 'active' : ''}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Studio Console (5 cols) */}
          <div className="lg:col-span-5 v-panel p-6 sm:p-7 flex flex-col gap-4" id="create">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Upload your photo</h2>
              <p className="text-xs text-[#8e9a9f] mt-1">Single front-facing portrait of you, a friend, or pet.</p>
            </div>

            {/* Upload Zone */}
            <div className="v-upload-zone w-full h-44 p-4 flex flex-col items-center justify-center text-center cursor-pointer relative group">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2.5">
                  <img
                    src={previewUrl}
                    alt="Uploaded driver"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#ff5a3d] shadow-md"
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-white">{selectedFile?.name}</span>
                    <span className="text-[11px] text-emerald-400 mt-0.5">✓ Ready for driver replacement</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      trackEvent('click_remove_photo');
                    }}
                    className="text-[11px] text-[#ff9a7f] hover:underline"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                  <div className="w-11 h-11 rounded-xl bg-[#2c201d] border border-[#51342b] flex items-center justify-center text-[#ff9a7f] mb-2 group-hover:scale-105 transition-transform">
                    <ImagePlus className="w-5 h-5 text-[#ff9a7f]" strokeWidth={1.75} />
                  </div>
                  <strong className="text-sm font-semibold text-white group-hover:text-[#ff9a7f] transition">
                    Drop your photo here
                  </strong>
                  <span className="text-xs text-[#8e9a9f] mt-0.5">or <b className="text-white">browse files</b></span>
                  <small className="text-[10px] text-[#8e9a9f] uppercase tracking-wider font-mono mt-2">
                    JPG, PNG, WEBP · UP TO 10 MB
                  </small>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Spec Bar */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#111618] p-3 rounded-xl border border-[#2b3437]">
              <div>
                <span className="text-[#8e9a9f] block text-[10px] uppercase font-bold tracking-wider">FORMAT</span>
                <span className="font-semibold text-white">{siteConfig.videoAspectRatio}</span>
              </div>
              <div>
                <span className="text-[#8e9a9f] block text-[10px] uppercase font-bold tracking-wider">LENGTH</span>
                <span className="font-semibold text-white">{siteConfig.videoDurationSeconds} seconds</span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#8e9a9f] leading-normal select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => {
                  setConsentChecked(e.target.checked);
                  trackEvent('click_toggle_consent', { checked: e.target.checked });
                }}
                className="mt-0.5 h-4 w-4 rounded border-[#3c484c] bg-[#111618] text-[#ff5a3d] focus:ring-0 cursor-pointer"
              />
              <span>{siteConfig.consentCheckboxText}</span>
            </label>

            {/* Primary Create Button */}
            <button
              onClick={handleCreateClick}
              className="v-btn-primary w-full py-3.5 text-base shadow-lg"
            >
              <span>Create my video</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Guide Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-[#b3bec4]">
          <a href="#trend" className="hover:text-[#ff9a7f] flex items-center gap-1 transition">
            <span>Where did the Hit The Road Dude meme come from?</span>
            <span>↗</span>
          </a>
          <span className="text-[#3c484c]">•</span>
          <a href="#how-it-works" className="hover:text-[#ff9a7f] flex items-center gap-1 transition">
            <span>How to make a Hit The Road Dude AI video</span>
            <span>↗</span>
          </a>
        </div>
      </section>

      {/* 3. Section 2: What is Hit The Road Dude AI? */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
          What is Hit The Road Dude AI?
        </h2>
        <div className="flex flex-col gap-4 text-[15px] sm:text-base leading-relaxed text-[#c8d1d6]">
          <p>
            Hit The Road Dude AI brings your portrait into the pickup-window scene behind the private-property meme. The photo provides the new driver; the template sets the truck, framing and dismissive reaction. The result is an AI remake of the joke, rather than footage of you actually confronting someone.
          </p>
          <p>
            Single-frame face mapping extracts your facial geometry, eye orientation, and expression, placing you seamlessly into the driver's seat of the iconic white pickup truck. The output is a high-resolution 9:16 vertical video with synchronized lip movement reciting the famous dialogue: <em>“State? This? State? Hit the road, dude.”</em>
          </p>
        </div>
      </section>

      {/* 4. Section 3: The Hit The Road Dude video and AI trend */}
      <section id="trend" className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
          The Hit The Road Dude video and AI trend
        </h2>
        <div className="flex flex-col gap-4 text-[15px] sm:text-base leading-relaxed text-[#c8d1d6]">
          <p>
            Hit The Road Dude is the viral white-pickup meme in which a driver tells a person fishing nearby to leave his land. The visitor calls it state property; the driver pauses in disbelief, then insists it is private property. AI remixes recast the driver as a different person or pet.
          </p>
          <p>
            The moment exploded across TikTok, YouTube Shorts, and Instagram Reels because of its unmistakable pacing: the slow head turn, the deadpan interrogation, and the dismissive wave. With our AI preset engine, you can join the viral trend in seconds without writing prompts or renting a truck.
          </p>
        </div>
      </section>

      {/* 5. Section 4: Why use Hit The Road Dude AI? (Benefit Grid) */}
      <section id="benefits" className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8">
          Why use Hit The Road Dude AI?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Start with one portrait</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Use a clear photo of yourself or a consenting adult friend. One readable face is enough to choose the driver.
            </p>
          </article>

          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Use a preset pickup scene</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              The template supplies the white truck, open window and skeptical private-property reaction, so you do not need to film inside a pickup.
            </p>
          </article>

          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Skip prompts and editing</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              The scene and direction are already set. You do not need to describe the camera angle, write a prompt or edit the clip together.
            </p>
          </article>

          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Get a short vertical clip</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Receive an 11-second, 9:16 vertical MP4 optimized for TikTok, Instagram Reels and YouTube Shorts feeds.
            </p>
          </article>

          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Try another approved photo</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Switch between yourself, friends or pets with different expressions for unique comical reactions.
            </p>
          </article>

          <article className="border-t border-[#293b3f] pt-5">
            <h3 className="text-lg font-semibold text-white mb-2">Check the photo first</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Simple guidelines help you pick a photo that produces clear lip sync and believable driver framing.
            </p>
          </article>
        </div>
      </section>

      {/* 6. Section 5: How to make a Hit The Road Dude AI video */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-8">
          How to make a Hit The Road Dude AI video
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="border-t border-[#344143] pt-5 flex flex-col gap-2">
            <div className="text-2xl font-black text-[#ff5a3d]">01</div>
            <h3 className="text-lg font-semibold text-white">Upload one clear photo</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Choose your own portrait or a consenting adult friend’s photo. Keep the eyes, mouth and shoulders visible for the truck window framing.
            </p>
          </article>

          <article className="border-t border-[#344143] pt-5 flex flex-col gap-2">
            <div className="text-2xl font-black text-[#ff5a3d]">02</div>
            <h3 className="text-lg font-semibold text-white">Review your driver’s photo</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              The Hit The Road Dude scene is already set. Check the portrait, replace it if needed and confirm permission before continuing.
            </p>
          </article>

          <article className="border-t border-[#344143] pt-5 flex flex-col gap-2">
            <div className="text-2xl font-black text-[#ff5a3d]">03</div>
            <h3 className="text-lg font-semibold text-white">Generate, download and share</h3>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              Review the finished pickup scene, including the face, dismissal gesture and sound. Save the file and share it with your audience.
            </p>
          </article>
        </div>
      </section>

      {/* 7. Section 6: Photo tips for your Hit The Road Dude AI video */}
      <section id="photo-tips" className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border border-[#2b3437] shadow-xl max-w-[320px]">
              <img
                src="/images/photo-tip-portrait.jpg"
                alt="Ideal portrait for Hit The Road Dude AI generation"
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Ideal Framing & Lighting</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Photo tips for your Hit The Road Dude AI video
            </h2>
            <p className="text-sm text-[#b3bec4] leading-relaxed">
              The driver’s expression carries the joke. Choose a clear portrait with the eyes and mouth visible. Use JPG, PNG or WebP up to 10 MB.
            </p>
            <ul className="flex flex-col gap-3 mt-2 text-sm text-[#c8d1d6]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff5a3d] font-bold">✓</span>
                <span><strong>One adult</strong> who has agreed to the AI remake</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff5a3d] font-bold">✓</span>
                <span><strong>Natural light</strong>, no heavy shadows or filters</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff5a3d] font-bold">✓</span>
                <span><strong>Leave space</strong> around the head and shoulders</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff5a3d] font-bold">✓</span>
                <span><strong>Keep face unobstructed</strong> (no sunglasses or masks)</span>
              </li>
            </ul>
            <button
              onClick={scrollToCreate}
              className="v-btn-primary w-fit px-5 py-2.5 text-xs font-bold mt-2"
            >
              <span>Upload your photo</span>
              <span>↑</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Section 7: Hit The Road Dude AI Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Hit The Road Dude AI Pricing
          </h2>
          <p className="text-sm text-[#b3bec4] mt-2">
            Choose a pack for your Hit The Road Dude pickup remakes. Pay once, with no monthly subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Solo */}
          <div className="v-card p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase font-bold text-[#8e9a9f] tracking-wider">1 VIDEO</div>
              <h3 className="text-xl font-bold text-white mt-1">{siteConfig.pricing.solo.name}</h3>
              <p className="text-xs text-[#8e9a9f] mt-1">Your first pickup-truck remake.</p>
              <div className="text-3xl font-black text-white mt-4">
                ${siteConfig.pricing.solo.price} <span className="text-xs font-normal text-[#8e9a9f]">/ one-time</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-xs text-[#c8d1d6]">
                <li className="flex items-center gap-2"><span>✓</span> 1 × 11-second video</li>
                <li className="flex items-center gap-2"><span>✓</span> 9:16 vertical video format</li>
                <li className="flex items-center gap-2"><span>✓</span> A new pickup driver for each portrait</li>
                <li className="flex items-center gap-2"><span>✓</span> Credit returned if generation fails</li>
                <li className="flex items-center gap-2"><span>✓</span> No monthly subscription</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPack('solo')}
              className="w-full py-2.5 rounded-lg border border-[#2b3437] hover:bg-white/5 font-bold text-xs mt-6 transition text-white"
            >
              Choose Solo
            </button>
          </div>

          {/* Trio (Featured) */}
          <div className="v-card-featured p-6 flex flex-col justify-between relative shadow-xl">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-wider uppercase font-bold bg-[#ff5a3d] text-[#21100b] px-3 py-0.5 rounded-full">
              RECOMMENDED · SAVE 19%
            </span>
            <div>
              <div className="text-xs uppercase font-bold text-[#ff9a7f] tracking-wider">3 VIDEOS</div>
              <h3 className="text-xl font-bold text-white mt-1">{siteConfig.pricing.trio.name}</h3>
              <p className="text-xs text-[#8e9a9f] mt-1">Remakes for yourself, friends or pets.</p>
              <div className="text-3xl font-black text-white mt-4">
                ${siteConfig.pricing.trio.price} <span className="text-xs font-normal text-[#8e9a9f]">/ one-time ($5.66 ea)</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-xs text-[#c8d1d6]">
                <li className="flex items-center gap-2"><span>✓</span> 3 × 11-second videos</li>
                <li className="flex items-center gap-2"><span>✓</span> Priority GPU queue allocation</li>
                <li className="flex items-center gap-2"><span>✓</span> Try different faces and reactions</li>
                <li className="flex items-center gap-2"><span>✓</span> Credit returned if generation fails</li>
                <li className="flex items-center gap-2"><span>✓</span> No monthly subscription</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPack('trio')}
              className="v-btn-primary w-full py-2.5 text-xs font-bold mt-6 shadow"
            >
              Choose Trio
            </button>
          </div>

          {/* Crew */}
          <div className="v-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#8e9a9f] tracking-wider">5 VIDEOS</span>
                <span className="text-[11px] font-bold text-[#ff9a7f]">SAVE 28%</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{siteConfig.pricing.crew.name}</h3>
              <p className="text-xs text-[#8e9a9f] mt-1">Multiple takes for a group or social channels.</p>
              <div className="text-3xl font-black text-white mt-4">
                ${siteConfig.pricing.crew.price} <span className="text-xs font-normal text-[#8e9a9f]">/ one-time ($4.99 ea)</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-xs text-[#c8d1d6]">
                <li className="flex items-center gap-2"><span>✓</span> 5 × 11-second videos</li>
                <li className="flex items-center gap-2"><span>✓</span> Fastest Turbo GPU processing</li>
                <li className="flex items-center gap-2"><span>✓</span> High resolution MP4 export</li>
                <li className="flex items-center gap-2"><span>✓</span> Credit returned if generation fails</li>
                <li className="flex items-center gap-2"><span>✓</span> No monthly subscription</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPack('crew')}
              className="w-full py-2.5 rounded-lg border border-[#2b3437] hover:bg-white/5 font-bold text-xs mt-6 transition text-white"
            >
              Choose Crew
            </button>
          </div>
        </div>
      </section>

      {/* 9. Section 8: Hit The Road Dude AI FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.06] w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Hit The Road Dude AI FAQ
          </h2>
          <p className="text-sm text-[#b3bec4] mt-1">
            The pickup clip, your portrait, reference examples, sound and one-time video packs.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {siteConfig.faqs.map((faq, i) => (
            <details
              key={i}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                  trackEvent('click_expand_faq', { question: faq.question });
                }
              }}
              className="group v-card p-4 rounded-xl transition"
            >
              <summary className="font-semibold text-[15px] cursor-pointer select-none text-white group-hover:text-[#ff9a7f] transition flex items-center justify-between list-none">
                <span>{faq.question}</span>
                <span className="text-[#8e9a9f] group-open:rotate-45 transition-transform text-lg font-bold">
                  +
                </span>
              </summary>
              <p className="text-sm text-[#c8d1d6] mt-3 leading-relaxed border-t border-[#2b3437] pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 10. Section 9: Final Call To Action */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/[0.06] w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Create your Hit The Road Dude AI video from one photo.
        </h2>
        <p className="text-sm text-[#8e9a9f] mb-6">One photo · No prompt required · 60s Fast GPU</p>
        <button
          onClick={scrollToCreate}
          className="v-btn-primary px-8 py-3.5 text-base shadow-xl"
        >
          <span>Upload your photo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6 bg-[#07090a] text-xs text-[#8e9a9f]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BrandLogo size="sm" />
              <span className="font-bold text-white text-sm">{siteConfig.name}</span>
            </div>
            <p className="text-xs text-[#8e9a9f] leading-relaxed">
              Hit The Road Dude AI video generator. One portrait. Your pickup-driver moment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">Create</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#create" className="hover:text-white transition">Video generator</a></li>
              <li><a href="#examples" className="hover:text-white transition">Meme remix examples</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Video packs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">Learn</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#trend" className="hover:text-white transition">Hit The Road Dude AI trend</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How to make a video</a></li>
              <li><a href="#photo-tips" className="hover:text-white transition">Photo tips</a></li>
              <li>
                <a
                  href="https://knowyourmeme.com/memes/state-property-hit-the-road-dude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#ff9a7f] transition flex items-center gap-1"
                >
                  <span>Know Your Meme lore</span>
                  <span>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/tag/hittheroaddude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#ff9a7f] transition flex items-center gap-1"
                >
                  <span>TikTok trend</span>
                  <span>↗</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px]">Information</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Privacy policy</a></li>
              <li><a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Terms of service</a></li>
              <li><a href="#faq" className="hover:text-white transition">Refund policy</a></li>
              <li><a href="#faq" className="hover:text-white transition">Contact support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} {siteConfig.name}.</p>
          <p className="text-[#6d797e]">{siteConfig.disclaimer}</p>
        </div>
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
