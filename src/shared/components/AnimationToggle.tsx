'use client';

import { useStory } from '@/features/story/contexts/StoryContext';

export default function AnimationToggle() {
  const { animationsEnabled, setAnimationsEnabled } = useStory();

  return (
    <button
      onClick={() => setAnimationsEnabled(!animationsEnabled)}
      className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      title={`${animationsEnabled ? 'Disable' : 'Enable'} animations`}
    >
      <span>{animationsEnabled ? '🎬' : '🖼️'}</span>
      <span className="hidden sm:inline">
        {animationsEnabled ? 'Animations' : 'Static'}
      </span>
    </button>
  );
}