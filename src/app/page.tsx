"use client";

import { useState } from "react";
import { DownloaderForm } from "@/components/DownloaderForm";
import { SlideGrid } from "@/components/SlideGrid";
import { AlertCircle } from "lucide-react";


// I'm creating a quick Alert component inline or imported? 
// Wait, I haven't created the Alert component in UI yet, I should stick to basic HTML or a simple div for error if I don't want to create more files.
// Actually, standardizing is better. I'll use a simple error div for now to save a step, or I can create the component.
// Let's us a simple div styling for error to be fast.

export default function Home() {
  const [slides, setSlides] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = async (url: string) => {
    setLoading(true);
    setError(null);
    setSlides([]);
    setTitle("");

    try {
      // Use AllOrigins as a CORS proxy
      const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch page. Status: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract Title
      const pageTitle = doc.querySelector('h1')?.textContent?.trim() || doc.title || "Untitled Presentation";

      // Extract Slides
      let extractedSlides: string[] = [];

      // Strategy 1: Look for <picture> <source> tags which usually contain the high-res images
      const sources = doc.querySelectorAll('picture source, source');
      sources.forEach(source => {
        const srcset = source.getAttribute('srcset');
        if (srcset) {
          // srcset format: "url 1x, url 2x" -> take the last one (highest res)
          const candidates = srcset.split(',');
          const bestCandidate = candidates[candidates.length - 1].trim();
          const imageUrl = bestCandidate.split(' ')[0];

          if (imageUrl && !extractedSlides.includes(imageUrl) && imageUrl.includes('slidesharecdn.com')) {
            extractedSlides.push(imageUrl);
          }
        }
      });

      // Strategy 2: Look for <img> tags with data-full or srcset if Strategy 1 failed or found few
      if (extractedSlides.length === 0) {
        doc.querySelectorAll('img[srcset], img[data-full]').forEach((img: any) => {
          let src = img.getAttribute('data-full');
          if (!src && img.getAttribute('srcset')) {
            const srcset = img.getAttribute('srcset');
            const candidates = srcset.split(',');
            src = candidates[candidates.length - 1].trim().split(' ')[0];
          }

          if (src && !extractedSlides.includes(src) && src.includes('slidesharecdn.com')) {
            extractedSlides.push(src);
          }
        });
      }

      // Strategy 3: Fallback for older presentations (simple img tags in slide container)
      if (extractedSlides.length === 0) {
        const slideImages = doc.querySelectorAll('.slide_image');
        slideImages.forEach((img: any) => {
          if (img.src && !extractedSlides.includes(img.src)) {
            extractedSlides.push(img.src);
          }
        });
      }

      // Strategy 4 (New): Regex for JSON/Script data. often slides are in window.__INITIAL_STATE__
      // Pattern: "contentUrl":"https://image.slidesharecdn.com/..." or just matching large jpgs
      if (extractedSlides.length === 0) {
        console.log("DOM extraction failed, attempting Regex extraction...");
        // Match all slidesharecdn image URLs
        // Example: https://image.slidesharecdn.com/presentationname-123456/95/presentation-name-1-1024.jpg
        const regex = /https:\/\/image\.slidesharecdn\.com\/[^"'\s]+\/\d+\/[^"'\s]+-\d+-\d+\.jpg/g;
        const matches = html.match(regex);

        if (matches) {
          matches.forEach(url => {
            // We want higher res, usually the regex matches them all. 
            // We need to filter for specific slide patterns if possible, but let's grab unique valid ones.
            if (!extractedSlides.includes(url)) {
              extractedSlides.push(url);
            }
          });

          // Sort them naturally if they have numbers
          // But usually regex order matches source order.
          // Let's filter duplicates and small thumbnails if possible (often contain 85.jpg or 320.jpg)
          // We prefer 1024.jpg or 2048.jpg
          extractedSlides = extractedSlides.filter(u => u.includes('-1024.jpg') || u.includes('-2048.jpg') || u.includes('-638.jpg'));

          // If we filtered too aggressively, revert to all matches
          if (extractedSlides.length === 0 && matches.length > 0) {
            extractedSlides = Array.from(new Set(matches));
          }
        }
      }

      if (extractedSlides.length === 0) {
        console.error("HTML Preview (first 500 chars):", html.substring(0, 500));
        throw new Error("No slides found. The presentation might be private or the format is not supported.");
      }

      // De-duplicate and sort
      extractedSlides = Array.from(new Set(extractedSlides));

      // Attempt to sort by slide number if possible (slide-1.jpg, slide-2.jpg)
      // This is tricky because URLs vary, but default finding order is usually correct.

      setSlides(extractedSlides);
      setTitle(pageTitle);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 pb-20">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="container mx-auto px-4 pt-20 sm:pt-32">
        <DownloaderForm onSearch={fetchSlides} isLoading={loading} />

        {error && (
          <div className="max-w-xl mx-auto mt-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      <SlideGrid slides={slides} title={title} />
    </main>
  );
}
