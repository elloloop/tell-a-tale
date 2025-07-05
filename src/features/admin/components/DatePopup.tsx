'use client';

import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';

interface DatePopupProps {
  date: Date;
  onClose: () => void;
}

export const DatePopup = ({ date, onClose }: DatePopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Selected Date</h3>
        <p className="text-lg mb-6">{format(date, 'MMMM d, yyyy')}</p>
        <div className="flex justify-end">
          <Button onClick={onClose} variant="default">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
