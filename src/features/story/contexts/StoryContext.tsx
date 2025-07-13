'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStory, setImageUrl, setLoading } from '@/features/story/store/storySlice';
import { RootState } from '@/shared/store/store';
import { logger } from '@/shared/lib/logger';
import { imageServiceConfig } from '@/shared/config/imageService';
import { cacheTodayImage, preloadTomorrowImage } from '@/shared/lib/serviceWorker';

interface StoryContextType {
  story: string | null;
  imageUrl: string;
  isLoading: boolean;
  draft: string;
  setDraft: (value: string) => void;
  imageLoading: boolean;
  imageError: boolean;
  isEditing: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleEdit: () => void;
  handleCancel: () => void;
  handleImageLoad: () => void;
  handleImageError: () => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};

interface StoryProviderProps {
  children: ReactNode;
  skipInit?: boolean; // for testing only
}

export function StoryProvider({ children, skipInit = false }: StoryProviderProps) {
  const dispatch = useDispatch();
  const { story, imageUrl, isLoading } = useSelector((state: RootState) => state.story);
  const [draft, setDraft] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Initialize story from localStorage and fetch image
  useEffect(() => {
    if (skipInit) return;

    const loadInitialState = async () => {
      dispatch(setLoading(true));
      try {
        const savedStory = localStorage.getItem('todayStory');
        if (savedStory) {
          dispatch(setStory(savedStory));
          setDraft(savedStory);
        }

        // Load animation preference
        const savedAnimationPref = localStorage.getItem('animationsEnabled');
        if (savedAnimationPref !== null) {
          setAnimationsEnabled(JSON.parse(savedAnimationPref));
        }

        const today = new Date().toISOString().split('T')[0];
        const baseUrl = imageServiceConfig.getBaseUrl();
        let imageUrl;

        // Attempt to load the appropriate image based on animation preferences
        if (baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) {
          if (animationsEnabled) {
            // Try animated content first
            imageUrl = imageServiceConfig.getMediaUrl(today, undefined, false);
          } else {
            // Use static image if animations are disabled
            imageUrl = imageServiceConfig.getS3ImageUrl(today);
          }
        } else {
          // Fallback to regular image service
          imageUrl = imageServiceConfig.getImageUrl(today);
        }

        if (imageUrl) {
          dispatch(setImageUrl(imageUrl));

          // Cache today's image for offline access
          cacheTodayImage(imageUrl);

          // Also cache a static version as fallback
          if (animationsEnabled && imageServiceConfig.isAnimatedUrl(imageUrl)) {
            const staticUrl = imageUrl.replace(/\.(gif|mp4|webm|mov)$/, '.jpg');
            cacheTodayImage(staticUrl);
          }
        }

        // Setup midnight preloading for tomorrow's image
        setupMidnightPreloading();
      } catch (error) {
        logger.error('Error loading initial state:', error);
        setImageError(true);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadInitialState();
  }, [dispatch, skipInit, animationsEnabled]);

  // Save animation preference when it changes
  useEffect(() => {
    if (skipInit || typeof window === 'undefined') return;
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
  }, [animationsEnabled, skipInit]);

  // Setup midnight preloading timer
  const setupMidnightPreloading = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set initial timer for next midnight
    const timeoutId = setTimeout(() => {
      // Preload tomorrow's image
      preloadTomorrowImage();

      // Set up daily recurring preloading
      setInterval(
        () => {
          preloadTomorrowImage();
        },
        24 * 60 * 60 * 1000
      ); // Every 24 hours
    }, timeUntilMidnight);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  };

  // Sync draft with story when story changes
  useEffect(() => {
    if (story) setDraft(story);
  }, [story]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(setStory(draft));
      localStorage.setItem('todayStory', draft);
      setIsEditing(false);
    } catch (error) {
      logger.error('Error saving story:', error);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setDraft(story ?? '');
    setIsEditing(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    // Try fallback to yesterday's image
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = imageServiceConfig.getBaseUrl();

    if (
      (baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) &&
      imageUrl &&
      !imageUrl.includes('fallback')
    ) {
      // First try: if we failed on animated content, try static image
      if (animationsEnabled && imageUrl && imageServiceConfig.isAnimatedUrl(imageUrl)) {
        const staticUrl = imageUrl.replace(/\.(gif|mp4|webm|mov)$/, '.jpg');
        const staticUrlWithMarker = `${staticUrl}${staticUrl.includes('?') ? '&' : '?'}fallback=static`;
        dispatch(setImageUrl(staticUrlWithMarker));
        setImageLoading(true);
        return;
      }

      // Second try: yesterday's image
      const fallbackUrl = imageServiceConfig.getFallbackImageUrl(today);
      const fallbackUrlWithMarker = `${fallbackUrl}${fallbackUrl.includes('?') ? '&' : '?'}fallback=yesterday`;
      dispatch(setImageUrl(fallbackUrlWithMarker));
      setImageLoading(true);
      return;
    }

    // If fallback also fails or not using S3, show error
    setImageLoading(false);
    setImageError(true);
  };

  const value = {
    story,
    imageUrl,
    isLoading,
    draft,
    setDraft,
    imageLoading,
    imageError,
    isEditing,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleImageLoad,
    handleImageError,
    animationsEnabled,
    setAnimationsEnabled,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}
