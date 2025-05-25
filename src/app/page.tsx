'use client';

import { useState } from 'react';
import DailyChallenge from '@/components/DailyChallenge';
import StoryEditor from '@/components/StoryEditor';
import type { Story } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const [currentPrompts, setCurrentPrompts] = useState<{ beginning: string[], middle: string[] } | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastSubmittedStory, setLastSubmittedStory] = useState<Story | null>(null);


  const handlePromptsLoaded = (prompts: { beginning: string[], middle: string[] }, theme: string, imageSrc: string) => {
    setCurrentPrompts(prompts);
    setCurrentTheme(theme);
    setCurrentImageSrc(imageSrc);
  };

  const handleStorySubmitted = (newStory: Story) => {
    setLastSubmittedStory(newStory);
    // Potentially navigate to /stories or show a success message
  };

  return (
    <div className="space-y-12">
      <DailyChallenge onPromptsLoaded={handlePromptsLoaded} />
      
      <Separator className="my-8 bg-border/50" />

      {currentPrompts && currentTheme && currentImageSrc ? (
        <StoryEditor
          currentTheme={currentTheme}
          currentImageSrc={currentImageSrc}
          onStorySubmitted={handleStorySubmitted}
        />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          Loading story editor once inspiration is ready...
        </div>
      )}
    </div>
  );
}
