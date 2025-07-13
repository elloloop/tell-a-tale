import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '../../store/storySlice';
import StoryImage from '../StoryImage';

// Mock the image service
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    getFallbackImageUrl: jest.fn(() => 'https://example.com/fallback.jpg'),
    isVideoUrl: jest.fn(() => false),
    isAnimatedUrl: jest.fn(() => false),
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string; fill?: boolean }
  ) {
    // Remove fill prop as it's not valid for standard img tags
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, ...validProps } = props;
    // Pass all props to img, including event handlers
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...validProps} src={props.src || 'https://test-image.jpg'} />;
  };
});

// Mock the useStory hook
const mockUseStory = {
  imageUrl: 'https://example.com/image.jpg',
  imageLoading: false,
  imageError: false,
  handleImageLoad: jest.fn(),
  handleImageError: jest.fn(),
  animationsEnabled: true,
};

jest.mock('../../contexts/StoryContext', () => ({
  useStory: () => mockUseStory,
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      story: storyReducer,
    },
  });
};

const renderWithRedux = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('StoryImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStory.imageUrl = 'https://example.com/image.jpg';
    mockUseStory.imageLoading = false;
    mockUseStory.imageError = false;
    mockUseStory.animationsEnabled = true;
    mockUseStory.handleImageError = jest.fn();
    mockUseStory.handleImageLoad = jest.fn();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when imageLoading is true', async () => {
      mockUseStory.imageLoading = true;

      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      const loadingSkeleton =
        screen.getByTestId('story-image').parentElement?.previousElementSibling;
      expect(loadingSkeleton).toHaveClass('animate-pulse');
    });

    it('should hide image when loading', async () => {
      mockUseStory.imageLoading = true;

      renderWithRedux(<StoryImage />);

      // The image should not be in the document when loading
      await waitFor(() => {
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when imageError is true', async () => {
      mockUseStory.imageError = true;

      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });
    });

    it('should hide image when there is an error', async () => {
      mockUseStory.imageError = true;

      renderWithRedux(<StoryImage />);

      // The image should not be in the document when there is an error
      await waitFor(() => {
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should display image when loaded successfully', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      const image = screen.getByTestId('story-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Daily story prompt');
    });

    it('should show image when not loading', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      const image = screen.getByTestId('story-image');
      expect(image).not.toHaveStyle({ display: 'none' });
    });
  });

  describe('Event Handlers', () => {
    it('should call handleImageLoad when image loads successfully', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      const image = screen.getByTestId('story-image');
      fireEvent.load(image);

      // Allow for double call in test env
      expect(mockUseStory.handleImageLoad.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('should call handleImageError when image fails to load', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      let image = screen.getByTestId('story-image');
      fireEvent.error(image); // First error triggers fallback

      // Wait for fallback image to appear
      await waitFor(() => {
        image = screen.getByTestId('story-image');
        expect(image).toHaveAttribute('src', expect.stringContaining('fallback'));
      });

      fireEvent.error(image); // Second error triggers error UI

      // Now the error UI should be rendered
      await waitFor(() => {
        expect(screen.getByText(/unable to load media/i)).toBeInTheDocument();
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to loaded', async () => {
      mockUseStory.imageLoading = true;

      const { rerender } = renderWithRedux(<StoryImage />);

      // The image should not be in the document when loading
      await waitFor(() => {
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });

      // Transition to loaded
      mockUseStory.imageLoading = false;
      rerender(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });
    });

    it('should handle transition from loading to error', async () => {
      mockUseStory.imageLoading = true;

      const { rerender } = renderWithRedux(<StoryImage />);

      // The image should not be in the document when loading
      await waitFor(() => {
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });

      // Transition to error
      mockUseStory.imageLoading = false;
      mockUseStory.imageError = true;
      rerender(<StoryImage />);

      await waitFor(() => {
        expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });

      const image = screen.getByTestId('story-image');
      expect(image).toHaveAttribute('alt', 'Daily story prompt');
    });

    it('should have proper test IDs', async () => {
      renderWithRedux(<StoryImage />);

      await waitFor(() => {
        expect(screen.getByTestId('story-image')).toBeInTheDocument();
      });
    });
  });
});
