import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from '../page';

// Mock the Calendar component
jest.mock('@/features/admin/components/Calendar', () => ({
  Calendar: ({ onDateClick }: { onDateClick: (date: Date) => void }) => (
    <div data-testid="calendar">
      <button onClick={() => onDateClick(new Date(2024, 0, 15))}>Click Date</button>
    </div>
  ),
}));

// Mock the DatePopup component
jest.mock('@/features/admin/components/DatePopup', () => ({
  DatePopup: ({ date, onClose }: { date: Date; onClose: () => void }) => (
    <div data-testid="date-popup">
      <span>Date: {date.toDateString()}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render admin dashboard title', () => {
      render(<AdminPage />);

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Admin Dashboard');
    });

    it('should render calendar view section', () => {
      render(<AdminPage />);

      expect(screen.getByText('Calendar View')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Calendar View');
    });

    it('should render calendar component', () => {
      render(<AdminPage />);

      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    it('should not render date popup initially', () => {
      render(<AdminPage />);

      expect(screen.queryByTestId('date-popup')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should show date popup when date is clicked', () => {
      render(<AdminPage />);

      const dateButton = screen.getByText('Click Date');
      fireEvent.click(dateButton);

      expect(screen.getByTestId('date-popup')).toBeInTheDocument();
      expect(screen.getByText(/Date:/)).toBeInTheDocument();
    });

    it('should hide date popup when close button is clicked', () => {
      render(<AdminPage />);

      // First, show the popup
      const dateButton = screen.getByText('Click Date');
      fireEvent.click(dateButton);

      expect(screen.getByTestId('date-popup')).toBeInTheDocument();

      // Then, close it
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('date-popup')).not.toBeInTheDocument();
    });

    it('should handle multiple date selections', () => {
      render(<AdminPage />);

      // First selection
      const dateButton = screen.getByText('Click Date');
      fireEvent.click(dateButton);

      expect(screen.getByTestId('date-popup')).toBeInTheDocument();

      // Close popup
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('date-popup')).not.toBeInTheDocument();

      // Second selection
      fireEvent.click(dateButton);

      expect(screen.getByTestId('date-popup')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper main container styling', () => {
      render(<AdminPage />);

      const mainContainer = screen.getByText('Admin Dashboard').parentElement;
      expect(mainContainer).toHaveClass('p-6');
    });

    it('should have proper header styling', () => {
      render(<AdminPage />);

      const header = screen.getByText('Admin Dashboard').parentElement;
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'mb-8');
    });

    it('should have proper title styling', () => {
      render(<AdminPage />);

      const title = screen.getByText('Admin Dashboard');
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('should have proper grid layout', () => {
      render(<AdminPage />);

      const gridContainer = screen.getByTestId('calendar').closest('.grid');
      expect(gridContainer).toHaveClass('grid', 'gap-6');
    });

    it('should have proper calendar container styling', () => {
      render(<AdminPage />);

      const calendarContainer = screen.getByTestId('calendar').parentElement;
      expect(calendarContainer).toHaveClass('rounded-lg', 'border', 'p-6');
    });

    it('should have proper section title styling', () => {
      render(<AdminPage />);

      const sectionTitle = screen.getByText('Calendar View');
      expect(sectionTitle).toHaveClass('text-xl', 'font-semibold', 'mb-4');
    });
  });

  describe('State Management', () => {
    it('should maintain selected date state', () => {
      render(<AdminPage />);

      // Initially no date selected
      expect(screen.queryByTestId('date-popup')).not.toBeInTheDocument();

      // Select a date
      const dateButton = screen.getByText('Click Date');
      fireEvent.click(dateButton);

      // Date popup should be visible
      expect(screen.getByTestId('date-popup')).toBeInTheDocument();

      // Close popup
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Date popup should be hidden
      expect(screen.queryByTestId('date-popup')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AdminPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toHaveTextContent('Admin Dashboard');
      expect(h2).toHaveTextContent('Calendar View');
    });

    it('should have interactive elements', () => {
      render(<AdminPage />);

      const dateButton = screen.getByText('Click Date');
      expect(dateButton).toBeEnabled();
    });
  });
});
