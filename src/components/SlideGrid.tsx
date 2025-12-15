"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { jsPDF } from "jspdf";

interface SlideGridProps {
    slides: string[];
    title: string;
}

export function SlideGrid({ slides, title }: SlideGridProps) {
    const [downloading, setDownloading] = useState<number | null>(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Helper to fetch image with multiple fallbacks
    const fetchImageWithFallback = async (url: string): Promise<Blob> => {
        // Strategy 1: Direct Fetch
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) return await res.blob();
        } catch (e) {
            // console.warn("Direct fetch failed, trying Local Proxy...");
        }

        // Strategy 2: Internal Next.js Proxy (Avoids External CORS Proxy issues)
        try {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            if (res.ok) return await res.blob();
        } catch (e) {
            console.warn("Local Proxy failed, trying External Proxy...");
        }

        // Strategy 3: corsproxy.io (Backup)
        try {
            const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
            const res = await fetch(proxyUrl);
            if (res.ok) return await res.blob();
        } catch (e) {
            // console.warn("Proxy 2 failed.");
        }

        throw new Error("All fetch strategies failed for " + url);
    };

    const downloadPDF = async () => {
        try {
            setGeneratingPDF(true);
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [1024, 768]
            });

            for (let i = 0; i < slides.length; i++) {
                const url = slides[i];
                let blob;
                try {
                    blob = await fetchImageWithFallback(url);
                } catch (e) {
                    console.error("Skipping slide due to fetch error:", url);
                    continue;
                }

                // Convert blob to base64
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });

                // Get dimensions
                const img = new window.Image();
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = base64;
                });

                const width = img.width;
                const height = img.height;

                if (i === 0) {
                    doc.deletePage(1);
                    doc.addPage([width, height], width > height ? "l" : "p");
                } else {
                    doc.addPage([width, height], width > height ? "l" : "p");
                }

                doc.addImage(base64, "JPEG", 0, 0, width, height);
            }

            doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Check console for details.");
        } finally {
            setGeneratingPDF(false);
        }
    };

    const downloadImage = async (url: string, index: number) => {
        try {
            setDownloading(index);

            const blob = await fetchImageWithFallback(url);
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slide_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download image.");
        } finally {
            setDownloading(null);
        }
    };

    if (!slides || slides.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Found {slides.length} Slides
                </h2>
                <Button
                    onClick={downloadPDF}
                    disabled={generatingPDF}
                    className="w-full sm:w-auto"
                >
                    {generatingPDF ? (
                        <>Downloading PDF ({slides.length} pages)...</>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download as PDF
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {slides.map((slide, index) => (
                    <div key={index} className="group relative bg-card rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-[4/3] relative w-full overflow-hidden bg-muted">
                            <Image
                                src={slide}
                                alt={`Slide ${index + 1} of ${title || "Presentation"}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={index < 4}
                                unoptimized // sometimes scraping yields URLs that next/image struggles with strict optimization if headers are weird, but let's try strict first. If issues, add unoptimized.
                            />

                            {/* Overlay with download button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button
                                    onClick={() => downloadImage(slide, index)}
                                    disabled={downloading === index}
                                    variant="secondary"
                                    className="shadow-lg"
                                >
                                    {downloading === index ? "Downloading..." : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-zinc-900 border-t flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Slide {index + 1}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
