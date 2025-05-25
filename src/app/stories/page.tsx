'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import type { Story } from '@/lib/types';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, BookOpen } from 'lucide-react';
import { ClientOnly } from '@/components/ClientOnly';

export default function StoriesPage() {
  const [localStories, setLocalStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);
  const [sortedStories, setSortedStories] = useState<Story[]>([]);

  useEffect(() => {
    // Sort stories by creation date, newest first
    const storiesToDisplay = [...localStories].sort((a, b) => b.createdAt - a.createdAt);
    setSortedStories(storiesToDisplay);
  }, [localStories]);

  const handleUpdateReactions = (storyId: string, newReactions: { [emoji: string]: number }) => {
    setLocalStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, reactions: newReactions } : story
      )
    );
  };

  return (
    <ClientOnly fallback={<LoadingState />}>
      {() => (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-8 w-8" /> My Story Collection
            </h1>
            <Button asChild variant="default" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Write a New Story
              </Link>
            </Button>
          </div>

          {sortedStories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">Your storybook is empty.</p>
              <p className="text-md text-muted-foreground mb-6">Let your imagination flow and create your first tale!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sortedStories.map(story => (
                <StoryCard key={story.id} story={story} onUpdateReactions={handleUpdateReactions} />
              ))}
            </div>
          )}
        </div>
      )}
    </ClientOnly>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-9 bg-muted rounded w-1/3"></div>
        <div className="h-10 bg-muted rounded w-1/4"></div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-muted/50 p-6 rounded-lg shadow-md">
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-muted rounded w-full mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
