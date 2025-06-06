import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders the footer with copyright information', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Tell A Tale. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    
    const twitterLink = screen.getByText('Twitter');
    const githubLink = screen.getByText('GitHub');
    
    expect(twitterLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
    
    expect(twitterLink.closest('a')).toHaveAttribute('href', 'https://twitter.com');
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com');
  });
}); 