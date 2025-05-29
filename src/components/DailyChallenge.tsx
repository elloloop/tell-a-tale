'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { findLatestAvailableImageUrl } from '@/lib/utils';

const FALLBACK_IMAGE_SRC = "https://placehold.co/800x450/f0f0f0/aaaaaa.png";

interface DailyChallengeProps {
  onPromptsLoaded: (startingLine: string, theme: string, imageSrc: string) => void;
}

export default function DailyChallenge({ onPromptsLoaded }: DailyChallengeProps) {
  const [challengeTheme, setChallengeTheme] = useState<string | null>(null);
  const [displayImageSrc, setDisplayImageSrc] = useState<string>(FALLBACK_IMAGE_SRC);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const dailyImageHint = "cartoon animals"; // More kid-friendly hint
  const defaultTheme = "A Day at the Magical Zoo"; // Kid-friendly theme

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      let currentImageSrc = FALLBACK_IMAGE_SRC;
      let currentTheme = defaultTheme;

      // Get today's date in YYYY-MM-DD
      const today = new Date().toISOString().slice(0, 10);
      const staticImage = await findLatestAvailableImageUrl(today);
      if (staticImage) {
        currentImageSrc = staticImage;
        setDisplayImageSrc(currentImageSrc);
      } else {
        setError('No static image found for today.');
        setDisplayImageSrc(FALLBACK_IMAGE_SRC);
      }

      setChallengeTheme(currentTheme); // Set theme for display
      setLoadingStage("Crafting story prompts...");
      // Call onPromptsLoaded with hardcoded starting line
      onPromptsLoaded('Once upon a time', currentTheme, currentImageSrc);
      setIsLoading(false);
    }
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="w-full mb-6"> {/* Adjusted margin */}
        <div className="flex items-center justify-center gap-2 text-xl font-semibold mb-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading Daily Inspiration...
        </div>
        <p className="text-center text-sm text-muted-foreground mb-4">{loadingStage}</p>
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg h-64 w-full mb-4 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
        </div>
      </div>
    );
  }

  if (error && !challengeTheme) {
    return (
      <Alert variant="destructive" className="shadow-lg mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Oops! Something went wrong.</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </Alert>
    );
  }
  
  if (!challengeTheme) { // If theme couldn't be set (implies critical failure)
    return (
      <div className="w-full text-center py-8 text-muted-foreground mb-6">
        Could not load the daily challenge. Please check back later.
      </div>
    );
  }

  return (
    <div className="w-full mb-6"> {/* Removed Card structure, added bottom margin */}
      {challengeTheme && (
        <p className="text-center text-xl font-semibold text-accent mb-3">
          Theme: <span className="italic">{challengeTheme}</span>
        </p>
      )}
      {error && ( // Display non-critical errors here (e.g., image gen failure but prompts loaded with fallback)
        <Alert variant="destructive" className="mb-4 text-sm">
          <Sparkles className="h-4 w-4" />
          <AlertTitle className="text-base">Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="w-full mb-2 rounded-lg overflow-hidden shadow-md aspect-video relative border border-border bg-muted">
        {displayImageSrc && (
          <Image
            key={displayImageSrc} 
            src={displayImageSrc}
            alt={dailyImageHint}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            data-ai-hint={dailyImageHint}
            priority 
            className="transform transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>
      {/* Starting line display is removed from here and handled by StoryEditor */}
    </div>
  );
}
