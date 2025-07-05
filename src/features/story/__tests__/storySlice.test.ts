import storyReducer, { setStory, setImageUrl, setLoading } from '../store/storySlice';

describe('storySlice', () => {
  const initialState = {
    story: '',
    imageUrl: '',
    isLoading: true,
  };

  it('should handle initial state', () => {
    expect(storyReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setStory', () => {
    const story = 'Test story';
    const actual = storyReducer(initialState, setStory(story));
    expect(actual.story).toEqual(story);
  });

  it('should handle setImageUrl', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const actual = storyReducer(initialState, setImageUrl(imageUrl));
    expect(actual.imageUrl).toEqual(imageUrl);
  });

  it('should handle setLoading', () => {
    const actual = storyReducer(initialState, setLoading(false));
    expect(actual.isLoading).toEqual(false);
  });
});
