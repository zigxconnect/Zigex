"use client";

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// Define the shape of the context
interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Create the context with a default value
const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  isMobile: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

// Custom hook for easy access to the context
export const useAdminSidebar = () => useContext(SidebarContext);

// The provider component
export const AdminLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Effect to handle screen resizing for mobile view
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Automatically close sidebar on mobile, open on desktop
      setIsOpen(!mobile);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Effect to close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen, isMobile, toggleSidebar, closeSidebar }}
    >
      <div className="min-h-screen bg-gray-50/50">{children}</div>
    </SidebarContext.Provider>
  );
};
