"use client"

import { useState } from "react"
import { Calendar } from "@/components/admin/Calendar"
import { DatePopup } from "@/components/admin/DatePopup"

export default function AdminPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleClosePopup = () => {
    setSelectedDate(null)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
          <Calendar onDateClick={handleDateClick} />
        </div>
      </div>

      {selectedDate && (
        <DatePopup date={selectedDate} onClose={handleClosePopup} />
      )}
    </div>
  )
} 