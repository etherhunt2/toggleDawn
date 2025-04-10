import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string[];
  manifest?: string;
  appleTouchIcon?: string;
  appleMobileWebAppCapable?: string;
  appleMobileWebAppStatusBarStyle?: "black" | "default" | "black-translucent";
  alternates?: {
    canonical?: string;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  authors?: {
    name: string;
    url?: string;
  }[];
  openGraph?: {
    type?: string;
    siteName?: string;
    title?: string;
    description?: string;
    url?: string;
    locale?: string;
    images?: {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }[];
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
    creator?: string;
    site?: string;
  };
}

export function generateMetadata({
  title,
  description,
  canonical,
  ogImage,
  manifest,
  appleTouchIcon,
  appleMobileWebAppCapable,
  appleMobileWebAppStatusBarStyle,
  robots,
  keywords = [],
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imageUrl = ogImage || `${siteUrl}/logo.svg`;

  return {
    title,
    description,
    manifest: manifest || "/manifest.json",
    icons: {
      apple: appleTouchIcon || "/icon-192x192.png",
    },
    applicationName: "Toggle Dawn",
    appleWebApp: {
      capable: appleMobileWebAppCapable === "yes",
      statusBarStyle: appleMobileWebAppStatusBarStyle || "black",
    },
    robots: {
      index: robots?.index ?? true,
      follow: robots?.follow ?? true,
    },
    keywords: keywords.join(", "),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonical || siteUrl,
    },
    openGraph: {
      type: "website",
      siteName: "Toggle Dawn",
      title,
      description,
      url: siteUrl,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@toggle_dawn",
      site: "@toggle_dawn",
    },
    authors: [{ name: "Sharnagat Yogesh" }],
  };
}

// Example usage in page:
// export const metadata = generateMetadata({
//   title: 'Your Page Title',
//   description: 'Your page description',
//   keywords: ['knowledge repository', 'notes organization', 'digital learning']
// });
