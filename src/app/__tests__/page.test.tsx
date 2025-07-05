import { render } from '@testing-library/react';
import Page from '../(users)/page';

// Mock the Header component
jest.mock('@/shared/components/Header', () => {
  return function MockHeader() {
    return <div>Header Component</div>;
  };
});

// Mock the StoryEditor component
jest.mock('@/features/story/components/StoryEditor', () => {
  return function MockStoryEditor() {
    return <div>StoryEditor Component</div>;
  };
});

// Mock the Footer component
jest.mock('@/shared/components/Footer', () => {
  return function MockFooter() {
    return <div>Footer Component</div>;
  };
});

describe('Page Component', () => {
  it('renders the page component', () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });
});
