import '@testing-library/jest-dom';

// Suppress console errors during tests to avoid false positives
// This is especially important for tests that intentionally trigger errors
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    // Suppress React error boundary warnings and expected error messages
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Error: Uncaught') ||
        args[0].includes('useStory must be used within a StoryProvider') ||
        args[0].includes('Consider adding an error boundary') ||
        args[0].includes('validateDOMNesting'))
    ) {
      return;
    }
    // For any other errors, log them normally
    console.warn(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    // Suppress expected warnings that are part of normal test behavior
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Error: Uncaught') ||
        args[0].includes('useStory must be used within a StoryProvider') ||
        args[0].includes('Consider adding an error boundary') ||
        args[0].includes('validateDOMNesting'))
    ) {
      return;
    }
    // For any other warnings, log them normally
    console.log(...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
