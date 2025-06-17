import { render, screen, fireEvent } from '@testing-library/react';
import { DatePopup } from '../DatePopup';
import { format } from 'date-fns';

describe('DatePopup Component', () => {
  const mockDate = new Date('2024-03-15');
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected date', () => {
    render(<DatePopup date={mockDate} onClose={mockOnClose} />);
    
    expect(screen.getByText(format(mockDate, 'MMMM d, yyyy'))).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<DatePopup date={mockDate} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with correct title', () => {
    render(<DatePopup date={mockDate} onClose={mockOnClose} />);
    
    expect(screen.getByText('Selected Date')).toBeInTheDocument();
  });

  it('renders with correct styling classes', () => {
    render(<DatePopup date={mockDate} onClose={mockOnClose} />);
    
    const popup = screen.getByRole('dialog');
    expect(popup).toHaveClass('bg-background');
    expect(popup).toHaveClass('rounded-lg');
    expect(popup).toHaveClass('shadow-lg');
  });
}); 