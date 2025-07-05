import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the header with navigation links', () => {
    render(<Header />);

    // Check if the logo is present
    expect(screen.getByText('Tell A Tale')).toBeInTheDocument();

    // Check if navigation links are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Stories')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('has correct links', () => {
    render(<Header />);

    // Check if links have correct href attributes
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Stories').closest('a')).toHaveAttribute('href', '/stories');
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
  });
});
