
'use client';

import { useState } from 'react';
import DailyChallenge from '@/components/DailyChallenge';
import StoryEditor from '@/components/StoryEditor';
import type { Story } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const [currentStartingLine, setCurrentStartingLine] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSubmittedStory, setLastSubmittedStory] = useState<Story | null>(null);


  const handlePromptsLoaded = (startingLine: string, theme: string, imageSrc: string) => {
    setCurrentStartingLine(startingLine);
    setCurrentTheme(theme);
    setCurrentImageSrc(imageSrc);
  };

  const handleStorySubmitted = (newStory: Story) => {
    setLastSubmittedStory(newStory);
    // Potentially navigate to /stories or show a success message
  };

  return (
    <div className="space-y-8"> {/* Reduced overall spacing for tighter feel */}
      <DailyChallenge onPromptsLoaded={handlePromptsLoaded} />
      
      {/* More subtle separator */}
      <Separator className="my-4 bg-border/30 h-px" /> 

      {currentStartingLine && currentTheme && currentImageSrc ? (
        <StoryEditor
          currentTheme={currentTheme}
          currentImageSrc={currentImageSrc}
          onStorySubmitted={handleStorySubmitted}
          // Optionally pass currentStartingLine if StoryEditor needs to display it or prefill
          // For now, StoryEditor remains a blank slate as per current design
        />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          Loading story editor once inspiration is ready...
        </div>
      )}
    </div>
  );
}
