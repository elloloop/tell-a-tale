'use client';

import { useStory } from '@/features/story/contexts/StoryContext';
import StoryImage from './StoryImage';
import StoryContent from './StoryContent';

interface StoryEditorContentProps {
  className?: string;
}

export default function StoryEditorContent({ className = '' }: StoryEditorContentProps) {
  const { isLoading } = useStory();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
          <div className="w-full h-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="text-center mt-4" data-testid="loading-text">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`} data-testid="story-editor">
      <StoryImage />
      <StoryContent />
    </div>
  );
}
