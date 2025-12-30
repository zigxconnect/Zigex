"use client";

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function TryAgainButton() {
  return (
    <Button
      variant="secondary"
      className="h-12 px-8 active:scale-95 transition-transform"
      onClick={() => window.location.reload()}
    >
      <RefreshCcw className="w-5 h-5 mr-2" />
      Try Again
    </Button>
  );
}
