"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useAdminSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminLayoutProvider");
  }
  return context;
};

export const AdminLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { setTheme } = useTheme();

  // Force light theme in admin layout
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const checkScreenSize = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    // On first load or resize, only force close if mobile
    if (mobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  // Close sidebar automatically when route changes on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]); // Removed isOpen from dependency to prevent unnecessary triggers

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, isMobile, toggleSidebar, closeSidebar }}
    >
      <div className="min-h-screen bg-[#F6F8FF] selection:bg-primary/10 selection:text-primary">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

