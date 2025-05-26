
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { checkStorySafety } from '@/app/actions';
import { Send, Loader2, Info, Eraser } from 'lucide-react';

interface StoryEditorProps {
  currentTheme: string;
  currentImageSrc: string;
  storyPrompt: string | null; // Renamed from initialStartingLine for clarity
  onStorySubmitted: (newStory: Story) => void;
}

export default function StoryEditor({ currentTheme, currentImageSrc, storyPrompt, onStorySubmitted }: StoryEditorProps) {
  const [storyText, setStoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);
  const { toast } = useToast();

  useEffect(() => {
    // Pre-fill the textarea with the storyPrompt when it's provided.
    // Add a couple of newlines to encourage writing on the next "ruled" line.
    setStoryText(storyPrompt ? storyPrompt + '\n\n' : '');
  }, [storyPrompt]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyText.trim().length < 10) { 
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
      onStorySubmitted(newStory);
      // Do not clear storyText here if we want the prompt to remain visible
      // setStoryText(''); 
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
    // Removed Card structure to fit into storybook-page-container
    <div className="w-full pt-4"> 
      <h2 className="text-xl font-semibold text-primary mb-3 text-center">
        {storyPrompt ? "Continue the Adventure:" : "Start Your Tale:"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div> {/* Replaces CardContent */}
          <Textarea
            placeholder={storyPrompt ? "The story continues..." : "Once upon a time, on a page much like this..."}
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            rows={10}
            className="ruled-textarea resize-none focus:ring-accent focus:border-accent"
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
        </div>
        <div className="flex justify-between items-center mt-6"> {/* Replaces CardFooter */}
           <Button
            type="button"
            variant="outline"
            onClick={() => setStoryText(storyPrompt ? storyPrompt + '\n\n' : '')} // Reset to prompt or clear
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Eraser className="h-4 w-4" /> {storyPrompt ? "Reset to Prompt" : "Clear Page"}
          </Button>
          <Button type="submit" disabled={isLoading || storyText.trim().length < 10} className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Save My Story
          </Button>
        </div>
      </form>
    </div>
  );
}
