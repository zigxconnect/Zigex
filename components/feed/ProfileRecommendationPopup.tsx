"use client"

import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, User2 } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/app/types/type';

interface WelcomeCardProps {
  user: UserProfile | any;
  onProfileUpdated?: () => void;
  profile?: any;
}

export default function ProfileRecommendationPopup({user}: WelcomeCardProps) {
  console.log("User in ProfileRecommendationPopup:", user);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
    const coverImageUrl = user?.avatarUrl || "/ar.png";

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('zigex_profile_popup_seen');
    console.log("user is :", user);
    
    if (!hasSeenPopup) {
      // Show popup after a brief delay for smooth entrance
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 800);
    }
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleViewProfile = () => {
    // Mark as seen and redirect
    localStorage.setItem('zigex_profile_popup_seen', 'true');
    window.location.href = `/profile/${user?.profile?.username || ""}`;
  };

  const handleDismiss = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Dark Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header with close button */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute cursor-pointer top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                {coverImageUrl ? (
                     <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {/* <User className="w-8 h-8 text-white" /> */}
                  <Image src={coverImageUrl} alt='avatar' fill className='rounded-full' objectFit='cover'/>
                </div>
                ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                )}
               
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
             {user.name}  Get personalized feeds
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center leading-relaxed">
              Navigate to your profile section to set your preferences and interests. We'll use this to show you opportunities, events, and programs that match what you're looking for.
            </p>
          </div>

          {/* Benefits list */}
          <div className="px-6 pb-4 space-y-3">
            {[
              'See opportunities that match your skills',
              'Get priority notifications for relevant posts',
              'Build your professional network faster'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={handleViewProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-full transition-colors cursor-pointer shadow-sm"
            >
              Go to profile
            </button>
            <button
              onClick={handleDismiss}
              className="w-full text-gray-600 hover:text-gray-900 font-medium py-3 px-4 rounded-full transition-colors hover:bg-gray-50"
            >
              Maybe later
            </button>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-2xl" />
        </div>
      </div>
    </>
  );
}