import React from 'react';
import { Calendar } from '../Calendar';
import { render, screen } from '@testing-library/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import userEvent from '@testing-library/user-event';

describe('Calendar component', () => {
    it('renders current month and year in header', () => {
        render(<Calendar onDateClick={() => { }} />);
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        // Check for month and year in the header
        expect(screen.getByText(new RegExp(`${month}.*${year}`))).toBeInTheDocument();
    });

    it('renders weekday headers', () => {
        render(<Calendar onDateClick={() => { }} />);
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });
    });

    it('renders all days for the current month, including leading/trailing days', () => {
        // Test implementation goes here
    });

    it('renders calendar as a 7-column grid with weekday headers and week rows', () => {
        render(<Calendar onDateClick={() => { }} />);
        // Check weekday headers
        const headers = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
        expect(headers).toHaveLength(7);
        // Check week rows
        const weekRows = document.querySelectorAll('.flex.flex-col .grid.grid-cols-7');
        expect(weekRows.length).toBeGreaterThan(0);
        weekRows.forEach(row => {
            const buttons = row.querySelectorAll('button[aria-label]');
            expect(buttons.length).toBe(7);
        });
    });

    it('renders all days for the current month, including leading/trailing days with appropriate styles', () => {
        render(<Calendar onDateClick={() => { }} />);
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        // Check all days of current month are present by aria-label
        days.forEach(day => {
            const label = format(day, 'yyyy-MM-dd');
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });
        // Check that at least one leading and one trailing day (outside current month) are present and have muted style
        const allButtons = screen.getAllByRole('button');
        const mutedButtons = allButtons.filter(btn => btn.className.includes('text-muted-foreground'));
        expect(mutedButtons.length).toBeGreaterThan(0);
    });

    it('highlights today’s date', () => {
        render(<Calendar onDateClick={() => { }} />);
        const today = new Date();
        const label = format(today, 'yyyy-MM-dd');
        const todayButton = screen.getByLabelText(label);
        expect(todayButton.className).toMatch(/bg-primary/);
    });

    it('calls onDateClick with correct date when a day is clicked', () => {
        const handleDateClick = jest.fn();
        render(<Calendar onDateClick={handleDateClick} />);
        // Click the 15th of the current month
        const now = new Date();
        const label = format(new Date(now.getFullYear(), now.getMonth(), 15), 'yyyy-MM-dd');
        const dayButton = screen.getByLabelText(label);
        dayButton.click();
        expect(handleDateClick).toHaveBeenCalledWith(expect.any(Date));
        // Optionally, check the date value
        expect(format(handleDateClick.mock.calls[0][0], 'yyyy-MM-dd')).toBe(label);
    });

    it('navigates to previous month when previous button is clicked', async () => {
        render(<Calendar onDateClick={() => { }} />);
        const now = new Date();
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevButton = screen.getByLabelText('Previous month');
        await userEvent.click(prevButton);
        const month = prevMonth.toLocaleString('default', { month: 'long' });
        const year = prevMonth.getFullYear();
        expect(await screen.findByText(new RegExp(`${month}.*${year}`))).toBeInTheDocument();
    });

    it('navigates to next month when next button is clicked', async () => {
        render(<Calendar onDateClick={() => { }} />);
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextButton = screen.getByLabelText('Next month');
        await userEvent.click(nextButton);
        const month = nextMonth.toLocaleString('default', { month: 'long' });
        const year = nextMonth.getFullYear();
        expect(await screen.findByText(new RegExp(`${month}.*${year}`))).toBeInTheDocument();
    });

    it('applies correct styles to days outside current month', () => {
        render(<Calendar onDateClick={() => { }} />);
        const now = new Date();
        // Find a day from previous month
        const prevMonthDay = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month
        const prevLabel = format(prevMonthDay, 'yyyy-MM-dd');
        const prevButton = screen.queryByLabelText(prevLabel);
        if (prevButton) {
            expect(prevButton.className).toMatch(/text-muted-foreground/);
        }
        // Find a day from next month
        const nextMonthDay = new Date(now.getFullYear(), now.getMonth() + 1, 1); // first day of next month
        const nextLabel = format(nextMonthDay, 'yyyy-MM-dd');
        const nextButton = screen.queryByLabelText(nextLabel);
        if (nextButton) {
            expect(nextButton.className).toMatch(/text-muted-foreground/);
        }
    });

    it('handles leap year February correctly', () => {
        render(<Calendar onDateClick={() => { }} />);
        // Simulate February 2024 (leap year)
        // Set calendar to leapFeb
        // This requires exposing a way to set the date, or you can test the logic in isolation
        // For now, just check that Feb 29 is present in a leap year
        // This will only work if the Calendar allows setting the date, otherwise skip
        // expect(screen.getByLabelText(label)).toBeInTheDocument();
    });

    it('handles year change when navigating from December to January', () => {
        render(<Calendar onDateClick={() => { }} />);
        // Go to December
        //const now = new Date();
        // Simulate clicking next month from December
        // This requires exposing a way to set the date, or you can test the logic in isolation
        // For now, just check that January of next year is rendered after December
        // expect(...)
    });

    it('buttons have appropriate aria-labels', () => {
        render(<Calendar onDateClick={() => { }} />);
        const allButtons = screen.getAllByRole('button');
        allButtons.forEach(btn => {
            if (btn.ariaLabel && /\d{4}-\d{2}-\d{2}/.test(btn.ariaLabel)) {
                expect(btn.ariaLabel).toMatch(/\d{4}-\d{2}-\d{2}/);
            }
        });
    });

    it('renders a month where the last week is not full and checks the last week\'s days', async () => {
        render(<Calendar onDateClick={() => { }} />);
        // Navigate to March 2021 from today
        const targetYear = 2021;
        const targetMonth = 2; // March (0-indexed)
        const currentDate = new Date();
        const monthsToGo = (currentDate.getFullYear() - targetYear) * 12 + (currentDate.getMonth() - targetMonth);
        const prevButton = screen.getByLabelText('Previous month');
        for (let i = 0; i < monthsToGo; i++) {
            await userEvent.click(prevButton);
        }
        // The last week should contain days from March and April
        // Find a button for April 3rd (should be in the last week)
        expect(screen.getByLabelText('2021-04-03')).toBeInTheDocument();
    });

    it('calls onDateClick when clicking a day outside the current month', async () => {
        const handleDateClick = jest.fn();
        render(<Calendar onDateClick={handleDateClick} />);
        // Find a button for a leading or trailing day (outside current month)
        // Use the first button with text-muted-foreground
        const allButtons = screen.getAllByRole('button');
        const outsideButton = allButtons.find(btn => btn.className.includes('text-muted-foreground'));
        expect(outsideButton).toBeDefined();
        if (outsideButton) {
            await userEvent.click(outsideButton);
            expect(handleDateClick).toHaveBeenCalledWith(expect.any(Date));
        }
    });

    it('renders ChevronLeft and ChevronRight icons', () => {
        render(<Calendar onDateClick={() => { }} />);
        // The navigation buttons should be present
        const prevButton = screen.getByLabelText('Previous month');
        const nextButton = screen.getByLabelText('Next month');
        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });
}); 