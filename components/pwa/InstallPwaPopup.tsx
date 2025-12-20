"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Download, X, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPwaPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if this session already dismissed it to avoid annoying them
    const hasBeenDismissedInSession = sessionStorage.getItem('pwa-session-dismissed');
    if (hasBeenDismissedInSession) {
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if not dismissed in this session
      if (!sessionStorage.getItem('pwa-session-dismissed')) {
        setTimeout(() => {
          setShowPopup(true);
        }, 5000); // 5 second delay for a better landing experience
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Manual check for iOS
    if (isIOSDevice && !sessionStorage.getItem('pwa-session-dismissed')) {
        setTimeout(() => {
            setShowPopup(true);
        }, 8000); // Longer delay for iOS since it's an instruction popup
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available yet');
      toast("Preparing your app... Please click install again in a moment or use the browser's plus icon.", {
        icon: '⏳',
        duration: 4000,
        style: {
          borderRadius: '16px',
          background: '#1e293b',
          color: '#fff',
          fontSize: '14px',
          padding: '16px',
        },
      });
      return;
    }
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        toast.success("Welcome to the ZIGEX Desktop experience!", {
          icon: '🚀',
          duration: 5000,
        });
      }
      
      // Reset the deferred prompt variable
      setDeferredPrompt(null);
      setShowPopup(false);
    } catch (err) {
      console.error('Error during installation:', err);
      toast.error("Installation task could not be completed. Please try the browser's manual install option.");
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowPopup(false);
    // Dismiss for the current session - won't show again until they reopen the tab/browser
    sessionStorage.setItem('pwa-session-dismissed', 'true');
    // Also set a permanent marker if needed, but session-based is what was requested
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-[90vw] sm:max-w-[425px] p-0 overflow-hidden border-none bg-transparent shadow-none outline-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-blue-50 dark:border-slate-800"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-[0.08] dark:opacity-20 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative p-7 sm:p-10 flex flex-col items-center text-center space-y-7">
                <button 
                  onClick={handleDismiss}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative mt-2">
                    <div className="absolute inset-0 bg-blue-600/15 blur-2xl rounded-full scale-125" />
                    <div className="relative bg-white dark:bg-slate-800 p-1 rounded-3xl shadow-xl border border-blue-50 dark:border-slate-800 overflow-hidden">
                        <img 
                          src="/logo.png" 
                          alt="Zigex Logo" 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl"
                        />
                    </div>
                </div>


                <div className="space-y-3 px-2">
                  <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Get the <span className="text-blue-600 dark:text-blue-400">ZIGEX</span> App
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-[280px] sm:max-w-none">
                    {isIOS 
                      ? "Install ZIGEX on your home screen for instant access, offline support and a smoother experience."
                      : "Add ZIGEX to your device for a native app experience and quick access to elite opportunities."}
                  </DialogDescription>
                </div>

                {isIOS ? (
                    <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/20 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center justify-center gap-2">
                            Quick Setup Guide
                        </p>
                        <div className="flex items-center justify-around gap-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium">1. Tap 'Share'</span>
                            </div>
                            <div className="h-[1px] w-8 bg-blue-100 dark:bg-blue-900/40 mt-[-20px]" />
                            <div className="flex flex-col items-center gap-1">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Download className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium">2. 'Add to Home'</span>
                            </div>
                        </div>
                    </div>
                ) : (
                  <div className="w-full space-y-4 pt-2">
                    <Button 
                        onClick={handleInstallClick}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none"
                    >
                        <Download className="w-5 h-5" />
                        Install App
                    </Button>
                    <button 
                        onClick={handleDismiss}
                        className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
                    >
                        Maybe later
                    </button>
                  </div>
                )}
                
                {isIOS && (
                    <button 
                        onClick={handleDismiss}
                        className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                    >
                        Got it!
                    </button>
                )}
              </div>

              {/* Version/Footer tag */}
              <div className="bg-slate-50 dark:bg-slate-800/40 py-4 px-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500">
                    Trusted by African Talents
                </p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
