'use client';

import Image from 'next/image';
import { useStory, StoryProvider } from '@/features/story/contexts/StoryContext';
import { imageServiceConfig } from '@/shared/config/imageService';

interface StoryEditorProps {
  className?: string;
  skipInit?: boolean; // for testing only
}

// StoryContent component to display the story content or editor
function StoryContent() {
  const { story, isEditing, draft, setDraft, handleSubmit, handleEdit, handleCancel } = useStory();

  if (story && !isEditing) {
    return (
      <div className="mt-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-800" data-testid="story-content">
            {story}
          </p>
        </div>
        <button
          onClick={handleEdit}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          data-testid="edit-button"
        >
          Edit Story
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Write your story..."
        className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
        data-testid="story-textarea"
      />
      <div className="flex space-x-2 mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          data-testid="save-button"
        >
          Save Story
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// StorySettings component for animation toggle
function StorySettings() {
  const { animationsEnabled, setAnimationsEnabled } = useStory();

  return (
    <div className="mb-4 flex justify-end">
      <button
        onClick={() => setAnimationsEnabled(!animationsEnabled)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`${animationsEnabled ? 'Disable' : 'Enable'} animations`}
        data-testid="animation-toggle"
      >
        <span className="text-xl">{animationsEnabled ? '🎬' : '🖼️'}</span>
        <span className="hidden sm:inline">
          {animationsEnabled ? 'Animations On' : 'Static Images'}
        </span>
      </button>
    </div>
  );
}
function StoryImage() {
  const {
    imageUrl,
    imageLoading,
    imageError,
    handleImageLoad,
    handleImageError,
    animationsEnabled,
  } = useStory();

  return (
    <div className="relative">
      {imageLoading && (
        <div
          className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"
          data-testid="image-loading"
        />
      )}
      {imageError ? (
        <div
          className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"
          data-testid="image-error"
        >
          <p className="text-gray-500">Failed to load image</p>
        </div>
      ) : (
        <div className="relative w-full h-64">
          {imageUrl && imageServiceConfig.isVideoUrl(imageUrl) ? (
            <video
              src={imageUrl}
              className="w-full h-full object-cover rounded-lg shadow-lg"
              onLoadedData={handleImageLoad}
              onError={handleImageError}
              autoPlay={animationsEnabled}
              loop
              muted
              playsInline
              controls={false}
              data-testid="story-video"
            />
          ) : imageUrl ? (
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
          ) : null}
        </div>
      )}
    </div>
  );
}

// StoryEditorContent component that uses the context
function StoryEditorContent({ className = '' }: { className?: string }) {
  const { isLoading } = useStory();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
          <div className="w-full h-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="text-center mt-4" data-testid="loading-text">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`} data-testid="story-editor">
      <StorySettings />
      <StoryImage />
      <StoryContent />
    </div>
  );
}

// Main StoryEditor component that provides the context
export default function StoryEditor({ className = '', skipInit = false }: StoryEditorProps) {
  return (
    <StoryProvider skipInit={skipInit}>
      <StoryEditorContent className={className} />
    </StoryProvider>
  );
}
