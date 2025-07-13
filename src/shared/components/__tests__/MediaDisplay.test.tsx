import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaDisplay from '../MediaDisplay';

// Mock the imageService
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    isVideoUrl: jest.fn(url => url.includes('.mp4')),
    isAnimatedUrl: jest.fn(url => url.includes('.gif') || url.includes('.mp4')),
  },
}));

describe('MediaDisplay', () => {
  const mockOnLoad = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <MediaDisplay src="https://example.com/image.jpg" onLoad={mockOnLoad} onError={mockOnError} />
    );

    expect(screen.getByText('', { selector: '.animate-spin' })).toBeInTheDocument();
  });

  it('renders error state when hasError is true', async () => {
    render(
      <MediaDisplay
        src="https://example.com/nonexistent.jpg"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    // Wait for test environment auto-loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    // Simulate error
    const img = screen.getByTestId('story-image');
    fireEvent.error(img);

    expect(screen.getByText('Unable to load media')).toBeInTheDocument();
  });

  it('renders image for non-video URLs', async () => {
    render(
      <MediaDisplay
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    const img = screen.getByTestId('story-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders video for video URLs', async () => {
    render(
      <MediaDisplay
        src="https://example.com/video.mp4"
        autoplayAnimations={true}
        muteVideos={true}
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    const video = screen.getByTestId('story-image');
    expect(video).toBeInTheDocument();
    // Check <source> src instead of video src
    const source = video.querySelector('source');
    expect(source).toHaveAttribute('src', 'https://example.com/video.mp4');
    expect(video).toHaveAttribute('autoplay');
    // Use property for muted
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(video).toHaveAttribute('loop');
  });

  it('applies custom className', async () => {
    const { container } = render(
      <MediaDisplay
        src="https://example.com/image.jpg"
        className="custom-class"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('calls onLoad when image loads', async () => {
    render(
      <MediaDisplay src="https://example.com/image.jpg" onLoad={mockOnLoad} onError={mockOnError} />
    );

    await waitFor(() => {
      expect(mockOnLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onError when image fails to load', async () => {
    render(
      <MediaDisplay
        src="https://example.com/nonexistent.jpg"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    const img = screen.getByTestId('story-image');
    fireEvent.error(img);

    expect(mockOnError).toHaveBeenCalledTimes(1);
  });

  it('tries fallback URL when main URL fails', async () => {
    render(
      <MediaDisplay
        src="https://example.com/image.jpg"
        fallbackSrc="https://example.com/fallback.jpg"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('story-image')).toBeInTheDocument();
    });

    let img = screen.getByTestId('story-image');
    fireEvent.error(img);

    // Re-query the image after error triggers fallback
    await waitFor(() => {
      img = screen.getByTestId('story-image');
      expect(img).toHaveAttribute('src', 'https://example.com/fallback.jpg');
    });
  });
});
