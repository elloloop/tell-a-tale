import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '../../store/storySlice';
import StoryImage from '../StoryImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    onLoad,
    onError,
    style,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    onLoad?: () => void;
    onError?: () => void;
    style?: React.CSSProperties;
  }) {
    return <img src={src} alt={alt} onLoad={onLoad} onError={onError} style={style} {...props} />;
  };
});

// Mock the context hook
const mockUseStory = {
  imageUrl: 'https://example.com/image.jpg',
  imageLoading: false,
  imageError: false,
  handleImageLoad: jest.fn(),
  handleImageError: jest.fn(),
};

jest.mock('../../contexts/StoryContext', () => ({
  ...jest.requireActual('../../contexts/StoryContext'),
  useStory: () => mockUseStory,
}));

const mockStore = configureStore({
  reducer: {
    story: storyReducer,
  },
});

describe('StoryImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default state
    Object.assign(mockUseStory, {
      imageUrl: 'https://example.com/image.jpg',
      imageLoading: false,
      imageError: false,
      handleImageLoad: jest.fn(),
      handleImageError: jest.fn(),
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseStory.imageLoading = true;
    });

    it('should display loading skeleton when imageLoading is true', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const loadingSkeleton =
        screen.getByTestId('story-image').parentElement?.previousElementSibling;
      expect(loadingSkeleton).toHaveClass('animate-pulse');
    });

    it('should hide image when loading', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      expect(image).toHaveStyle({ display: 'none' });
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockUseStory.imageError = true;
    });

    it('should display error message when imageError is true', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
    });

    it('should have proper error styling', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const errorContainer = screen.getByText('Failed to load image').parentElement;
      expect(errorContainer).toHaveClass(
        'w-full',
        'h-64',
        'bg-gray-100',
        'flex',
        'items-center',
        'justify-center',
        'rounded-lg'
      );
    });
  });

  describe('Success State', () => {
    it('should display image when loaded successfully', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Image of the day');
    });

    it('should show image when not loading', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      expect(image).not.toHaveStyle({ display: 'none' });
    });
  });

  describe('Event Handlers', () => {
    it('should call handleImageLoad when image loads successfully', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      fireEvent.load(image);

      expect(mockUseStory.handleImageLoad).toHaveBeenCalledTimes(1);
    });

    it('should call handleImageError when image fails to load', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      fireEvent.error(image);

      expect(mockUseStory.handleImageError).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to loaded', () => {
      // Start with loading
      mockUseStory.imageLoading = true;
      const { rerender } = render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      let image = screen.getByTestId('story-image');
      expect(image).toHaveStyle({ display: 'none' });

      // Transition to loaded
      mockUseStory.imageLoading = false;
      rerender(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      image = screen.getByTestId('story-image');
      expect(image).not.toHaveStyle({ display: 'none' });
    });

    it('should handle transition from loading to error', () => {
      // Start with loading
      mockUseStory.imageLoading = true;
      const { rerender } = render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      expect(screen.getByTestId('story-image')).toHaveStyle({ display: 'none' });

      // Transition to error
      mockUseStory.imageLoading = false;
      mockUseStory.imageError = true;
      rerender(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      expect(screen.queryByTestId('story-image')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      const image = screen.getByTestId('story-image');
      expect(image).toHaveAttribute('alt', 'Image of the day');
    });

    it('should have proper test IDs', () => {
      render(
        <Provider store={mockStore}>
          <StoryImage />
        </Provider>
      );

      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });
  });
});
