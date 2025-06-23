import React from 'react';
import { render, screen } from '@testing-library/react';
import UsersLayout from '../layout';

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

describe('UsersLayout', () => {
  it('renders with proper structure and components', () => {
    const testContent = "Test Content";
    const { container } = render(<UsersLayout>{testContent}</UsersLayout>);
    
    // Check for Header
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    
    // Check for Footer
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    // Check for main content
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-grow');
    expect(main).toHaveClass('container');
    expect(main).toHaveTextContent(testContent);
  });
}); 