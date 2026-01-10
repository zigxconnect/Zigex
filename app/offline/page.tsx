import React from 'react';
import Link from 'next/link';
import { WifiOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TryAgainButton from './TryAgainButton';

export const metadata = {
  title: 'Offline | ZIGEX',
  description: 'You are currently offline. Please check your internet connection.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground relative overflow-hidden">
      {/* Mesh Gradient Background Effect */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{ backgroundImage: 'var(--gradient-mesh)' }}
      />

      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform scale-150"></div>
          <div className="relative bg-card p-8 rounded-full border border-border shadow-2xl">
            <WifiOff className="w-20 h-20 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground drop-shadow-sm">
            You're Offline
          </h1>
          <p className="text-lg text-muted-foreground">
            It seems like you've lost your connection. Don't worry, ZIGEX is still here! Please check your network and try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            asChild
            variant="primary"
            className="h-12 px-8 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </Button>

          <TryAgainButton />
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ZIGEX. Future Prospects at Your Fingertips.</p>
        </div>
      </div>
    </div>
  );
}
