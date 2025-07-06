'use client';

import { useStory } from '@/features/story/contexts/StoryContext';
import MediaDisplay from '@/shared/components/MediaDisplay';
import { imageServiceConfig } from '@/shared/config/imageService';

export default function StoryImage() {
  const { 
    imageUrl, 
    imageLoading, 
    imageError, 
    handleImageLoad, 
    handleImageError,
    animationsEnabled 
  } = useStory();

  // Generate fallback URL for error handling
  const today = new Date().toISOString().split('T')[0];
  const fallbackUrl = imageServiceConfig.getFallbackImageUrl(today);

  return (
    <div className="relative">
      {imageLoading && <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />}
      {imageError ? (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">Failed to load image</p>
        </div>
      ) : (
        <div className="relative w-full h-64">
          <MediaDisplay
            src={imageUrl}
            alt="Daily story prompt"
            className="rounded-lg shadow-lg"
            width={800}
            height={256}
            onLoad={handleImageLoad}
            onError={handleImageError}
            fallbackSrc={fallbackUrl}
            autoplayAnimations={animationsEnabled}
            muteVideos={true}
          />
        </div>
      )}
    </div>
  );
}
