'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Story } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import EmojiReactions from './EmojiReactions';
import ShareButton from './ShareButton';
import { CalendarDays, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface StoryCardProps {
  story: Story;
  onUpdateReactions: (storyId: string, newReactions: { [emoji: string]: number }) => void;
}

export default function StoryCard({ story, onUpdateReactions }: StoryCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary break-words">
          {story.title || `A Tale from ${new Date(story.createdAt).toLocaleDateString()}`}
        </CardTitle>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            Inspired by: {story.theme}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {story.dailyImageSrc && (
          <div className="mb-4 rounded-md overflow-hidden aspect-[16/9] relative max-h-40 w-full sm:w-1/2 lg:w-1/3 float-left mr-4 mb-2 sm:mb-0">
            <Image 
              src={story.dailyImageSrc} 
              alt={`Inspiration for ${story.title}`} 
              layout="fill"
              objectFit="cover"
              className="bg-muted"
            />
          </div>
        )}
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed break-words clear-both">
          {story.text}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
        <EmojiReactions story={story} onUpdateReactions={onUpdateReactions} size="sm" />
        <ShareButton story={story} />
      </CardFooter>
    </Card>
  );
}
