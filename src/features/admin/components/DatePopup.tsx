'use client';

import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { ReactNode } from 'react';

interface DatePopupProps {
  date: Date;
  onClose: () => void;
  children?: ReactNode;
}

export const DatePopup = ({ date, onClose, children }: DatePopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Selected Date</h3>
        <p className="text-lg mb-6">{format(date, 'MMMM d, yyyy')}</p>

        {children}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="default">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
