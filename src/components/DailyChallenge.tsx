
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Lightbulb, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import type { DailyChallengeData } from '@/lib/types'; // Ensure DailyChallengeData matches new structure
import { generatePrompts, generateImageForChallenge } from '@/app/actions';

// Softer placeholder
const FALLBACK_IMAGE_SRC = "https://placehold.co/800x450/f0f0f0/aaaaaa.png";

interface DailyChallengeProps {
  onPromptsLoaded: (startingLine: string, theme: string, imageSrc: string) => void;
}

export default function DailyChallenge({ onPromptsLoaded }: DailyChallengeProps) {
  // Updated challengeData state to reflect new DailyChallengeData structure
  const [challengeData, setChallengeData] = useState<{ theme: string; storyStarter: string; } | null>(null);
  const [displayImageSrc, setDisplayImageSrc] = useState<string>(FALLBACK_IMAGE_SRC);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);

  // Default theme and hint, can be made dynamic later
  const dailyImageHint = "dragon prince castle";
  const dailyTheme = "A Royal Adventure with a Friendly Dragon";

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      let currentImageSrc = FALLBACK_IMAGE_SRC;

      try {
        // 1. Generate Image
        setLoadingStage("Generating unique image...");
        const imageResult = await generateImageForChallenge({ hint: dailyImageHint });

        if ('error' in imageResult || !imageResult.imageDataUri) {
          setError(`Image generation failed: ${('error'in imageResult && imageResult.error) || 'Unknown error'}. Using fallback.`);
          // Continue with fallback image for prompts
        } else {
          currentImageSrc = imageResult.imageDataUri;
          setDisplayImageSrc(currentImageSrc);
        }

        // 2. Generate Prompts using the (potentially newly generated) image
        setLoadingStage("Crafting story prompts...");
        const promptsResult = await generatePrompts({ imageDataUri: currentImageSrc, theme: dailyTheme });

        if ('error' in promptsResult) {
          setError(promptsResult.error);
          setChallengeData(null);
        } else if (promptsResult.startingLine && typeof promptsResult.startingLine === 'string' && promptsResult.startingLine.trim() !== '') {
          const newChallengeCoreData = {
            theme: dailyTheme,
            storyStarter: promptsResult.startingLine,
          };
          setChallengeData(newChallengeCoreData);
          onPromptsLoaded(promptsResult.startingLine, dailyTheme, currentImageSrc);
        } else {
           setError("Received no starting line or an invalid line from AI.");
           setChallengeData(null);
        }
      } catch (e: any) {
        console.error("Failed to fetch daily challenge:", e);
        setError(e.message || "Failed to load daily challenge. Please try again.");
        setChallengeData(null);
      } finally {
        setIsLoading(false);
        setLoadingStage("");
      }
    }
    fetchChallenge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ensure this runs once on mount

  if (isLoading) {
    return (
      <Card className="w-full shadow-xl bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
            <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading Daily Inspiration...
          </CardTitle>
          <CardDescription>{loadingStage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-64 w-full mb-4 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !challengeData) { // Show critical error if challengeData couldn't be loaded at all
    return (
      <Alert variant="destructive" className="shadow-lg">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Oops! Something went wrong.</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </Alert>
    );
  }
  
  if (!challengeData) {
    return (
      <Card className="w-full shadow-xl bg-card/70">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">No Challenge Available</CardTitle>
          <CardDescription>Could not load the daily challenge. Please check back later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }


  return (
    <Card className="w-full overflow-hidden shadow-xl bg-card/70 backdrop-blur-sm border-2 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Lightbulb className="h-8 w-8" /> Today&apos;s Inspiration
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80">
          Theme: <span className="font-semibold text-accent">{challengeData.theme}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && ( // Display non-critical errors here, e.g., image generation failure
          <Alert variant="destructive" className="mb-4">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="w-full mb-6 rounded-lg overflow-hidden shadow-md aspect-video relative border border-border bg-muted">
          {displayImageSrc && (
            <Image
              key={displayImageSrc} 
              src={displayImageSrc}
              alt={dailyImageHint}
              layout="fill"
              objectFit="cover" 
              data-ai-hint={dailyImageHint}
              priority 
            />
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">Today&apos;s Starting Line:</h3>
          {challengeData.storyStarter && (
            <div className="mb-4 p-4 bg-background/50 rounded-lg border border-border shadow-sm">
              <p className="italic text-muted-foreground">"{challengeData.storyStarter}"</p>
            </div>
          )}
          <Alert className="mt-4 bg-accent/10 border-accent/30">
            <Sparkles className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Writing Tip</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
              Let the image and theme guide you. Don&apos;t be afraid to twist the prompt or go in a completely new direction!
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
