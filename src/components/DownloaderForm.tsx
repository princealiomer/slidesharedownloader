"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DownloaderFormProps {
    onSearch: (url: string) => Promise<void>;
    isLoading: boolean;
}

export function DownloaderForm({ onSearch, isLoading }: DownloaderFormProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        onSearch(url);
    };

    return (
        <Card className="w-full max-w-xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="text-center px-0">
                <CardTitle className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    Slideshare Downloader
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
                    Download slides from Slideshare presentations in high quality. Just paste the URL below.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Paste Slideshare URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-base shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 sm:text-sm sm:leading-6 flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="lg" className="h-12 px-8 text-base shadow-lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Get Slides
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
