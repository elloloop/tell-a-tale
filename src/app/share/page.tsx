'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Story, SharedStoryPayload } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { checkStorySafety } from '@/app/actions';
import { Lightbulb, Lock, Unlock, Send, Loader2, Info, Eye } from 'lucide-react';
import { ClientOnly } from '@/components/ClientOnly';

// Basic deobfuscation for the story text from URL
function deobfuscate(obfuscatedText: string): string {
  try {
    return decodeURIComponent(atob(obfuscatedText));
  } catch (e) {
    console.error("Deobfuscation error:", e);
    return "Error: Could not display shared content.";
  }
}

function SharePageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sharedPayload, setSharedPayload] = useState<SharedStoryPayload | null>(null);
  const [viewerStoryText, setViewerStoryText] = useState('');
  const [isViewerStorySubmitted, setIsViewerStorySubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localStories, setLocalStories] = useLocalStorage<Story[]>('tell-a-tale-stories', []);

  useEffect(() => {
    if (searchParams) {
      const payload: SharedStoryPayload = {
        title: searchParams.get('title') || undefined,
        teaser: searchParams.get('teaser') || '',
        fullStoryEnc: searchParams.get('fullStoryEnc') || '',
        dailyImageSrc: searchParams.get('dailyImageSrc') || '',
        dailyImageHint: searchParams.get('dailyImageHint') || '',
        theme: searchParams.get('theme') || '',
      };
      if (payload.teaser && payload.fullStoryEnc && payload.dailyImageSrc && payload.theme) {
        setSharedPayload(payload);
      } else {
        toast({ title: 'Invalid Share Link', description: 'This share link is incomplete or corrupted.', variant: 'destructive' });
      }
    }
  }, [searchParams, toast]);

  const handleViewerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewerStoryText.trim().length < 10) {
      toast({ title: 'Story Too Short', description: 'Please write a bit more (at least 10 characters) to unlock the shared story.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const moderationResult = await checkStorySafety({ story: viewerStoryText });
      if ('error' in moderationResult || !moderationResult.isSafe) {
        toast({
          title: 'Content Moderation',
          description: ('error' in moderationResult ? moderationResult.error : moderationResult.reason) || 'Your story could not be submitted due to content guidelines. Please revise.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const newStory: Story = {
        id: crypto.randomUUID(),
        text: viewerStoryText,
        createdAt: Date.now(),
        reactions: {},
        title: viewerStoryText.substring(0, 50) + '...',
        dailyImageSrc: sharedPayload?.dailyImageSrc || 'N/A', // Use shared image as context
        theme: sharedPayload?.theme || 'Shared Inspiration', // Use shared theme
      };
      setLocalStories(prev => [...prev, newStory]);
      setIsViewerStorySubmitted(true);
      toast({ title: 'Your Story Submitted!', description: "You've unlocked the shared tale!" });
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!sharedPayload) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading shared story...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Lightbulb className="h-7 w-7" /> Shared Inspiration: {sharedPayload.title || "A Mysterious Tale"}
          </CardTitle>
          <CardDescription>Theme: <span className="font-semibold text-accent">{sharedPayload.theme}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg overflow-hidden shadow-md aspect-video relative">
            <Image
              src={sharedPayload.dailyImageSrc}
              alt={sharedPayload.dailyImageHint}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              data-ai-hint={sharedPayload.dailyImageHint}
              priority
            />
          </div>
          {!isViewerStorySubmitted && (
            <>
              <h3 className="text-xl font-semibold mb-2">A Glimpse of the Tale...</h3>
              <p className="italic text-muted-foreground p-4 border border-dashed border-border rounded-md bg-background">
                "{sharedPayload.teaser}"
              </p>
              <Alert className="mt-6 bg-primary/10 border-primary/30">
                <Lock className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Unlock the Full Story!</AlertTitle>
                <AlertDescription className="text-primary-foreground/80">
                  To read the full story, first share your own interpretation inspired by the image and theme above.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {!isViewerStorySubmitted ? (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Your Turn to Weave!</CardTitle>
            <CardDescription>Write your story based on the shared inspiration.</CardDescription>
          </CardHeader>
          <form onSubmit={handleViewerSubmit}>
            <CardContent>
              <Textarea
                placeholder="Inspired by the image and teaser, my story begins..."
                value={viewerStoryText}
                onChange={(e) => setViewerStoryText(e.target.value)}
                rows={8}
                className="resize-none"
                disabled={isLoading}
              />
               <Alert className="mt-4 bg-accent/10 border-accent/30">
                <Info className="h-4 w-4 text-accent" />
                <AlertTitle className="text-accent">Remember</AlertTitle>
                <AlertDescription className="text-accent-foreground/80">
                  Your story will be saved to your local collection.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || viewerStoryText.trim().length < 10} className="ml-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit & Reveal Story
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Unlock className="h-7 w-7" /> The Full Shared Story Revealed!
            </CardTitle>
            <CardDescription>Enjoy the tale shared with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">{sharedPayload.title || "Shared Story"}</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 p-4 border border-border rounded-md bg-background/80 shadow-inner">
              {deobfuscate(sharedPayload.fullStoryEnc)}
            </p>
          </CardContent>
           <CardFooter>
            <Button asChild variant="link" className="text-accent">
              <Link href="/stories" className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> View your story collection
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}


export default function SharePage() {
  return (
    // Suspense is required by Next.js for pages using useSearchParams
    <Suspense fallback={<LoadingState />}>
      <ClientOnly fallback={<LoadingState />}>
        {() => <SharePageContent />}
      </ClientOnly>
    </Suspense>
  );
}

function LoadingState() {
 return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-muted/50 p-6 rounded-lg shadow-md">
        <div className="h-8 bg-muted rounded w-1/2 mb-3"></div>
        <div className="h-5 bg-muted rounded w-1/3 mb-6"></div>
        <div className="aspect-video bg-muted rounded-lg mb-6"></div>
        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
        <div className="h-16 bg-muted rounded w-full"></div>
      </div>
    </div>
  );
}

