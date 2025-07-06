'use client';

import { useStory } from '@/features/story/contexts/StoryContext';

export default function StoryContent() {
  const { story, isEditing, draft, setDraft, handleSubmit, handleEdit, handleCancel } = useStory();

  if (story && !isEditing) {
    return (
      <div className="mt-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-800" data-testid="story-content">
            {story}
          </p>
        </div>
        <button
          onClick={handleEdit}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          data-testid="edit-button"
        >
          Edit Story
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Write your story..."
        className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
        data-testid="story-textarea"
      />
      <div className="flex space-x-2 mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          data-testid="save-button"
        >
          Save Story
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
