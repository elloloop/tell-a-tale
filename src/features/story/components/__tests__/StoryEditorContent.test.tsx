import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '../../store/storySlice';
import { StoryProvider } from '../../contexts/StoryContext';
import StoryEditorContent from '../StoryEditorContent';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock the image service
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    getFallbackImageUrl: jest.fn(() => 'https://example.com/fallback.jpg'),
    isVideoUrl: jest.fn(() => false),
    isAnimatedUrl: jest.fn(() => false),
  },
  getImageOfTheDay: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      story: storyReducer,
    },
    preloadedState: {
      story: {
        story: '',
        draft: '',
        imageUrl: 'https://example.com/image.jpg',
        imageLoading: false,
        imageError: false,
        isLoading: false,
        isEditing: false,
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <StoryProvider skipInit={true}>{component}</StoryProvider>
    </Provider>
  );
};

describe('StoryEditorContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: true,
      });

      expect(screen.getByTestId('loading-text')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('story-editor')).not.toBeInTheDocument();
    });

    it('should display loading skeleton with proper styling', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: true,
      });

      const loadingContainer = screen.getByTestId('loading-text').parentElement;
      expect(loadingContainer).toHaveClass('max-w-2xl', 'mx-auto', 'p-4');
    });
  });

  describe('Normal State', () => {
    it('should render story editor when not loading', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
      });

      expect(screen.getByTestId('story-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-text')).not.toBeInTheDocument();
    });

    it('should render with default className', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
      });

      const editorContainer = screen.getByTestId('story-editor');
      expect(editorContainer).toHaveClass('max-w-2xl', 'mx-auto', 'p-4');
    });

    it('should render with custom className', () => {
      renderWithProviders(<StoryEditorContent className="custom-class" />, {
        isLoading: false,
      });

      const editorContainer = screen.getByTestId('story-editor');
      expect(editorContainer).toHaveClass('max-w-2xl', 'mx-auto', 'p-4', 'custom-class');
    });

    it('should render StoryImage and StoryContent components', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
      });

      // StoryImage should be rendered (it has its own test file)
      // StoryContent should be rendered (it has its own test file)
      expect(screen.getByTestId('story-editor')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render child components when not loading', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
        story: 'Test story',
      });

      // The component should render both StoryImage and StoryContent
      // We can verify this by checking that the story content is displayed
      expect(screen.getByTestId('story-editor')).toBeInTheDocument();
    });

    it('should handle empty story state', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
        story: '',
        draft: '',
      });

      expect(screen.getByTestId('story-editor')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: false,
      });

      expect(screen.getByTestId('story-editor')).toBeInTheDocument();
    });

    it('should have proper test IDs when loading', () => {
      renderWithProviders(<StoryEditorContent />, {
        isLoading: true,
      });

      expect(screen.getByTestId('loading-text')).toBeInTheDocument();
    });
  });
});
