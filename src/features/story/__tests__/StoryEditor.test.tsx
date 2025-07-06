import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '@/features/story/store/storySlice';
import StoryEditor from '@/features/story/components/StoryEditor';
import { logger } from '@/shared/lib/logger';

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

// Mock the Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'> & { src?: string; fill?: boolean }) => {
    // Remove fill prop as it's not valid for standard img tags
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, ...validProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...validProps} src={props.src || 'https://test-image.jpg'} />;
  },
}));

// Mock the imageServiceConfig
jest.mock('@/shared/config/imageService', () => ({
  imageServiceConfig: {
    getImageUrl: jest.fn().mockImplementation(date => `https://picsum.photos/800/400?date=${date}`),
    getBaseUrl: jest.fn().mockReturnValue('https://picsum.photos'),
    getS3ImageUrl: jest.fn().mockImplementation(date => `https://picsum.photos/800/400?date=${date}`),
    getFallbackImageUrl: jest.fn().mockImplementation(date => `https://picsum.photos/800/400?date=${date}&fallback=true`),
  },
}));

// Test wrapper component
const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  // Ensure imageUrl is always present in initialState to prevent Next.js Image warnings
  const today = new Date().toISOString().split('T')[0];
  const defaultImageUrl = `https://picsum.photos/800/400?date=${today}`;

  // Create a fresh store for each test to prevent state bleeding
  const store = configureStore({
    reducer: {
      story: storyReducer,
    },
    preloadedState: {
      story: {
        story: '',
        imageUrl: defaultImageUrl,
        isLoading: false,
        ...initialState,
      },
    },
  });

  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('StoryEditor Integration', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  // Reset document body after each test to prevent state bleeding between tests
  afterEach(() => {
    // Clean up any mounted components
    cleanup();
  });

  it('should render loading state when isLoading is true', () => {
    const { container } = renderWithRedux(<StoryEditor skipInit={true} />, {
      isLoading: true,
      story: '',
      imageUrl: '',
    });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.getByTestId('loading-text')).toBeInTheDocument();
  });

  it('should render the image when provided', () => {
    const today = new Date().toISOString().split('T')[0];
    renderWithRedux(<StoryEditor skipInit={true} />);

    const image = screen.getByTestId('story-image');
    expect(image).toBeInTheDocument();
    // We're using a mock for Next.js Image, so just check if the URL is present
    expect(image.getAttribute('src')).toContain(`https://picsum.photos/800/400?date=${today}`);
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
      story: mockStory,
    });
    expect(screen.getByText(mockStory)).toBeInTheDocument();
  });

  // Use separate describe blocks for tests that may affect each other
  describe('Form interactions', () => {
    beforeEach(() => {
      // Ensure each test starts with a clean state
      jest.clearAllMocks();
    });

    it('should allow saving a new story', async () => {
      const user = userEvent.setup();
      const newStory = 'New test story';

      // Mock implementation for localStorage
      mockLocalStorage.setItem = jest.fn();

      renderWithRedux(<StoryEditor skipInit={true} />);

      // Get the textarea and type a new story
      const textarea = screen.getByTestId('story-textarea');
      await user.clear(textarea);
      await user.type(textarea, newStory);

      // Find and click the save button
      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      // Verify the story was saved to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todayStory', newStory);
    });

    it('should handle errors when saving', async () => {
      const user = userEvent.setup();
      const newStory = 'New test story';

      // Mock implementation to throw an error
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      renderWithRedux(<StoryEditor skipInit={true} />);

      // Get the textarea and type a new story
      const textarea = screen.getByTestId('story-textarea');
      await user.clear(textarea);
      await user.type(textarea, newStory);

      // Find and click the save button
      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });

    it('should load story from localStorage on initialization', async () => {
      const savedStory = 'Previously saved story';
      mockLocalStorage.getItem.mockReturnValue(savedStory);

      // Force a clean render - need to re-render to ensure the localStorage mock is called
      cleanup();

      renderWithRedux(<StoryEditor />, { isLoading: false });

      // Check if the story from localStorage appears
      await waitFor(() => {
        expect(screen.getByTestId('story-content')).toHaveTextContent(savedStory);
      });
    });
  });

  // Group editing-related tests in a separate describe block for better isolation
  describe('Story editing', () => {
    beforeEach(() => {
      // Ensure each test starts with a clean state
      jest.clearAllMocks();
      cleanup();
      mockLocalStorage.clear();
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockClear();
    });

    it('should allow editing an existing story', async () => {
      const user = userEvent.setup();
      const existingStory = 'Existing story';

      // Mock implementation for localStorage
      mockLocalStorage.setItem = jest.fn();

      // Explicitly setting skipInit to true to prevent any localStorage access during initialization
      const { store } = renderWithRedux(<StoryEditor skipInit={true} />, {
        story: existingStory,
      });

      // Initially, we should see the story content
      expect(screen.getByTestId('story-content')).toHaveTextContent(existingStory);

      // Click the edit button
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      // Now we should see a textarea with the story content
      const textarea = screen.getByTestId('story-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(existingStory);

      // Change the content
      const updatedStory = 'Updated story';
      await user.clear(textarea);
      await user.type(textarea, updatedStory);

      // Save the changes
      const saveButton = screen.getByTestId('save-button');
      await user.click(saveButton);

      // Verify that the story was updated in Redux and localStorage
      expect(store.getState().story.story).toBe(updatedStory);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todayStory', updatedStory);
    });

    it('should cancel editing and revert to original story', async () => {
      const user = userEvent.setup();
      const existingStory = 'Original story';

      renderWithRedux(<StoryEditor skipInit={true} />, {
        story: existingStory,
      });

      // Click the edit button
      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      // Change the content
      const textarea = screen.getByTestId('story-textarea');
      await user.clear(textarea);
      await user.type(textarea, 'Changed story');

      // Click cancel
      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      // Verify we're back to showing the original story
      expect(screen.getByTestId('story-content')).toHaveTextContent(existingStory);
    });
  });

  describe('Image handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      cleanup();
    });

    it('should show loading state while image is loading', () => {
      renderWithRedux(<StoryEditor skipInit={true} />);
      const image = screen.getByTestId('story-image');
      expect(image).toHaveStyle({ display: 'none' });
    });

    it('should show error state when image fails to load', () => {
      renderWithRedux(<StoryEditor skipInit={true} />);
      const image = screen.getByTestId('story-image');
      fireEvent.error(image);
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });

    it('should show image when loaded successfully', () => {
      renderWithRedux(<StoryEditor skipInit={true} />);
      const image = screen.getByTestId('story-image');
      fireEvent.load(image);
      expect(image).toHaveStyle({ display: 'block' });
    });
  });

  describe('Component rendering', () => {
    it('should apply custom className when provided', () => {
      const customClass = 'custom-class';
      renderWithRedux(<StoryEditor className={customClass} skipInit={true} />);
      const editor = screen.getByTestId('story-editor');
      expect(editor).toHaveClass(customClass);
    });

    it('should not show cancel button when not in edit mode', () => {
      renderWithRedux(<StoryEditor skipInit={true} />);
      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
    });

    it('should show cancel button when in edit mode', async () => {
      const user = userEvent.setup();
      renderWithRedux(<StoryEditor skipInit={true} />, {
        story: 'Existing story',
      });

      const editButton = screen.getByTestId('edit-button');
      await user.click(editButton);

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });
  });
});
