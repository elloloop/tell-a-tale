'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { checkStorySafety } from '@/app/actions';
import { Send, Loader2, Info, Eraser } from 'lucide-react';

interface StoryEditorProps {
  currentTheme: string;
  currentImageSrc: string;
  onStorySubmitted: (newStory: Story) => void;
}

export default function StoryEditor({ currentTheme, currentImageSrc, onStorySubmitted }: StoryEditorProps) {
  const [storyText, setStoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyText.trim().length < 10) { // Basic validation
      toast({
        title: 'Story Too Short',
        description: 'Please write a bit more for your story (at least 10 characters).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const moderationResult = await checkStorySafety({ story: storyText });

      if ('error' in moderationResult) {
        toast({
          title: 'Moderation Error',
          description: moderationResult.error,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!moderationResult.isSafe) {
        toast({
          title: 'Content Moderation',
          description: moderationResult.reason || 'Your story could not be submitted due to content guidelines. Please revise.',
          variant: 'destructive',
          duration: 7000,
        });
        setIsLoading(false);
        return;
      }

      const newStory: Story = {
        id: crypto.randomUUID(),
        text: storyText,
        createdAt: Date.now(),
        reactions: {},
        theme: currentTheme,
        dailyImageSrc: currentImageSrc,
        title: storyText.substring(0, 50) + (storyText.length > 50 ? '...' : ''),
      };

      setStories([...stories, newStory]);
      onStorySubmitted(newStory); // Callback for parent component if needed
      setStoryText('');
      toast({
        title: 'Story Saved!',
        description: 'Your masterpiece is now safely stored in your local tales.',
      });

    } catch (error: any) {
      console.error('Error submitting story:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl mt-8 bg-card/70 border-2 border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Weave Your Tale</CardTitle>
        <CardDescription className="text-foreground/80">Inspired? Write your story below. Your words, your world.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Once upon a time, on a page much like this..."
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            rows={10}
            className="ruled-textarea resize-none focus:ring-accent focus:border-accent" // Added ruled-textarea class
            disabled={isLoading}
            aria-label="Story composition text area"
          />
          <Alert className="mt-4 bg-primary/10 border-primary/30">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Local Storage Notice</AlertTitle>
            <AlertDescription className="text-primary-foreground/80">
              Your stories are saved locally in your browser&apos;s storage. They are not uploaded to any server unless you choose to share them.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
           <Button
            type="button"
            variant="outline"
            onClick={() => setStoryText('')}
            disabled={isLoading || !storyText}
            className="flex items-center gap-2"
          >
            <Eraser className="h-4 w-4" /> Clear Page
          </Button>
          <Button type="submit" disabled={isLoading || storyText.trim().length < 10} className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Save My Story
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
