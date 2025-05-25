'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Story } from '@/lib/types';
import { Smile, Heart, ThumbsUp, Zap, Meh } from 'lucide-react'; // Using more generic icons

interface EmojiReactionsProps {
  story: Story;
  onUpdateReactions: (storyId: string, newReactions: { [emoji: string]: number }) => void;
  size?: 'sm' | 'default';
}

const availableEmojis = [
  { icon: <ThumbsUp />, name: '👍' },
  { icon: <Heart />, name: '❤️' },
  { icon: <Smile />, name: '😄' },
  { icon: <Zap />, name: '🔥' },
  { icon: <Meh />, name: '🤔' },
];

export default function EmojiReactions({ story, onUpdateReactions, size = 'default' }: EmojiReactionsProps) {
  const [currentReactions, setCurrentReactions] = useState(story.reactions || {});

  const handleReaction = (emojiName: string) => {
    const newReactions = { ...currentReactions };
    if (newReactions[emojiName]) {
      newReactions[emojiName]++;
    } else {
      newReactions[emojiName] = 1;
    }
    setCurrentReactions(newReactions);
    onUpdateReactions(story.id, newReactions);
  };
  
  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonPadding = size === 'sm' ? 'p-1.5' : 'p-2';
  const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';


  return (
    <div className={`flex items-center gap-1 ${size === 'sm' ? 'py-1' : 'py-2'}`}>
      {availableEmojis.map(({ icon, name }) => (
        <Button
          key={name}
          variant="ghost"
          size="icon"
          className={`rounded-full hover:bg-accent/50 transition-colors ${buttonPadding} group`}
          onClick={() => handleReaction(name)}
          aria-label={`React with ${name}`}
        >
          <span className={`transition-transform group-hover:scale-125 ${iconSizeClass}`}>
            {icon}
          </span>
          {currentReactions[name] > 0 && (
            <span className={`ml-1 font-medium text-primary ${textSizeClass}`}>
              {currentReactions[name]}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
