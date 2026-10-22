'use client';

import React, { useEffect } from 'react';
import { initGlobalTracker } from '../lib/tracker';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initGlobalTracker();
  }, []);

  return <>{children}</>;
}
