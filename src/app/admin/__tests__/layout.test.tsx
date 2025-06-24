import React from 'react';
import { render } from '@testing-library/react';
import AdminLayout from '../layout';

describe('AdminLayout', () => {
  it('renders with proper structure', () => {
    const testContent = "Test Content";
    const { container } = render(<AdminLayout>{testContent}</AdminLayout>);
    
    // Check for background class
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('bg-background');
    
    // Check for content
    expect(container).toHaveTextContent(testContent);
  });
}); 