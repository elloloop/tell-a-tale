'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStory, setImageUrl, setLoading } from '@/features/story/store/storySlice';
import { RootState } from '@/shared/store/store';
import { logger } from '@/shared/lib/logger';
import { imageServiceConfig } from '@/shared/config/imageService';
import { cacheTodayImage } from '@/shared/lib/serviceWorker';

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

type LoadInitialStateArgs = {
  dispatch: ReturnType<typeof useDispatch>;
  setDraft: Dispatch<SetStateAction<string>>;
  setAnimationsEnabled: Dispatch<SetStateAction<boolean>>;
  setImageError: Dispatch<SetStateAction<boolean>>;
};

function loadInitialState(
  { dispatch, setDraft, setAnimationsEnabled, setImageError }: LoadInitialStateArgs,
  skipInit: boolean,
  animationsEnabled: boolean
) {
  if (skipInit) return;
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

    // Determine language from localStorage or domain
    let language = 'en';
    if (typeof window !== 'undefined') {
      const storedLang = window.localStorage.getItem('userLanguage');
      if (storedLang) language = storedLang;
      else {
        const hostname = window.location.hostname;
        if (hostname.includes('bullikatha.web.app')) language = 'te';
        else if (hostname.includes('penloop.web.app')) language = 'en';
      }
    }

    const today = new Date().toISOString().split('T')[0];
    let imageUrl: string;

    // Use deterministic image URL based on language and date
    if (animationsEnabled) {
      // Try animated content first
      imageUrl = imageServiceConfig.getMediaUrl(today, undefined, language, false);
    } else {
      // Use static image if animations are disabled
      imageUrl = imageServiceConfig.getImageUrl(today, undefined, language);
    }

    if (imageUrl) {
      dispatch(setImageUrl(imageUrl));
      cacheTodayImage(imageUrl);
      if (animationsEnabled && imageServiceConfig.isAnimatedUrl(imageUrl)) {
        const staticUrl = imageUrl.replace(/\.(gif|mp4|webm|mov)$/, '');
        cacheTodayImage(staticUrl);
      }
    }
    // Removed unused setupMidnightPreloading assignment
  } catch (error) {
    logger.error('Error loading initial state:', error);
    setImageError(true);
  } finally {
    dispatch(setLoading(false));
  }
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
    loadInitialState(
      { dispatch, setDraft, setAnimationsEnabled, setImageError },
      skipInit,
      animationsEnabled
    );
  }, [skipInit]);

  // Save animation preference when it changes
  useEffect(() => {
    if (skipInit || typeof window === 'undefined') return;
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
  }, [animationsEnabled, skipInit]);

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

    if (imageUrl && !imageUrl.includes('fallback')) {
      // First try: if we failed on animated content, try static image
      if (animationsEnabled && imageUrl && imageServiceConfig.isAnimatedUrl(imageUrl)) {
        const staticUrl = imageServiceConfig.getImageUrl(today, undefined, 'en');
        const staticUrlWithMarker = `${staticUrl}${staticUrl.includes('?') ? '&' : '?'}fallback=static`;
        dispatch(setImageUrl(staticUrlWithMarker));
        setImageLoading(true);
        return;
      }

      // Second try: yesterday's image
      const fallbackUrl = imageServiceConfig.getFallbackImageUrl(today, undefined, 'en');
      const fallbackUrlWithMarker = `${fallbackUrl}${fallbackUrl.includes('?') ? '&' : '?'}fallback=yesterday`;
      dispatch(setImageUrl(fallbackUrlWithMarker));
      setImageLoading(true);
      return;
    }

    // If fallback also fails, use placeholder image
    const placeholderUrl = imageServiceConfig.getPlaceholderImage();
    dispatch(setImageUrl(placeholderUrl));
    setImageLoading(true);
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
