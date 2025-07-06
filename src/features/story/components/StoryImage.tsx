'use client';

import Image from 'next/image';
import { useStory } from '@/features/story/contexts/StoryContext';

export default function StoryImage() {
  const { imageUrl, imageLoading, imageError, handleImageLoad, handleImageError } = useStory();

  return (
    <div className="relative">
      {imageLoading && <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />}
      {imageError ? (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">Failed to load image</p>
        </div>
      ) : (
        <div className="relative w-full h-64">
          <Image
            src={imageUrl}
            alt="Image of the day"
            fill
            className="object-cover rounded-lg shadow-lg"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
            data-testid="story-image"
          />
        </div>
      )}
    </div>
  );
}
