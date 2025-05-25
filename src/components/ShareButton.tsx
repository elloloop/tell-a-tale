'use client';

import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Story, SharedStoryPayload } from '@/lib/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ShareButtonProps {
  story: Story;
}

// Basic obfuscation for the story text in URL
function obfuscate(text: string): string {
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    // Fallback for very long strings or other btoa issues
    return btoa("Error obfuscating content");
  }
}

export default function ShareButton({ story }: ShareButtonProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareUrl = () => {
    const payload: SharedStoryPayload = {
      title: story.title || story.text.substring(0, 30) + "...",
      teaser: story.text.substring(0, 100) + (story.text.length > 100 ? '...' : ''), // First 100 chars as teaser
      fullStoryEnc: obfuscate(story.text),
      dailyImageSrc: story.dailyImageSrc, // Assuming this is stored with the story
      dailyImageHint: "shared story image", // Generic hint or pass from story if available
      theme: story.theme, // Assuming this is stored with the story
    };

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = new URL(`${currentOrigin}/share`);
    
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) { // Ensure value is not undefined before setting
         url.searchParams.append(key, String(value));
      }
    });
    
    setShareUrl(url.toString());
  };

  const handleShare = () => {
    generateShareUrl();
    setIsDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({ title: 'Link Copied!', description: 'Shareable link copied to clipboard.' });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({ title: 'Copy Failed', description: 'Could not copy link. Please try manually.', variant: 'destructive' });
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Tale</DialogTitle>
            <DialogDescription>
              Copy the link below to share your story. Others will see a teaser and can write their own story before reading yours!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link" className="sr-only">
                Link
              </Label>
              <Input
                id="share-link"
                defaultValue={shareUrl}
                readOnly
                className="h-9"
              />
            </div>
            <Button type="button" size="sm" className="px-3 h-9" onClick={copyToClipboard} disabled={!shareUrl}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
