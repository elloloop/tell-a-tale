'use client';

import { useStory } from '@/features/story/contexts/StoryContext';
import MediaDisplay from '@/shared/components/MediaDisplay';
import { imageServiceConfig } from '@/shared/config/imageService';

function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    const storedLang = window.localStorage.getItem('userLanguage');
    if (storedLang) return storedLang;
    const hostname = window.location.hostname;
    if (hostname.includes('bullikatha.web.app')) return 'te';
    if (hostname.includes('penloop.web.app')) return 'en';
  }
  return 'en';
}

export default function StoryImage() {
  const {
    imageUrl,
    imageLoading,
    imageError,
    handleImageLoad,
    handleImageError,
    animationsEnabled,
  } = useStory();

  const today = new Date().toISOString().split('T')[0];
  const language = getCurrentLanguage();
  const fallbackUrl = imageServiceConfig.getFallbackImageUrl(today, undefined, language);
  const placeholderUrl = imageServiceConfig.getPlaceholderImage();

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
            placeholderSrc={placeholderUrl}
            autoplayAnimations={animationsEnabled}
            muteVideos={true}
          />
        </div>
      )}
    </div>
  );
}
