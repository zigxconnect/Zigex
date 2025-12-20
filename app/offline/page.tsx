import React from 'react';
import Link from 'next/link';
import { WifiOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TryAgainButton from './TryAgainButton';

export const metadata = {
  title: 'Offline | ZIGEX',
  description: 'You are currently offline. Please check your internet connection.',
};
// trying to push....

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl transform scale-150"></div>
          <div className="relative bg-white dark:bg-slate-800 p-8 rounded-full border border-blue-100 dark:border-blue-900/50 shadow-xl">
            <WifiOff className="w-20 h-20 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            You're Offline
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            It seems like you've lost your connection. Don't worry, ZIGEX is still here! Please check your network and try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button 
            asChild
            variant="primary"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </Button>

          <TryAgainButton />
        </div>

        <div className="pt-8 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ZIGEX. Future Prospects at Your Fingertips.</p>
        </div>
      </div>
    </div>
  );
}
