'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseSidebarReturn {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  isMobile: boolean;
}

export function useSidebar(): UseSidebarReturn {
  const [isOpen, setIsOpen] = useState(true); // Desktop-first approach
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-manage sidebar state based on screen size
      if (mobile) {
        setIsOpen(false); // Close on mobile by default
      } else {
        // On desktop, restore to open if it was auto-closed due to mobile
        setIsOpen(true);
      }
    };

    // Initial check only after component is mounted
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Remove isOpen dependency to prevent cycles

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close,
    isMobile
  };
}

// Hook for persistence (future enhancement)
export function useSidebarWithPersistence(key: string = 'sidebar-open'): UseSidebarReturn {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load from localStorage
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setIsOpen(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
  }, [key]);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsOpen(false);
      } else {
        // On desktop, restore from localStorage or default to open
        try {
          const saved = localStorage.getItem(key);
          if (saved !== null) {
            setIsOpen(JSON.parse(saved));
          } else {
            setIsOpen(true);
          }
        } catch (error) {
          setIsOpen(true);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, key]);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      // Save to localStorage only for desktop
      if (!isMobile) {
        try {
          localStorage.setItem(key, JSON.stringify(newState));
        } catch (error) {
          console.warn('Failed to save sidebar state to localStorage:', error);
        }
      }
      return newState;
    });
  }, [key, isMobile]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!isMobile) {
      try {
        localStorage.setItem(key, JSON.stringify(true));
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
    }
  }, [key, isMobile]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (!isMobile) {
      try {
        localStorage.setItem(key, JSON.stringify(false));
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
    }
  }, [key, isMobile]);

  return {
    isOpen,
    toggle,
    open,
    close,
    isMobile
  };
}
