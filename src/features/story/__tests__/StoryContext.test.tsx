import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { StoryProvider, useStory } from '../contexts/StoryContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '@/features/story/store/storySlice';
import { logger } from '@/shared/lib/logger';
import { ReactNode } from 'react';

interface StoryState {
  story: string;
  imageUrl: string;
  isLoading: boolean;
}

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock the logger to verify error logging
jest.mock('@/shared/lib/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the image service module
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    getBaseUrl: jest.fn(() => 'https://picsum.photos'),
    width: 800,
    height: 400,
    getImageUrl: jest.fn(
      (date: string, region?: string, language?: string) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/${date}`
    ),
    getImageUrlWithFallback: jest.fn(
      (date: string, region?: string, language?: string) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/${date}`
    ),
    getPlaceholderImage: jest.fn(() => `https://picsum.photos/800/400?random=placeholder`),
    getFallbackImageUrl: jest.fn(
      (date: string, region?: string, language?: string) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/${date}&fallback=true`
    ),
    getMediaUrl: jest.fn(
      (date: string, region?: string, language?: string, preferVideo?: boolean) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/${date}${preferVideo ? '.mp4' : '.gif'}`
    ),
    isVideoUrl: jest.fn(() => false),
    isAnimatedUrl: jest.fn(() => false),
    getTomorrowImageUrl: jest.fn(
      (region?: string, language?: string) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/tomorrow`
    ),
    getS3ImageUrl: jest.fn((date: string) => `https://picsum.photos/800/400?date=${date}`),
    getFirebaseImageUrl: jest.fn(
      (date: string, region?: string, language?: string) =>
        `https://picsum.photos/${region || 'global'}/${language || 'en'}/${date}`
    ),
  },
}));

// Test wrapper component to access the context
function TestComponent() {
  const { story, draft, setDraft, handleSubmit, handleEdit, handleCancel } = useStory();

  return (
    <div>
      <div data-testid="story-value">{story || 'No story'}</div>
      <input data-testid="draft-input" value={draft} onChange={e => setDraft(e.target.value)} />
      <button data-testid="edit-button" onClick={handleEdit}>
        Edit
      </button>
      <button data-testid="cancel-button" onClick={handleCancel}>
        Cancel
      </button>
      <form data-testid="story-form" onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// Create a wrapper for testing
const renderWithProvider = (skipInit = false, initialState = {}) => {
  const store = configureStore({
    reducer: {
      story: storyReducer,
    },
    preloadedState: {
      story: {
        story: '',
        imageUrl: 'https://test-image.jpg',
        isLoading: false,
        ...initialState,
      },
    },
  });

  return render(
    <Provider store={store}>
      <StoryProvider skipInit={skipInit}>
        <TestComponent />
      </StoryProvider>
    </Provider>
  );
};

describe('StoryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should provide story state', () => {
    renderWithProvider(true, { story: 'Test story' });
    expect(screen.getByTestId('story-value')).toHaveTextContent('Test story');
  });

  it('should update draft when typing', () => {
    renderWithProvider(true);
    const input = screen.getByTestId('draft-input');
    fireEvent.change(input, { target: { value: 'New draft' } });
    expect(input).toHaveValue('New draft');
  });

  it('should load story from localStorage on init', async () => {
    const savedStory = 'Saved story';
    mockLocalStorage.getItem.mockReturnValue(savedStory);

    renderWithProvider(false);

    await waitFor(() => {
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todayStory');
    });
  });

  it('should save story to localStorage on submit', () => {
    renderWithProvider(true);
    const input = screen.getByTestId('draft-input');
    const form = screen.getByTestId('story-form');

    fireEvent.change(input, { target: { value: 'New story' } });
    fireEvent.submit(form);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todayStory', 'New story');
  });

  it('should handle error during story saving', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    renderWithProvider(true);
    const input = screen.getByTestId('draft-input');
    const form = screen.getByTestId('story-form');

    fireEvent.change(input, { target: { value: 'New story' } });
    fireEvent.submit(form);

    expect(logger.error).toHaveBeenCalledWith('Error saving story:', expect.any(Error));
  });

  it('should handle error during initial state loading', async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    renderWithProvider(false);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Error loading initial state:', expect.any(Error));
    });
  });

  it('should handle image loading and error states', () => {
    const { result } = renderHook(() => useStory(), {
      wrapper: ({ children }) => (
        <Provider
          store={configureStore({
            reducer: { story: storyReducer },
            preloadedState: {
              story: {
                story: '',
                imageUrl: '',
                isLoading: false,
              } as StoryState,
            },
          })}
        >
          <StoryProvider skipInit={true}>{children}</StoryProvider>
        </Provider>
      ),
    });

    // Initially loading
    expect(result.current.imageLoading).toBe(true);
    expect(result.current.imageError).toBe(false);

    // Simulate image load success
    act(() => {
      result.current.handleImageLoad();
    });
    expect(result.current.imageLoading).toBe(false);
    expect(result.current.imageError).toBe(false);

    // Simulate image error - should set loading to true for fallback
    act(() => {
      result.current.handleImageError();
    });
    expect(result.current.imageLoading).toBe(true);
    expect(result.current.imageError).toBe(false);
  });

  it('should handle edit and cancel operations', () => {
    const { result } = renderHook(() => useStory(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider
          store={configureStore({
            reducer: { story: storyReducer },
            preloadedState: {
              story: {
                story: 'Original story',
                imageUrl: '',
                isLoading: false,
              } as StoryState,
            },
          })}
        >
          <StoryProvider skipInit={true}>{children}</StoryProvider>
        </Provider>
      ),
    });

    act(() => {
      result.current.handleEdit();
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.setDraft('Modified story');
      result.current.handleCancel();
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draft).toBe('Original story');
  });

  it('should throw error when useStory is used outside provider', () => {
    expect(() => {
      renderHook(() => useStory());
    }).toThrow('useStory must be used within a StoryProvider');
  });

  it('should handle empty story in handleCancel', () => {
    const { result } = renderHook(() => useStory(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider
          store={configureStore({
            reducer: { story: storyReducer },
            preloadedState: {
              story: {
                story: '',
                imageUrl: '',
                isLoading: false,
              } as StoryState,
            },
          })}
        >
          <StoryProvider skipInit={true}>{children}</StoryProvider>
        </Provider>
      ),
    });

    act(() => {
      result.current.setDraft('Some draft');
      result.current.handleCancel();
    });

    expect(result.current.draft).toBe('');
  });

  it('should handle image loading states correctly', () => {
    const { result } = renderHook(() => useStory(), {
      wrapper: ({ children }) => (
        <Provider
          store={configureStore({
            reducer: { story: storyReducer },
            preloadedState: {
              story: {
                story: 'Test story',
                imageUrl: 'https://example.com/image.jpg',
                isLoading: false,
              },
            },
          })}
        >
          <StoryProvider skipInit={true}>{children}</StoryProvider>
        </Provider>
      ),
    });

    // Initially not loading
    expect(result.current.imageLoading).toBe(true);
    expect(result.current.imageError).toBe(false);

    // Simulate image load success
    act(() => {
      result.current.handleImageLoad();
    });
    expect(result.current.imageLoading).toBe(false);
    expect(result.current.imageError).toBe(false);

    // Simulate image error - should set loading to true for fallback
    act(() => {
      result.current.handleImageError();
    });
    expect(result.current.imageLoading).toBe(true);
    expect(result.current.imageError).toBe(false);
  });

  it('should handle edit mode transitions', () => {
    const { result } = renderHook(() => useStory(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider
          store={configureStore({
            reducer: { story: storyReducer },
            preloadedState: {
              story: {
                story: 'Original story',
                imageUrl: '',
                isLoading: false,
              } as StoryState,
            },
          })}
        >
          <StoryProvider skipInit={true}>{children}</StoryProvider>
        </Provider>
      ),
    });

    // Initial state
    expect(result.current.isEditing).toBe(false);

    // Enter edit mode
    act(() => {
      result.current.handleEdit();
    });
    expect(result.current.isEditing).toBe(true);

    // Exit edit mode
    act(() => {
      result.current.handleCancel();
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draft).toBe('Original story');
  });
});
