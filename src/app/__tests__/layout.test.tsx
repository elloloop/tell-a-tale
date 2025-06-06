import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: jest.fn().mockReturnValue({
    className: 'mock-inter-class',
    variable: '--font-inter',
  }),
  Caveat: jest.fn().mockReturnValue({
    className: 'mock-caveat-class',
    variable: '--font-caveat',
  }),
}));

// Mock the providers component
jest.mock('../providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-providers">{children}</div>,
}));

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

// Mock the Footer component
jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

describe('RootLayout', () => {
  it('renders with proper structure and components', () => {
    const testContent = "Test Content";
    const { container } = render(<RootLayout>{testContent}</RootLayout>);
    
    // Check for HTML structure attributes
    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
    expect(html).toHaveClass('--font-inter');
    expect(html).toHaveClass('--font-caveat');
    
    // Check for components
    expect(screen.getByTestId('mock-providers')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    // Check for main content
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-grow');
    expect(main).toHaveClass('container');
    expect(main).toHaveTextContent(testContent);
  });
});
