import { store } from "../store";
import { setStory, setImageUrl, setLoading } from "../storySlice";

describe("Redux Store", () => {
  it("should have the correct initial state", () => {
    const state = store.getState();
    expect(state.story).toBeDefined();
  });

  it("should handle story actions", () => {
    store.dispatch(setStory("Test story"));
    expect(store.getState().story.story).toBe("Test story");

    store.dispatch(setImageUrl("test-url"));
    expect(store.getState().story.imageUrl).toBe("test-url");

    store.dispatch(setLoading(false));
    expect(store.getState().story.isLoading).toBe(false);
  });
});
