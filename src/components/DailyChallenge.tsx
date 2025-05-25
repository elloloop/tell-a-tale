'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import type { DailyChallengeData } from '@/lib/types';
import { generatePrompts } from '@/app/actions';

// Helper function to convert image URL to data URI
async function toDataURL(url: string): Promise<string> {
  try {
    // In a browser environment, you can use fetch and FileReader.
    // For server components or environments without DOM, this needs adjustment
    // or pre-conversion of images.
    if (typeof window === 'undefined') {
      // This won't work server-side directly for remote URLs without a server-side fetch lib
      console.warn("toDataURL is being called in a non-browser environment. This might fail for remote URLs.");
      // Fallback or specific server-side handling might be needed here
      // For now, let's assume this is called client-side or the URL is already a data URI if on server
      if (url.startsWith('data:')) return url; // Already a data URI
      // A proper server-side implementation would fetch the image and base64 encode it.
      // This is a simplified placeholder.
      const placeholderBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 transparent png
      return placeholderBase64;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to data URI:", error);
    // Return a default placeholder or re-throw
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // Fallback to 1x1 transparent png
  }
}


interface DailyChallengeProps {
  onPromptsLoaded: (prompts: { beginning: string[], middle: string[] }, theme: string, imageSrc: string) => void;
}

export default function DailyChallenge({ onPromptsLoaded }: DailyChallengeProps) {
  const [challengeData, setChallengeData] = useState<DailyChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dailyImageSrc = "https://placehold.co/800x400.png";
  const dailyImageHint = "fantasy landscape";
  const dailyTheme = "An Unexpected Journey";

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      try {
        const imageDataUri = await toDataURL(dailyImageSrc);
        const result = await generatePrompts({ imageDataUri, theme: dailyTheme });

        if ('error' in result) {
          setError(result.error);
          setChallengeData(null);
        } else if (result.startingLines && result.startingLines.length >= 2) {
          // Assuming the AI returns at least 2 lines, we can split them.
          // A more robust approach would be for the AI to explicitly return 'beginning' and 'middle' arrays.
          // For now, let's split them, e.g., first half for beginning, second for middle.
          // The prompt is "Generate 3 different starting lines". We can use them all as beginning lines or vary.
          // Let's use 2 for beginning, 1 for middle if 3 are returned.
          const lines = result.startingLines;
          const beginningLines = lines.slice(0, Math.min(lines.length, 2)); // Take up to 2 for beginning
          const middleLines = lines.length > 2 ? lines.slice(2) : (lines.length === 1 ? [] : [lines[lines.length-1]]); // Take rest for middle, or last one if only 2 lines.
          
          const prompts = {
            beginning: beginningLines,
            middle: middleLines,
          };

          const newChallengeData: DailyChallengeData = {
            imageSrc: dailyImageSrc,
            imageAiHint: dailyImageHint,
            theme: dailyTheme,
            storyStarters: prompts,
          };
          setChallengeData(newChallengeData);
          onPromptsLoaded(prompts, dailyTheme, dailyImageSrc);
        } else {
           setError("Received insufficient starting lines from AI.");
           setChallengeData(null);
        }
      } catch (e: any) {
        console.error("Failed to fetch daily challenge:", e);
        setError(e.message || "Failed to load daily challenge. Please try again.");
        setChallengeData(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChallenge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount

  if (isLoading) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
            <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading Daily Inspiration...
          </CardTitle>
          <CardDescription>Fetching a fresh image and creative sparks for your next story!</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-64 w-full mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">No Challenge Available</CardTitle>
          <CardDescription>Could not load the daily challenge. Please check back later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Lightbulb className="h-8 w-8" /> Today&apos;s Inspiration
        </CardTitle>
        <CardDescription className="text-lg">
          Theme: <span className="font-semibold text-accent">{challengeData.theme}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-lg overflow-hidden shadow-md aspect-video relative">
          <Image
            src={challengeData.imageSrc}
            alt={challengeData.imageAiHint}
            layout="fill"
            objectFit="cover"
            data-ai-hint={challengeData.imageAiHint}
            priority
            className="transform transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">Story Starters & Cues:</h3>
          {challengeData.storyStarters.beginning.length > 0 && (
            <div className="mb-4 p-4 bg-background rounded-lg border border-border shadow-sm">
              <h4 className="font-semibold text-primary mb-2">Beginning Lines:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {challengeData.storyStarters.beginning.map((line, index) => (
                  <li key={`start-${index}`} className="italic">"{line}"</li>
                ))}
              </ul>
            </div>
          )}
          {challengeData.storyStarters.middle.length > 0 && (
             <div className="mb-4 p-4 bg-background rounded-lg border border-border shadow-sm">
              <h4 className="font-semibold text-primary mb-2">Mid-Story Cues:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {challengeData.storyStarters.middle.map((line, index) => (
                  <li key={`middle-${index}`} className="italic">... {line} ...</li>
                ))}
              </ul>
            </div>
          )}
          <Alert className="mt-4 bg-accent/10 border-accent/30">
            <Sparkles className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Writing Tip</AlertTitle>
            <AlertDescription className="text-accent-foreground/80">
              Let the image and theme guide you. Don&apos;t be afraid to twist the prompts or go in a completely new direction!
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
