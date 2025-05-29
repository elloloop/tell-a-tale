'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import type { Story } from '@/lib/types';
import StoryCard from '@/components/StoryCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, BookOpen, Users, User } from 'lucide-react';
import { ClientOnly } from '@/components/ClientOnly';
import { findLatestAvailableImageUrl } from '@/lib/utils';
import { getAllStories } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/providers/user-provider';

export default function StoriesPage() {
  const [localStories, setLocalStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);
  const [publishedStories, setPublishedStories] = useState<Story[]>([]);
  const [communityStories, setCommunityStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useUser();
  const [hasPublished, setHasPublished] = useState(false);

  useEffect(() => {
    // Sort stories by creation date, newest first
    const storiesToDisplay = [...localStories].sort((a, b) => b.createdAt - a.createdAt);
    
    // Check if any stories have been published (have a username)
    const publishedFound = localStories.some(story => story.username);
    setHasPublished(publishedFound);
    
    // Separate published stories by this user
    setPublishedStories(storiesToDisplay.filter(story => story.username));
  }, [localStories]);

  useEffect(() => {
    // Only fetch community stories if the user has published at least one story
    if (hasPublished) {
      fetchCommunityStories();
    }
  }, [hasPublished]);

  const fetchCommunityStories = async () => {
    setIsLoading(true);
    try {
      const stories = await getAllStories();
      // Filter out current user's stories
      setCommunityStories(stories.filter(story => story.username && story.username !== username));
    } catch (error) {
      console.error('Error fetching community stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReactions = (storyId: string, newReactions: { [emoji: string]: number }) => {
    setLocalStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, reactions: newReactions } : story
      )
    );
  };

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  const staticImage = findLatestAvailableImageUrl(today);
  // Use staticImage as needed in your page

  return (
    <ClientOnly fallback={<LoadingState />}>
      {() => (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <BookOpen className="h-8 w-8" /> Story Collection
            </h1>
            <Button asChild variant="default" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Write a New Story
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="my-stories" className="w-full">
            <TabsList>
              <TabsTrigger value="my-stories" className="flex items-center gap-2">
                <User className="h-4 w-4" /> My Stories
              </TabsTrigger>
              <TabsTrigger value="community-stories" disabled={!hasPublished} title={!hasPublished ? "Publish a story first to see community stories" : ""} className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Community Stories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-stories">
              {localStories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-xl text-muted-foreground mb-2">Your storybook is empty.</p>
                  <p className="text-md text-muted-foreground mb-6">Let your imagination flow and create your first tale!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {publishedStories.map(story => (
                    <StoryCard key={story.id} story={story} onUpdateReactions={handleUpdateReactions} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="community-stories">
              {isLoading ? (
                <LoadingState />
              ) : communityStories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-xl text-muted-foreground mb-2">No community stories found.</p>
                  <p className="text-md text-muted-foreground mb-6">Check back later for stories from other users!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {communityStories.map(story => (
                    <StoryCard key={story.id} story={story} onUpdateReactions={handleUpdateReactions} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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
