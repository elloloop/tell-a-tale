import { fireEvent, act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '@/store/storySlice';
import StoryEditor from '@/components/StoryEditor';
import { logger } from '@/lib/logger';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock the logger to verify error logging
jest.mock('@/lib/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the imageServiceConfig
jest.mock('@/config/imageService', () => ({
  imageServiceConfig: {
    getImageUrl: jest.fn().mockImplementation((date) => `https://picsum.photos/800/400?date=${date}`),
  },
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      story: storyReducer,
    },
    preloadedState: {
      story: {
        story: '',
        imageUrl: '',
        isLoading: true,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('StoryEditor Integration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render loading state when isLoading is true', () => {
    const { container } = renderWithRedux(<StoryEditor skipInit={true}/>, { 
      isLoading: true,
      story: '',
      imageUrl: ''
    });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    
    expect(screen.getByTestId('loading-text')).toBeInTheDocument();
  });

  it('should transition from loading to loaded state', async () => {
    const { container, store } = renderWithRedux(<StoryEditor skipInit />, {
      isLoading: true,
      story: '',
      imageUrl: '',
    });
  
    // drop loading flag
    await act(async () => {
      store.dispatch({ type: 'story/setLoading', payload: false });
    });
  
    // fake image load so the placeholder disappears
    fireEvent.load(screen.getByTestId('story-image'));
  
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-text')).not.toBeInTheDocument();
    });
  });
  

  it('should render image of the day', async () => {
    const today = new Date().toISOString().split('T')[0];
    renderWithRedux(<StoryEditor />, { 
      isLoading: false, 
      imageUrl: `https://picsum.photos/800/400?date=${today}` 
    });
    const image = screen.getByTestId('story-image');
    expect(image).toBeInTheDocument();
    // Next.js Image component transforms the URL, so we just check that it contains our expected URL
    expect(image.getAttribute('src')).toContain(encodeURIComponent(`https://picsum.photos/800/400?date=${today}`));
  });

  it('should show text input when no story exists', () => {
    renderWithRedux(<StoryEditor />, { isLoading: false });
    const textArea = screen.getByPlaceholderText(/write your story/i);
    expect(textArea).toBeInTheDocument();
  });

  it('should show story as postcard when story exists', () => {
    const mockStory = 'This is a test story';
    renderWithRedux(<StoryEditor />, { 
      isLoading: false, 
      story: mockStory 
    });
    expect(screen.getByText(mockStory)).toBeInTheDocument();
  });

  it('should save story to localStorage when submitted', async () => {
    const user = userEvent.setup();
    const { store } = renderWithRedux(<StoryEditor />, { isLoading: false });
  
    const textArea = screen.getByPlaceholderText(/write your story/i);
    const submitButton = screen.getByRole('button', { name: /save/i });
  
    // Type story using user-event
    await user.clear(textArea);
    await user.type(textArea, 'New story');
  
    // Ensure textarea reflects input
    expect(textArea).toHaveValue('New story');
  
    // Submit the form
    await user.click(submitButton);
  
    // Redux state should now be updated
    await waitFor(() => {
      expect(store.getState().story.story).toBe('New story');
    });
  
    // Verify localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todayStory', 'New story');
  });
  
  it('should load story from localStorage on mount', async () => {
    const savedStory = 'Saved story';
    mockLocalStorage.getItem.mockReturnValue(savedStory);

    renderWithRedux(<StoryEditor />, { isLoading: false });

    await waitFor(() => {
      expect(screen.getByText(savedStory)).toBeInTheDocument();
    });
  });

  it('should allow editing an existing story', async () => {
    const user = userEvent.setup();
    const existingStory = 'Existing story';
    const { store } = renderWithRedux(<StoryEditor />, { 
      isLoading: false, 
      story: existingStory 
    });

    // Initially story should be displayed in view mode
    expect(screen.getByTestId('story-content')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    
    // Click edit button
    await user.click(screen.getByTestId('edit-button'));
    
    // Should now be in edit mode with the existing story in the textarea
    const textarea = screen.getByTestId('story-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(existingStory);
    
    // Edit the story
    await user.clear(textarea);
    await user.type(textarea, 'Updated story');
    
    // Submit the changes
    await user.click(screen.getByTestId('save-button'));
    
    // Should go back to view mode with updated story
    await waitFor(() => {
      expect(screen.getByTestId('story-content')).toHaveTextContent('Updated story');
    });
    
    // Redux state should be updated
    expect(store.getState().story.story).toBe('Updated story');
    
    // LocalStorage should be updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todayStory', 'Updated story');
  });

  it('should cancel editing and revert to original story', async () => {
    const user = userEvent.setup();
    const existingStory = 'Original story';
    const { store } = renderWithRedux(<StoryEditor />, { 
      isLoading: false, 
      story: existingStory 
    });

    // Enter edit mode
    await user.click(screen.getByTestId('edit-button'));
    
    // Edit the story
    const textarea = screen.getByTestId('story-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'Changed but not saved');
    
    // Cancel the edit
    await user.click(screen.getByTestId('cancel-button'));
    
    // Should return to view mode with original story
    expect(screen.getByTestId('story-content')).toHaveTextContent('Original story');
    
    // Redux state should remain unchanged
    expect(store.getState().story.story).toBe(existingStory);
    
    // LocalStorage should not be called
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('todayStory', 'Changed but not saved');
  });

  it('should handle image errors', async () => {
    // Mock console.error to prevent Next.js Image warnings in tests
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // For the image error test, we'll test the error state directly instead of using an invalid URL
    // since Next.js Image component validates URLs
    renderWithRedux(<StoryEditor />, { 
      isLoading: false,
      imageUrl: 'https://example.com/valid-looking-but-will-fail.jpg'
    });
    
    // Trigger the error on the image component which has the onError handler attached
    const image = screen.getByTestId('story-image');
    fireEvent.error(image); // This will trigger the error handler on the image
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should handle error during initial state loading', async () => {
    // Mock the localStorage to throw an error
    const originalGetItem = mockLocalStorage.getItem;
    mockLocalStorage.getItem = jest.fn().mockImplementation(() => {
      throw new Error('LocalStorage error');
    });

    const { store } = renderWithRedux(<StoryEditor />, {
      isLoading: true,
    });

    // Verify logger.error was called with the error
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Error loading initial state:',
        expect.any(Error)
      );
    });

    // Verify loading state is set to false even when error occurs
    expect(store.getState().story.isLoading).toBe(false);

    // Restore original localStorage
    mockLocalStorage.getItem = originalGetItem;
  });

  it('should handle error during story saving', async () => {
    const user = userEvent.setup();
    
    // Mock localStorage.setItem to throw an error
    mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
      throw new Error('LocalStorage setItem error');
    });
    
    renderWithRedux(<StoryEditor />, { isLoading: false });
    
    const textArea = screen.getByPlaceholderText(/write your story/i);
    const submitButton = screen.getByRole('button', { name: /save/i });
    
    // Type story
    await user.clear(textArea);
    await user.type(textArea, 'New story that will fail to save');
    
    // Submit the form which will trigger error
    await user.click(submitButton);
    
    // Verify logger.error was called with the error
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Error saving story:',
        expect.any(Error)
      );
    });
  });
});