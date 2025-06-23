"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  onDateClick: (date: Date) => void
}

interface CalendarDayProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}

const CalendarDay = ({ date, isCurrentMonth, isToday, onClick }: CalendarDayProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 w-10 rounded-full transition-colors hover:bg-accent hover:text-accent-foreground",
        !isCurrentMonth && "text-muted-foreground",
        isToday && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {format(date, "d")}
    </button>
  )
}

export const Calendar = ({ onDateClick }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get the start of the week for the first day of the month
  const startDate = startOfWeek(monthStart)
  // Get the end of the week for the last day of the month
  const endDate = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

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
        <h3 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isToday(day)}
            onClick={() => onDateClick(day)}
          />
        ))}
      </div>
    </div>
  )
} 