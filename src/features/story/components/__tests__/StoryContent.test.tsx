import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import storyReducer from '../../store/storySlice';
import StoryContent from '../StoryContent';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock the image service
jest.mock('@/shared/config/imageService', () => ({
  getImageOfTheDay: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}));

// Mock the context hook
const mockUseStory = {
  story: 'Original story',
  isEditing: false,
  draft: '',
  setDraft: jest.fn(),
  handleSubmit: jest.fn(),
  handleEdit: jest.fn(),
  handleCancel: jest.fn(),
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

describe('StoryContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default state
    Object.assign(mockUseStory, {
      story: 'Original story',
      isEditing: false,
      draft: '',
      setDraft: jest.fn(),
      handleSubmit: jest.fn(),
      handleEdit: jest.fn(),
      handleCancel: jest.fn(),
    });
  });

  describe('Story Display Mode', () => {
    it('should display story content when not editing', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-content')).toBeInTheDocument();
      expect(screen.getByText('Original story')).toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    it('should call handleEdit when edit button is clicked', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);

      expect(mockUseStory.handleEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Story Editing Mode', () => {
    const mockDraft = 'Edited story content';

    beforeEach(() => {
      mockUseStory.isEditing = true;
      mockUseStory.draft = mockDraft;
    });

    it('should display textarea when editing', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-textarea')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockDraft)).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    it('should call setDraft when textarea changes', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      const textarea = screen.getByTestId('story-textarea');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(mockUseStory.setDraft).toHaveBeenCalledWith('New content');
    });

    it('should call handleSubmit when form is submitted', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      const form = screen.getByTestId('story-textarea').closest('form');
      fireEvent.submit(form!);

      expect(mockUseStory.handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call handleCancel when cancel button is clicked', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(mockUseStory.handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('New Story Creation', () => {
    beforeEach(() => {
      mockUseStory.story = '';
      mockUseStory.isEditing = false;
      mockUseStory.draft = '';
    });

    it('should display empty textarea for new story', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-textarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Write your story...')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      // Cancel button only shows when isEditing is true
      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
    });

    it('should show cancel button when editing new story', () => {
      mockUseStory.isEditing = true;

      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs when displaying', () => {
      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-content')).toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    it('should have proper test IDs when editing', () => {
      mockUseStory.isEditing = true;
      mockUseStory.draft = 'Test story';

      render(
        <Provider store={mockStore}>
          <StoryContent />
        </Provider>
      );

      expect(screen.getByTestId('story-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });
  });
});
