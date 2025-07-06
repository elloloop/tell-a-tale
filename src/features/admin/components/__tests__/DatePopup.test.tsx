import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePopup } from '../DatePopup';
import { format } from 'date-fns';

// Mock the Button component
jest.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('DatePopup', () => {
  const mockOnClose = jest.fn();
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the popup with correct date', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      expect(screen.getByText('Selected Date')).toBeInTheDocument();
      expect(screen.getByText(format(testDate, 'MMMM d, yyyy'))).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should display formatted date correctly', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const formattedDate = format(testDate, 'MMMM d, yyyy');
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('should render with different dates', () => {
      const differentDate = new Date(2024, 11, 25); // December 25, 2024
      render(<DatePopup date={differentDate} onClose={mockOnClose} />);

      const formattedDate = format(differentDate, 'MMMM d, yyyy');
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper overlay styling', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const overlay = screen.getByText('Selected Date').closest('.fixed');
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'bg-black/50',
        'flex',
        'items-center',
        'justify-center',
        'z-50'
      );
    });

    it('should have proper modal styling', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const modal = screen.getByText('Selected Date').parentElement;
      expect(modal).toHaveClass(
        'bg-background',
        'p-6',
        'rounded-lg',
        'shadow-lg',
        'max-w-sm',
        'w-full',
        'mx-4'
      );
    });

    it('should have proper button container styling', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const buttonContainer = screen.getByText('Close').parentElement;
      expect(buttonContainer).toHaveClass('flex', 'justify-end');
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have clickable close button', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const closeButton = screen.getByText('Close');
      expect(closeButton).toBeEnabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Selected Date');
    });

    it('should have proper button role', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveTextContent('Close');
    });
  });

  describe('Content Structure', () => {
    it('should have title, date, and close button', () => {
      render(<DatePopup date={testDate} onClose={mockOnClose} />);

      expect(screen.getByText('Selected Date')).toBeInTheDocument();
      expect(screen.getByText(format(testDate, 'MMMM d, yyyy'))).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should display date in correct format', () => {
      const testCases = [
        { date: new Date(2024, 0, 1), expected: 'January 1, 2024' },
        { date: new Date(2024, 11, 31), expected: 'December 31, 2024' },
        { date: new Date(2023, 5, 15), expected: 'June 15, 2023' },
      ];

      testCases.forEach(({ date, expected }) => {
        render(<DatePopup date={date} onClose={mockOnClose} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
      });
    });
  });
});
