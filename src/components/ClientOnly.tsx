"use client";

import { useState, useEffect, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: () => ReactNode; // Changed to a function to defer execution
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children()}</>;
}
