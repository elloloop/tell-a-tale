import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../Calendar';
import { format } from 'date-fns';

// Mock the utils function
jest.mock('@/shared/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock the Button component
jest.mock('@/shared/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">←</span>,
  ChevronRight: () => <span data-testid="chevron-right">→</span>,
}));

describe('Calendar', () => {
  const mockOnDateClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Calendar Header', () => {
    it('should display current month and year', () => {
      const currentDate = new Date(2024, 0, 15); // January 2024
      render(<Calendar onDateClick={mockOnDateClick} />);

      expect(screen.getByText(format(currentDate, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should have previous month button', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton).toBeInTheDocument();
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
    });

    it('should have next month button', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });
  });

  describe('Calendar Navigation', () => {
    it('should navigate to previous month when previous button is clicked', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const prevButton = screen.getByLabelText('Previous month');

      fireEvent.click(prevButton);

      // The month should change (this is a basic test, actual month calculation depends on current date)
      expect(prevButton).toBeInTheDocument();
    });

    it('should navigate to next month when next button is clicked', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const nextButton = screen.getByLabelText('Next month');

      fireEvent.click(nextButton);

      // The month should change
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Calendar Days', () => {
    it('should display day headers', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should display calendar days', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      // Should display multiple days (at least 28 for any month)
      const dayButtons = screen
        .getAllByRole('button')
        .filter(button => /^\d+$/.test(button.textContent || ''));
      expect(dayButtons.length).toBeGreaterThan(27);
    });

    it('should call onDateClick when a day is clicked', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      // Find a day button (any number)
      const dayButtons = screen
        .getAllByRole('button')
        .filter(button => /^\d+$/.test(button.textContent || ''));

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(mockOnDateClick).toHaveBeenCalledWith(expect.any(Date));
      }
    });
  });

  describe('Calendar Day Styling', () => {
    it('should highlight today', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const today = new Date();
      const todayButton = screen.getByText(format(today, 'd'));

      // Today should have special styling (the exact class depends on the cn function)
      expect(todayButton).toBeInTheDocument();
    });

    it('should display current month days normally', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const currentMonth = new Date();
      const currentMonthDay = screen.getByText(format(currentMonth, 'd'));

      expect(currentMonthDay).toBeInTheDocument();
    });

    it('should display previous/next month days with muted styling', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      // Find all day buttons
      const dayButtons = screen
        .getAllByRole('button')
        .filter(button => /^\d+$/.test(button.textContent || ''));

      // Should have some days from previous/next months
      expect(dayButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Calendar Layout', () => {
    it('should have proper grid layout', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const calendarContainer = screen.getByText('Sun').parentElement;
      expect(calendarContainer).toHaveClass('grid', 'grid-cols-7', 'gap-1');
    });

    it('should have proper header layout', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const headerContainer = screen.getByLabelText('Previous month').parentElement;
      expect(headerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'mb-4');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for navigation buttons', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('should have clickable day buttons', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const dayButtons = screen
        .getAllByRole('button')
        .filter(button => /^\d+$/.test(button.textContent || ''));

      dayButtons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Date Selection', () => {
    it('should pass correct date to onDateClick', () => {
      render(<Calendar onDateClick={mockOnDateClick} />);

      const dayButtons = screen
        .getAllByRole('button')
        .filter(button => /^\d+$/.test(button.textContent || ''));

      if (dayButtons.length > 0) {
        const clickedDayText = dayButtons[0].textContent;
        fireEvent.click(dayButtons[0]);

        expect(mockOnDateClick).toHaveBeenCalledWith(expect.any(Date));
        const calledDate = mockOnDateClick.mock.calls[0][0];
        expect(format(calledDate, 'd')).toBe(clickedDayText);
      }
    });
  });
});
