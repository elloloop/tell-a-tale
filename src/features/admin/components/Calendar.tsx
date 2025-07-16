'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import dynamic from 'next/dynamic';
const ChevronLeft = dynamic(() => import('lucide-react').then(mod => mod.ChevronLeft), { ssr: false });
const ChevronRight = dynamic(() => import('lucide-react').then(mod => mod.ChevronRight), { ssr: false });

interface CalendarProps {
  onDateClick: (date: Date) => void;
}

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

const CalendarDay = ({ date, isCurrentMonth, isToday, onClick }: CalendarDayProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={format(date, 'yyyy-MM-dd')}
      className={cn(
        'h-10 w-10 rounded-full transition-colors hover:bg-accent hover:text-accent-foreground',
        !isCurrentMonth && 'text-muted-foreground',
        isToday && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      {format(date, 'd')}
    </button>
  );
};

export const Calendar = ({ onDateClick }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get the start of the week for the first day of the month
  const startDate = startOfWeek(monthStart);
  // Get the end of the week for the last day of the month
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group days into weeks
  const weeks: Date[][] = [];
  let week: Date[] = [];
  days.forEach(day => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {week.map(day => (
              <CalendarDay
                key={day.toISOString()}
                date={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                onClick={() => onDateClick(day)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
