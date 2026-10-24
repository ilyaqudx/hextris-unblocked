export interface MemeConfig {
  // 1. Basic Metadata
  name: string; // e.g. "Hit The Road Dude AI"
  slug: string; // e.g. "hit-the-road-dude"
  domain: string; // e.g. "hittheroaddude.org"
  title: string;
  description: string;
  ogImage: string;
  themeColor: string;

  // 2. Meme Core Narrative & Prompt
  memeOriginalTitle: string; // e.g. "The Private Property Meme"
  heroTagline: string;
  heroDescription: string;
  videoDurationSeconds: number; // e.g. 11
  videoAspectRatio: string; // e.g. "9:16 vertical"

  // 3. AI Generation Engine Configuration
  aiProvider: 'fal' | 'replicate' | 'kling';
  aiModelEndpoint: string; // e.g. "fal-ai/grok-imagine-video/v1.5/image-to-video"
  baseReferenceVideoUrl: string; // The 10-15s motion reference video
  baseAudioTrackUrl: string; // Original sound to mux

  // 4. Pricing Tiers (One-time packs)
  pricing: {
    solo: { name: string; videos: number; price: number; stripePriceId: string };
    trio: { name: string; videos: number; price: number; stripePriceId: string; recommended?: boolean };
    crew: { name: string; videos: number; price: number; stripePriceId: string };
  };

  // 5. Example Gallery Videos
  examples: Array<{
    id: string;
    title: string;
    videoUrl: string;
    posterUrl: string;
  }>;

  // 6. FAQ items (auto-injected into FAQPage JSON-LD Schema)
  faqs: Array<{
    question: string;
    answer: string;
  }>;

  // 7. Compliance & Disclaimer
  disclaimer: string;
  consentCheckboxText: string;
}

export const siteConfig: MemeConfig = {
  name: "Hit The Road Dude AI",
  slug: "hit-the-road-dude",
  domain: "hittheroaddude.space",
  title: "Hit The Road Dude AI Video Generator – The Private Property Meme",
  description: "Create a Hit The Road Dude AI video from one photo. 11-sec 9:16 vertical remix with instant lip-sync. Choose one-time video packs with zero subscription.",
  ogImage: "/og-image.jpg",
  themeColor: "#090d16",

  memeOriginalTitle: "The Private Property Meme",
  heroTagline: "Take the driver's seat in the “Hit the road, dude” meme.",
  heroDescription: "One photo, a white pickup truck, and that skeptical “State?” reaction — in an 11-second, 9:16 vertical video. No truck, no filming, no prompt to write.",
  videoDurationSeconds: 11,
  videoAspectRatio: "9:16 vertical",

  aiProvider: 'fal',
  aiModelEndpoint: "fal-ai/kling-video/v1.5/pro/image-to-video",
  baseReferenceVideoUrl: "/reference/hit-the-road-dude-11s.mp4",
  baseAudioTrackUrl: "/reference/hit-the-road-dude-audio.mp3",

  pricing: {
    solo: {
      name: "Solo",
      videos: 1,
      price: 6.99,
      stripePriceId: process.env.STRIPE_PRICE_SOLO || "price_solo_sample",
    },
    trio: {
      name: "Trio",
      videos: 3,
      price: 16.99,
      stripePriceId: process.env.STRIPE_PRICE_TRIO || "price_trio_sample",
      recommended: true,
    },
    crew: {
      name: "Crew",
      videos: 5,
      price: 24.99,
      stripePriceId: process.env.STRIPE_PRICE_CREW || "price_crew_sample",
    },
  },

  examples: [
    {
      id: "pickup-1",
      title: "The pickup driver",
      videoUrl: "/examples/pickup-remix-1.mp4",
      posterUrl: "/examples/pickup-remix-1.jpg",
    },
    {
      id: "pickup-2",
      title: "The bulldog landlord",
      videoUrl: "/examples/pickup-remix-2.mp4",
      posterUrl: "/examples/pickup-remix-2.jpg",
    },
    {
      id: "pickup-3",
      title: "The cat calls the shots",
      videoUrl: "/examples/pickup-remix-3.mp4",
      posterUrl: "/examples/pickup-remix-3.jpg",
    },
  ],

  faqs: [
    {
      question: "What is Hit The Road Dude AI?",
      answer: "Hit The Road Dude AI is a photo-to-video template inspired by the white-pickup private-property meme. Your portrait becomes the new driver in a short AI remake of the skeptical reaction and dismissal.",
    },
    {
      question: "Is Hit The Road Dude the same as the State Property meme?",
      answer: "Yes. Hit The Road Dude, State Property and Private Property refer to the same pickup-truck exchange. The driver reacts to a visitor who thought the land was public, then tells him to leave.",
    },
    {
      question: "How do I make a Hit The Road Dude AI video?",
      answer: "Choose a clear portrait, check the face and upper body, and confirm permission to use the photo. The preset supplies the pickup-window scene, so you do not need to film yourself in a truck or write a scene prompt.",
    },
    {
      question: "What kind of photo should I use?",
      answer: "Use one adult facing the camera, with visible eyes, mouth, hair and shoulders. Avoid group photos, sunglasses and heavy filters. Choose a JPG, PNG or WebP up to 10 MB.",
    },
    {
      question: "Is Hit The Road Dude AI free?",
      answer: "Browsing meme examples and guides is free. Generation requires one-time video packs: $6.99 for 1 video, $16.99 for 3 videos, $24.99 for 5 videos. There is no recurring monthly subscription.",
    },
    {
      question: "Can I make the cat or dog version shown in the examples?",
      answer: "Yes! The AI generation engine supports both human portraits and pets (dogs, cats). Simply upload a well-lit, front-facing photo of your pet's face.",
    },
    {
      question: "Will the video use the original voice and exact lip sync?",
      answer: "Yes. Every generated video automatically syncs the facial expressions and lip movements with the iconic “State? This? State? Hit the road, dude” dialogue and audio track.",
    },
    {
      question: "How long does a render take?",
      answer: "A render typically takes between 60 to 120 seconds depending on server load. You can preview and download the finished high-resolution 9:16 vertical video immediately.",
    },
    {
      question: "What happens if generation fails?",
      answer: "If generation fails, that video credit automatically returns to your account balance so you can retry with another photo without extra charge.",
    },
  ],

  disclaimer: "Independent meme tool. Not affiliated with the original clip, author, or its creators.",
  consentCheckboxText: "This photo is of me, or I have the person's permission to use it. The person pictured is 18 or older and is not a celebrity or public figure.",
};
