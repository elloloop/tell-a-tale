import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnimationToggle from '../AnimationToggle';

// Mock useStory context
const setAnimationsEnabled = jest.fn();

jest.mock('@/features/story/contexts/StoryContext', () => ({
  useStory: () => ({
    animationsEnabled: mockAnimationsEnabled,
    setAnimationsEnabled,
  }),
}));

let mockAnimationsEnabled = true;

describe('AnimationToggle', () => {
  beforeEach(() => {
    setAnimationsEnabled.mockClear();
  });

  it('renders with animations enabled', () => {
    mockAnimationsEnabled = true;
    render(<AnimationToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('🎬');
    expect(screen.getByRole('button')).toHaveTextContent('Animations');
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Disable animations');
  });

  it('renders with animations disabled', () => {
    mockAnimationsEnabled = false;
    render(<AnimationToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('🖼️');
    expect(screen.getByRole('button')).toHaveTextContent('Static');
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Enable animations');
  });

  it('calls setAnimationsEnabled with toggled value when clicked (enabled)', () => {
    mockAnimationsEnabled = true;
    render(<AnimationToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(setAnimationsEnabled).toHaveBeenCalledWith(false);
  });

  it('calls setAnimationsEnabled with toggled value when clicked (disabled)', () => {
    mockAnimationsEnabled = false;
    render(<AnimationToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(setAnimationsEnabled).toHaveBeenCalledWith(true);
  });

  it('is accessible by role and label', () => {
    mockAnimationsEnabled = true;
    render(<AnimationToggle />);
    const button = screen.getByRole('button', { name: /animations/i });
    expect(button).toBeInTheDocument();
  });
});
