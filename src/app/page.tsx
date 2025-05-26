
'use client';

import { useState } from 'react';
import DailyChallenge from '@/components/DailyChallenge';
import StoryEditor from '@/components/StoryEditor';
import type { Story } from '@/lib/types';

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
    <div className="space-y-4">
      {/* storybook-page-container will provide the overall page look */}
      <div className="storybook-page-container">
        <DailyChallenge onPromptsLoaded={handlePromptsLoaded} />
        
        {currentStartingLine && currentTheme && currentImageSrc ? (
          <StoryEditor
            currentTheme={currentTheme}
            currentImageSrc={currentImageSrc}
            storyPrompt={currentStartingLine} // Pass starting line as storyPrompt
            onStorySubmitted={handleStorySubmitted}
          />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Loading story editor once inspiration is ready...
          </div>
        )}
      </div>
    </div>
  );
}
