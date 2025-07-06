import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaDisplay from '../MediaDisplay';

// Mock the imageService
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    isVideoUrl: jest.fn((url) => url.includes('.mp4')),
    isAnimatedUrl: jest.fn((url) => url.includes('.gif') || url.includes('.mp4')),
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
      <MediaDisplay 
        src="https://example.com/image.jpg" 
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('', { selector: '.animate-spin' })).toBeInTheDocument();
  });

  it('renders error state when hasError is true', () => {
    render(
      <MediaDisplay 
        src="https://example.com/nonexistent.jpg" 
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    // Simulate error
    const img = screen.getByRole('img', { hidden: true });
    fireEvent.error(img);

    expect(screen.getByText('Unable to load media')).toBeInTheDocument();
  });

  it('renders image for non-video URLs', () => {
    render(
      <MediaDisplay 
        src="https://example.com/image.jpg" 
        alt="Test image"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders video for video URLs', () => {
    render(
      <MediaDisplay 
        src="https://example.com/video.mp4" 
        autoplayAnimations={true}
        muteVideos={true}
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    const video = screen.getByRole('presentation'); // video element
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('loop');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MediaDisplay 
        src="https://example.com/image.jpg" 
        className="custom-class"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('calls onLoad when image loads', () => {
    render(
      <MediaDisplay 
        src="https://example.com/image.jpg" 
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    const img = screen.getByRole('img', { hidden: true });
    fireEvent.load(img);

    expect(mockOnLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError when image fails to load', () => {
    render(
      <MediaDisplay 
        src="https://example.com/nonexistent.jpg" 
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    const img = screen.getByRole('img', { hidden: true });
    fireEvent.error(img);

    expect(mockOnError).toHaveBeenCalledTimes(1);
  });

  it('tries fallback URL when main URL fails', () => {
    const { rerender } = render(
      <MediaDisplay 
        src="https://example.com/image.jpg" 
        fallbackSrc="https://example.com/fallback.jpg"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    const img = screen.getByRole('img', { hidden: true });
    fireEvent.error(img);

    // Should now try to load fallback
    expect(img).toHaveAttribute('src', 'https://example.com/fallback.jpg');
  });
});