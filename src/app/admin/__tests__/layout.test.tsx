import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminLayout from '../layout';

describe('AdminLayout', () => {
  it('should render children content', () => {
    render(
      <AdminLayout>
        <div data-testid="test-content">Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have proper container styling', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    const container = screen.getByText('Test Content').closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen', 'bg-background');
  });

  it('should have proper inner container styling', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    const innerContainer = screen.getByText('Test Content').parentElement;
    expect(innerContainer).toHaveClass('flex-grow');
  });

  it('should render multiple children', () => {
    render(
      <AdminLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </AdminLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should render complex nested content', () => {
    render(
      <AdminLayout>
        <header>
          <h1>Admin Header</h1>
        </header>
        <main>
          <section>
            <h2>Admin Section</h2>
            <p>Admin content</p>
          </section>
        </main>
        <footer>
          <p>Admin Footer</p>
        </footer>
      </AdminLayout>
    );

    expect(screen.getByText('Admin Header')).toBeInTheDocument();
    expect(screen.getByText('Admin Section')).toBeInTheDocument();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
    expect(screen.getByText('Admin Footer')).toBeInTheDocument();
  });

  it('should maintain proper DOM structure', () => {
    const { container } = render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    // Should have the main container div
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.tagName).toBe('DIV');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-background');

    // Should have the inner flex-grow div
    const innerContainer = mainContainer.firstChild as HTMLElement;
    expect(innerContainer.tagName).toBe('DIV');
    expect(innerContainer).toHaveClass('flex-grow');
  });
});
