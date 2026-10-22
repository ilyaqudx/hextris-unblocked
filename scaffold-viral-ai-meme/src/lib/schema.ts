import { siteConfig } from "../../site.config";

export function generateSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": `https://${siteConfig.domain}`,
    "description": siteConfig.description,
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": siteConfig.name,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All Web Browsers",
    "description": siteConfig.description,
    "url": `https://${siteConfig.domain}`,
    "image": `https://${siteConfig.domain}${siteConfig.ogImage}`,
    "screenshot": `https://${siteConfig.domain}${siteConfig.ogImage}`,
    "softwareVersion": "1.0.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "328",
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": siteConfig.pricing.solo.price.toString(),
      "highPrice": siteConfig.pricing.crew.price.toString(),
      "offerCount": "3",
      "offers": [
        {
          "@type": "Offer",
          "name": siteConfig.pricing.solo.name,
          "price": siteConfig.pricing.solo.price.toString(),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `https://${siteConfig.domain}`,
        },
        {
          "@type": "Offer",
          "name": siteConfig.pricing.trio.name,
          "price": siteConfig.pricing.trio.price.toString(),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `https://${siteConfig.domain}`,
        },
        {
          "@type": "Offer",
          "name": siteConfig.pricing.crew.name,
          "price": siteConfig.pricing.crew.price.toString(),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `https://${siteConfig.domain}`,
        },
      ],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": siteConfig.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return {
    websiteSchema,
    softwareSchema,
    faqSchema,
  };
}
