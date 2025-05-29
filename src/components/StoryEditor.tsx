'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { checkStorySafety, submitStoryToServer } from '@/app/actions';
import { Send, Loader2, Info, Eraser, Share2, PenLine } from 'lucide-react';
import { UsernameDialog } from '@/components/UsernameDialog';
import { useUser } from '@/providers/user-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface StoryEditorProps {
  currentTheme: string;
  currentImageSrc: string;
  storyPrompt: string | null; // Renamed from initialStartingLine for clarity
  onStorySubmitted: (newStory: Story) => void;
}

export default function StoryEditor({ currentTheme, currentImageSrc, storyPrompt, onStorySubmitted }: StoryEditorProps) {
  const [storyText, setStoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [pendingStory, setPendingStory] = useState<Story | null>(null);
  const [stories, setStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);
  const [isStorySaved, setIsStorySaved] = useState(false);
  const [signature, setSignature] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast } = useToast();
  const { username, isAuthenticated, signIn } = useUser();
  const signatureInputRef = useRef<HTMLInputElement>(null);

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

      if ('error' in moderationResult || !moderationResult.isSafe) {
        toast({
          title: 'Content Moderation',
          description: ('error' in moderationResult ? moderationResult.error : moderationResult.reason) || 'Your story could not be submitted due to content guidelines. Please revise.',
          variant: 'destructive',
          duration: 7000,
        });
        return;
      }

      // Create story object
      const newStory: Story = {
        id: crypto.randomUUID(),
        text: storyText,
        createdAt: Date.now(),
        reactions: {},
        theme: currentTheme,
        dailyImageSrc: currentImageSrc,
        title: storyText.substring(0, 50) + (storyText.length > 50 ? '...' : ''),
        username: username,
      };

      // Save to local storage
      setStories([...stories, newStory]);
      setPendingStory(newStory);
      setIsStorySaved(true);
      
      toast({
        title: 'Story Saved!',
        description: 'Add your signature to publish your story.',
      });

      // Focus the signature input after a short delay to ensure the DOM has updated
      setTimeout(() => {
        signatureInputRef.current?.focus();
      }, 100);
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

  const handleSignatureSubmit = async () => {
    if (!signature.trim()) {
      toast({
        title: 'Signature Required',
        description: 'Please add your signature to publish the story.',
        variant: 'destructive',
      });
      return;
    }

    if (!pendingStory) return;

    try {
      setIsSubmitting(true);
      
      const storyToPublish: Story = {
        ...pendingStory,
        username: signature,
      };
      
      const result = await submitStoryToServer(storyToPublish);
      
      if (result.success) {
        setShowShareOptions(true);
        toast({
          title: 'Story Published!',
          description: 'Your story is now published and ready to share.',
        });
        
        const updatedStories = stories.map(s => 
          s.id === pendingStory.id 
            ? { ...s, id: result.id || s.id, username: signature } 
            : s
        );
        setStories(updatedStories);
        onStorySubmitted(storyToPublish);
      } else {
        toast({
          title: 'Publishing Failed',
          description: result.error || 'Could not publish your story. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Publishing Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!pendingStory) return;

    try {
      // Generate shareable URL
      const shareUrl = `${window.location.origin}/share?storyId=${pendingStory.id}`;
      
      // Create WhatsApp share URL
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `Check out my story: ${shareUrl}`
      )}`;
      
      // Open WhatsApp share dialog
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Sharing Failed',
        description: 'Could not generate share link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUsernameDialogClose = (username?: string) => {
    setShowUsernameDialog(false);
    if (username) {
      handleSignatureSubmit();
    }
  };

  const handleLoginAndPublish = async () => {
    const signedIn = await signIn();
    if (signedIn) {
      handleSignatureSubmit();
    }
    setShowUsernameDialog(false);
  };

  const handleSignatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignatureSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsStorySaved(false);
    }
  };

  return (
    <div className="w-full pt-4"> 
      <h2 className="text-xl font-semibold text-primary mb-3 text-center">
        {storyPrompt ? "Continue the Adventure:" : "Start Your Tale:"}
      </h2>
      
      <AnimatePresence>
        {!isStorySaved ? (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
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
                  Your stories are saved locally in your browser&apos;s storage. When you publish, they will be visible to others.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex justify-between items-center mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStoryText(storyPrompt ? storyPrompt + '\n\n' : '')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Eraser className="h-4 w-4" /> {storyPrompt ? "Reset to Prompt" : "Clear Page"}
              </Button>
              <Button type="submit" disabled={isLoading || storyText.trim().length < 10} className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Save & Publish
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="ruled-textarea bg-background p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap font-serif">{storyText}</pre>
                <div className="mt-4 pt-4 border-t border-dashed">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Signed by:</span>
                  </div>
                  {!showShareOptions ? (
                    <div className="mt-2 flex gap-2">
                      <Input
                        ref={signatureInputRef}
                        placeholder="Enter your pen name"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        onKeyDown={handleSignatureKeyDown}
                        className="max-w-xs"
                      />
                      <Button
                        onClick={handleSignatureSubmit}
                        disabled={isSubmitting || !signature.trim()}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Sign & Publish
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm font-medium">{signature}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-4"
              >
                <Button
                  onClick={handleShareToWhatsApp}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="h-4 w-4" />
                  Share on WhatsApp
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Username dialog */}
      <UsernameDialog 
        isOpen={showUsernameDialog}
        onClose={handleUsernameDialogClose}
        onSave={handleSignatureSubmit}
        onLogin={handleLoginAndPublish}
      />
    </div>
  );
}
