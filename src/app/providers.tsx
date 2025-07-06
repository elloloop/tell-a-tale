'use client';
import { Provider } from 'react-redux';
import { store } from '@/shared/store/store';
import { useEffect } from 'react';
import { registerServiceWorker } from '@/shared/lib/serviceWorker';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for offline caching
    registerServiceWorker({
      onSuccess: () => {
        console.log('Service worker registered successfully');
      },
      onUpdate: () => {
        console.log('New service worker version available');
        // Could show a notification to the user about update
      },
      onError: (error) => {
        console.error('Service worker registration failed:', error);
      },
    });
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
