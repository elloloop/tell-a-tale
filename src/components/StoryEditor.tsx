'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStory, setImageUrl, setLoading } from '@/store/storySlice';
import { RootState } from '@/store/store';
import { logger } from '@/lib/logger';
import { imageServiceConfig } from '../config/imageService';

interface StoryEditorProps {
  className?: string;
  skipInit?: boolean; // for testing only
}

export default function StoryEditor({ className = '', skipInit = false }: StoryEditorProps) {
  const dispatch = useDispatch();
  const { story, imageUrl, isLoading } = useSelector((state: RootState) => state.story);
  const [draft, setDraft] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
        const imageUrl = imageServiceConfig.getImageUrl(today);
        dispatch(setImageUrl(imageUrl));
      } catch (error) {
        logger.error('Error loading initial state:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadInitialState();
  }, [dispatch, skipInit]);

  useEffect(() => {
    // Update draft when story changes in Redux store
    if (story) {
      setDraft(story);
    }
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(story);
    setIsEditing(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
          <div className="w-full h-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="text-center mt-4" data-testid="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      <div className="relative">
        {imageLoading && (
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
        )}
        {imageError ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">Failed to load image</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Image of the day"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
            data-testid="story-image"
          />
        )}
      </div>

      {story && !isEditing ? (
        <div className="mt-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-gray-800" data-testid="story-content">{story}</p>
          </div>
          <button
            onClick={handleEdit}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            data-testid="edit-button"
          >
            Edit Story
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
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
      )}
    </div>
  );
}
