import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoryState {
  story: string;
  imageUrl: string;
  isLoading: boolean;
}

const initialState: StoryState = {
  story: '',
  imageUrl: '',
  isLoading: true,
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStory: (state, action: PayloadAction<string>) => {
      state.story = action.payload;
    },
    setImageUrl: (state, action: PayloadAction<string>) => {
      state.imageUrl = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setStory, setImageUrl, setLoading } = storySlice.actions;
export default storySlice.reducer;
