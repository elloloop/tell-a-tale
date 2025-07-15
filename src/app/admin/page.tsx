'use client';

import { useState } from 'react';
import { Calendar } from '@/features/admin/components/Calendar';
import { DatePopup } from '@/features/admin/components/DatePopup';
import { ImageUpload } from '@/features/admin/components/ImageUpload';

export default function AdminPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleClosePopup = () => {
    setSelectedDate(null);
  };

  const handleUploadComplete = (url: string) => {
    console.log('Upload completed:', url);
    // Could show a success message or update UI
  };

  return (
    <div className="p-6">
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
        <DatePopup date={selectedDate} onClose={handleClosePopup}>
          <div className="mt-6">
            <ImageUpload selectedDate={selectedDate} onUploadComplete={handleUploadComplete} />
          </div>
        </DatePopup>
      )}
    </div>
  );
}
