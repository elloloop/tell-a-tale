import { render } from '@testing-library/react';
import Page from '../page';

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div>Header Component</div>;
  };
});

// Mock the StoryEditor component
jest.mock('@/components/StoryEditor', () => {
  return function MockStoryEditor() {
    return <div>StoryEditor Component</div>;
  };
});

// Mock the Footer component
jest.mock('@/components/Footer', () => {
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
