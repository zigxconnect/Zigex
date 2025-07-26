"use client"

import Link from "next/link";
import { Logo } from "@/app/_components/ui/Logo";
import { Button } from "@/app/_components/ui/Button";
import { User, Upload, Briefcase, LogOut, X, ChevronRight } from "lucide-react";
import { Tag } from "@/app/_components/ui/Tag";
import { useState, useEffect } from "react";

// Mock data - this would come from a user session
const userData = {
  name: "John Kamdem",
  university: "University of Bamenda",
  avatar: "JK",
  skills: ["JavaScript", "React", "Python", "UI/UX Design"],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeRoute?: string;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  onClose,
  activeRoute = "/applied-internships" 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { href: "/profile-settings", icon: User, label: "Profile Settings" },
    { href: "/upload-resume", icon: Upload, label: "Upload Resume" },
    { 
      href: "/applied-internships", 
      icon: Briefcase, 
      label: "Applied Internships",
      badge: 5 
    },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          w-72 flex-col bg-white
          fixed md:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex md:flex
          shadow-xl
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 h-[89px] border-b border-gray-200">
          <Logo />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center mt-6 md:mt-4 text-center px-6">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-800 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold transition-transform duration-200 group-hover:scale-105 shadow-lg">
              {userData.avatar}
            </div>
            <div className="absolute inset-0 bg-blue-800 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          </div>
          
          <h2 className="mt-4 text-lg md:text-xl font-semibold text-gray-900 leading-tight">
            {userData.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-full break-words">
            {userData.university}
          </p>
          
          {/* Online Status Indicator */}
          <div className="flex items-center mt-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-6 px-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.skills.map((skill, index) => (
              <Tag 
                key={skill}
                className="transform transition-transform duration-200 hover:scale-105"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    group flex items-center justify-between px-3 py-3 rounded-lg
                    transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'text-blue-700 bg-blue-50 font-semibold shadow-sm border-r-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon 
                      size={20} 
                      className={`
                        transition-colors duration-200 flex-shrink-0
                        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                      `}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`
                        inline-flex items-center justify-center px-2 py-1 
                        text-xs font-medium rounded-full min-w-[1.25rem] h-5
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight 
                      size={16} 
                      className={`
                        transition-all duration-200
                        ${isActive 
                          ? 'text-blue-600 rotate-90' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                        }
                      `}
                    />
                  </div>
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="mt-auto p-6">
          <Button 
            variant="secondary" 
            className="w-full justify-start gap-3 group hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            onClick={handleLinkClick}
          >
            <LogOut 
              size={20} 
              className="group-hover:text-red-600 transition-colors duration-200" 
            />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};