'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

        const today = new Date().toISOString().split('T')[0];
        // Try S3 image URL first, fallback to original method if not S3
        const baseUrl = imageServiceConfig.getBaseUrl();
        let imageUrl;
        
        if (baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) {
          imageUrl = imageServiceConfig.getS3ImageUrl(today);
        } else {
          imageUrl = imageServiceConfig.getImageUrl(today);
        }
        
        dispatch(setImageUrl(imageUrl));
        
        // Cache today's image for offline access
        if (imageUrl) {
          cacheTodayImage(imageUrl);
        }
      } catch (error) {
        logger.error('Error loading initial state:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadInitialState();
  }, [dispatch, skipInit]);

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
    
    if ((baseUrl.includes('s3.amazonaws.com') || baseUrl.includes('amazonaws.com')) && !imageUrl?.includes('fallback')) {
      const fallbackUrl = imageServiceConfig.getFallbackImageUrl(today);
      // Mark as fallback to prevent infinite loop
      const fallbackUrlWithMarker = `${fallbackUrl}&fallback=true`;
      dispatch(setImageUrl(fallbackUrlWithMarker));
      setImageLoading(true); // Reset loading state to try fallback
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
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}
