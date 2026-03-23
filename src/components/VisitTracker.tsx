'use client';

import { useEffect } from 'react';

export default function VisitTracker({ page }: { page: string }) {
  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [page]);

  return null;
}
