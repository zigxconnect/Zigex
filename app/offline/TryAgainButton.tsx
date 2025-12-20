"use client";

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function TryAgainButton() {
  return (
    <Button
      variant="secondary"
      className="h-12 px-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
      onClick={() => window.location.reload()}
    >
      <RefreshCcw className="w-5 h-5 mr-2" />
      Try Again
    </Button>
  );
}
