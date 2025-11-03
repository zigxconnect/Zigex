"use client";

import { Menu, Bell, BellOff, BellRing } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl ||
    "/default-avatar.png";

  // Load subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/notifications/status");
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.subscribed || false);
        }
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      }
    };
    checkSubscription();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribe: !isSubscribed }),
      });

      if (!response.ok) throw new Error("Subscription update failed");

      setIsSubscribed(!isSubscribed);
      toast.success(
        !isSubscribed
          ? "🎉 Subscribed! You'll receive program updates."
          : "Unsubscribed from notifications."
      );
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-full mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center group flex-shrink-0 p-1 bg-[#cfc7c7] shadow-2xl rounded-full"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 transition-transform group-hover:scale-105">
              <Image
                src="/z3.png"
                alt="Zigex Logo"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right Side - Subscribe, Notifications & User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Subscribe Button - Enhanced Interactive Version */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              relative overflow-hidden flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm 
              transition-all duration-300 flex-shrink-0 transform
              ${
                isSubscribed
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              } 
              ${isLoading ? "opacity-70 cursor-not-allowed scale-95" : "cursor-pointer"}
              active:scale-95
            `}
            aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"}
          >
            {/* Animated background pulse */}
            <span
              className={`
                absolute inset-0 
                ${isSubscribed ? "bg-green-400" : "bg-blue-400"}
                ${isHovered && !isLoading ? "animate-ping opacity-20" : "opacity-0"}
              `}
            />

            {/* Shimmer effect */}
            <span
              className={`
                absolute inset-0 -translate-x-full
                bg-gradient-to-r from-transparent via-white/30 to-transparent
                ${isHovered && !isLoading ? "animate-shimmer" : ""}
              `}
              style={{
                animation: isHovered && !isLoading ? "shimmer 2s infinite" : "none",
              }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSubscribed ? (
                <BellRing
                  size={18}
                  className={`${isHovered ? "animate-bounce" : ""}`}
                />
              ) : (
                <BellOff
                  size={18}
                  className={`${isHovered ? "animate-wiggle" : ""}`}
                />
              )}
              <span className="hidden sm:inline font-bold">
                {isLoading
                  ? "..."
                  : isSubscribed
                  ? "Subscribed"
                  : "Subscribe"}
              </span>
            </span>

            {/* Particle effect on hover */}
            {isHovered && !isLoading && (
              <>
                <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Avatar & Info */}
          <div className="hidden md:flex items-center gap-3 ml-2 lg:ml-3 flex-shrink-0">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all duration-200">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to global styles or tailwind.config.js */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(5px, 20px) scale(0);
            opacity: 0;
          }
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        .animate-particle-1 {
          animation: particle-1 0.8s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 0.8s ease-out forwards;
          animation-delay: 0.1s;
        }

        .animate-particle-3 {
          animation: particle-3 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </header>
  );
};