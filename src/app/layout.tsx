import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://slidesharedownloading.com"),
  title: {
    default: "Slideshare Downloader - Download Slides as Images or PDF",
    template: "%s | Slideshare Downloader",
  },
  description: "Free online tool to download Slideshare presentations as high-quality images or PDF. No login required. Fast, free, and secure.",
  keywords: ["slideshare downloader", "download slideshare pdf", "slideshare to pdf", "slideshare images", "ppt downloader"],
  authors: [{ name: "Slideshare Downloader" }],
  creator: "Slideshare Downloader",
  publisher: "Slideshare Downloader",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://slidesharedownloading.com",
    title: "Slideshare Downloader - Download Slides as Images or PDF",
    description: "Download any Slideshare presentation as PDF or images for free.",
    siteName: "Slideshare Downloader",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slideshare Downloader - Download Slides as Images or PDF",
    description: "Download any Slideshare presentation as PDF or images for free.",
  },
  alternates: {
    canonical: "https://slidesharedownloading.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Slideshare Downloader",
              "url": "https://slidesharedownloading.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://slidesharedownloading.com/?url={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Slideshare Downloader",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
