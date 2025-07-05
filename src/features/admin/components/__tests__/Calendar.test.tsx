import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../Calendar';
import { format, addMonths, subMonths } from 'date-fns';

describe('Calendar Component', () => {
  const mockOnDateClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the current month and year', () => {
    const today = new Date();
    render(<Calendar onDateClick={mockOnDateClick} />);

    expect(screen.getByText(format(today, 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('renders all days of the week', () => {
    render(<Calendar onDateClick={mockOnDateClick} />);

    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('navigates to next month when clicking next button', () => {
    const today = new Date();
    render(<Calendar onDateClick={mockOnDateClick} />);

    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    expect(screen.getByText(format(addMonths(today, 1), 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('navigates to previous month when clicking previous button', () => {
    const today = new Date();
    render(<Calendar onDateClick={mockOnDateClick} />);

    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);

    expect(screen.getByText(format(subMonths(today, 1), 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('calls onDateClick when a day is clicked', () => {
    render(<Calendar onDateClick={mockOnDateClick} />);

    // Click on today's date
    const today = new Date();
    const todayButton = screen.getByText(format(today, 'd'));
    fireEvent.click(todayButton);

    expect(mockOnDateClick).toHaveBeenCalled();
  });

  it("highlights today's date", () => {
    render(<Calendar onDateClick={mockOnDateClick} />);

    const today = new Date();
    const todayButton = screen.getByText(format(today, 'd'));

    expect(todayButton).toHaveClass('bg-primary');
  });

  it('displays days from previous and next months', () => {
    render(<Calendar onDateClick={mockOnDateClick} />);

    // The calendar should show a grid of days including some from previous and next months
    const allDayButtons = screen.getAllByRole('button');
    expect(allDayButtons.length).toBeGreaterThan(28); // At least 4 weeks
  });
});
