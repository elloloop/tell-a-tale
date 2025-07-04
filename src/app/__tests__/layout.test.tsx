import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// ---- mocks -------------------------------------------------------------

jest.mock('next/font/google', () => ({
  Inter: jest.fn().mockReturnValue({ className: 'mock-inter', variable: '--font-inter' }),
  Caveat: jest.fn().mockReturnValue({ className: 'mock-caveat', variable: '--font-caveat' }),
}));

jest.mock('../providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-providers">{children}</div>
  ),
}));

// ---- silence expected console noise ------------------------------------

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('validateDOMNesting') ||
        args[0].includes('The above error occurred in the') ||
        args[0].includes('Warning: Failed prop type'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// ---- tests -------------------------------------------------------------

describe('RootLayout', () => {
  const testContent = 'Test Content';

  it('renders children through Providers', () => {
    render(
      <div id="test-container">
        <RootLayout>{testContent}</RootLayout>
      </div>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByTestId('mock-providers')).toBeInTheDocument();
  });

  it('adds font variables to <html>', () => {
    const { container } = render(
      <div id="test-container">
        <RootLayout>{testContent}</RootLayout>
      </div>
    );

    const html = container.querySelector('html');
    expect(html).toBeInTheDocument();
    expect(html?.className).toContain('--font-inter');
    expect(html?.className).toContain('--font-caveat');
  });

  it('renders <main> with expected layout classes', () => {
    const { container } = render(
      <div id="test-container">
        <RootLayout>{testContent}</RootLayout>
      </div>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain('flex-grow');
    expect(main?.className).toContain('container');
    expect(main?.className).toContain('mx-auto');
  });

  it('renders body-like wrapper with layout classes', () => {
    const { container } = render(
      <div id="test-container">
        <RootLayout>{testContent}</RootLayout>
      </div>
    );

    // Try selecting <body> directly (works only if RootLayout includes it)
    const realBody = container.querySelector('body');
    if (realBody) {
      expect(realBody.className).toContain('min-h-screen');
      expect(realBody.className).toContain('flex');
      expect(realBody.className).toContain('flex-col');
    } else {
      // Fallback: get grandparent of mocked Providers
      const fallback = screen.getByTestId('mock-providers')?.parentElement?.parentElement;
      expect(fallback?.className).toContain('min-h-screen');
      expect(fallback?.className).toContain('flex');
      expect(fallback?.className).toContain('flex-col');
    }
  });
});
