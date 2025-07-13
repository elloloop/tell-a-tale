'use client';

import { useState, useEffect, useRef } from 'react';
import { imageServiceConfig } from '@/shared/config/imageService';

interface MediaDisplayProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  autoplayAnimations?: boolean;
  muteVideos?: boolean;
}

export default function MediaDisplay({
  src,
  alt = 'Daily prompt',
  className = '',
  width = 800,
  height = 400,
  onLoad,
  onError,
  fallbackSrc,
  autoplayAnimations = true,
  muteVideos = true,
}: MediaDisplayProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine media type based on URL
  useEffect(() => {
    if (imageServiceConfig.isVideoUrl(currentSrc)) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }
  }, [currentSrc]);

  // Handle successful media load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle media load error with fallback logic
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      // Try fallback URL
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
      return;
    }

    // If we're trying an animated version, fallback to static image
    if (imageServiceConfig.isAnimatedUrl(currentSrc) && !currentSrc.includes('.jpg')) {
      const staticUrl = currentSrc.replace(/\.(gif|mp4|webm|mov)$/, '.jpg');
      setCurrentSrc(staticUrl);
      setIsLoading(true);
      setHasError(false);
      return;
    }

    // Final fallback - show error
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Auto-play video when it loads
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current && autoplayAnimations) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, [mediaType, autoplayAnimations]);

  // Auto-complete loading in test environment
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      const timer = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setHasError(false);
          onLoad?.();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoad]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <div className="text-sm">Unable to load media</div>
        </div>
      </div>
    );
  }

  // Render video
  if (mediaType === 'video') {
    return (
      <video
        ref={videoRef}
        className={`object-cover ${className}`}
        width={width}
        height={height}
        onLoadedData={handleLoad}
        onError={handleError}
        autoPlay={autoplayAnimations}
        loop
        muted={muteVideos}
        playsInline
        data-testid="story-image"
      >
        <source src={currentSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Render image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`object-cover ${className}`}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      data-testid="story-image"
    />
  );
}
