"use client"

import React, { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/app/types/type';

interface WelcomeCardProps {
  user: UserProfile | any;
  onProfileUpdated?: () => void;
  profile?: any;
}

export default function ProfileRecommendationPopup({ user }: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const coverImageUrl = user?.avatarUrl;

  useEffect(() => {
    // Check if user has seen the popup recently (within 3 days)
    const lastSeen = localStorage.getItem('zigex_profile_popup_last_seen');
    const now = new Date().getTime();
    const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

    if (!lastSeen || (now - parseInt(lastSeen, 10) > threeDaysInMillis)) {
      // Show popup after a brief delay for smooth entrance
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 800);
    }
  }, []);

  const updateLastSeen = () => {
    localStorage.setItem('zigex_profile_popup_last_seen', new Date().getTime().toString());
  };

  const handleClose = () => {
    setIsAnimating(false);
    updateLastSeen();
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleViewProfile = () => {
    updateLastSeen();
    window.location.href = `/profile/${user?.profile?.username || "username"}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Dark Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className={`bg-card border border-border rounded-xl shadow-lg max-w-md w-full pointer-events-auto transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header with close button */}
          <div className="relative p-6 px-8 pb-2 pt-8 flex flex-col items-center">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon/Avatar */}
            <div className="mb-6">
              <div className="relative w-20 h-20 rounded-full border-4 border-background shadow-sm overflow-hidden bg-muted flex items-center justify-center">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground text-center mb-2">
              Get personalized feeds
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-center text-sm leading-relaxed px-4">
              Navigate to your profile to set your preferences. We'll show you opportunities that match what you're looking for.
            </p>
          </div>

          {/* Benefits list */}
          <div className="px-8 py-4 space-y-3">
            {[
              'See opportunities that match your skills',
              'Get priority notifications',
              'Build your network faster'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={handleViewProfile}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm"
            >
              Go to profile
            </button>
            <button
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors hover:bg-muted text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}