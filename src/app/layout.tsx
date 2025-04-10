import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import ClientCursorDot from "@/components/ui/ClientCursorDot";
import { generateMetadata } from "@/lib/TDutils/seo";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = generateMetadata({
  manifest: "/manifest.json",
  title: "Toggle Dawn - Your Personal Knowledge Repository",
  description:
    "Organize your notes, books, and creative ideas in one elegant platform",
  canonical: process.env.NEXT_PUBLIC_API,
  ogImage: process.env.NEXT_PUBLIC_API
    ? `${process.env.NEXT_PUBLIC_API}/og-image.jpg`
    : "/logo.svg",
  keywords: [
    "knowledge repository",
    "notes organization",
    "digital learning",
    "creative writing",
    "personal wiki",
    "note-taking app",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/* Apple specific icons */}
        <link rel="apple-touch-icon" href="/icon_192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon_192x192.png" />

        {/* Standard favicons for all devices */}
        <link
          rel="icon"
          type="image/png"
          sizes="1080x1080"
          href="/icon_1080x1080.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon_512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon_192x192.png"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          sizes="64x64"
          href="/icon-64x64.svg"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>
              {children}
              <ClientCursorDot />
            </SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
