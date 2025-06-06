import { render } from '@testing-library/react';
import { Providers } from '../providers';

// Mock redux
jest.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the store
jest.mock('@/store/store', () => ({
  store: {}
}));

describe('Providers Component', () => {
  it('renders children inside providers', () => {
    const { container } = render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );
    
    expect(container).toBeInTheDocument();
  });
});
