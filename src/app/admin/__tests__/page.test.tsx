import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from '../page';
import { format } from 'date-fns';

// Mock the Calendar component
jest.mock('@/components/admin/Calendar', () => ({
  Calendar: ({ onDateClick }: { onDateClick: (date: Date) => void }) => (
    <div data-testid="mock-calendar">
      <button onClick={() => onDateClick(new Date('2024-03-15'))}>Test Date</button>
    </div>
  ),
}));

// Mock the DatePopup component
jest.mock('@/components/admin/DatePopup', () => ({
  DatePopup: ({ date, onClose }: { date: Date; onClose: () => void }) => (
    <div data-testid="mock-date-popup">
      <button onClick={onClose}>Close</button>
      <div>{format(date, 'MMMM d, yyyy')}</div>
    </div>
  ),
}));

describe('AdminPage', () => {
  it('renders the admin dashboard title', () => {
    render(<AdminPage />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders the calendar view section', () => {
    render(<AdminPage />);
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });

  it('shows date popup when a date is selected', () => {
    render(<AdminPage />);
    
    // Initially, popup should not be visible
    expect(screen.queryByTestId('mock-date-popup')).not.toBeInTheDocument();
    
    // Click on a date in the calendar
    const dateButton = screen.getByText('Test Date');
    fireEvent.click(dateButton);
    
    // Popup should now be visible
    expect(screen.getByTestId('mock-date-popup')).toBeInTheDocument();
    expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
  });

  it('closes date popup when close button is clicked', () => {
    render(<AdminPage />);
    
    // Open the popup
    const dateButton = screen.getByText('Test Date');
    fireEvent.click(dateButton);
    
    // Verify popup is open
    expect(screen.getByTestId('mock-date-popup')).toBeInTheDocument();
    
    // Close the popup
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Verify popup is closed
    expect(screen.queryByTestId('mock-date-popup')).not.toBeInTheDocument();
  });
}); 