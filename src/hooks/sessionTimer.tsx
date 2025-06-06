import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface SessionContextType {
  isUnlocked: boolean;
  unlock: () => void;
  lock: () => void;
  remainingTime: number; // in seconds
  extendSession: () => void;
  isWarning: boolean; // true when 5 minutes or less remaining
}

interface SessionProviderProps {
  children: ReactNode;
  sessionDuration?: number; // in milliseconds, default 30 minutes
  warningTime?: number; // in milliseconds, time before expiry to trigger warning
  onSessionExpired?: () => void;
  onWarning?: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSharedSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSharedSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  sessionDuration = 30 * 60 * 1000, // 30 minutes in milliseconds
  warningTime = 5 * 60 * 1000, // 5 minutes warning
  onSessionExpired,
  onWarning
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTriggeredRef = useRef(false);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the session timer
  const startTimer = useCallback(() => {
    clearTimers();
    sessionStartTimeRef.current = Date.now();
    warningTriggeredRef.current = false;
    setIsWarning(false);

    // Set main timeout for session expiry
    timeoutRef.current = setTimeout(() => {
      setIsUnlocked(false);
      setRemainingTime(0);
      setIsWarning(false);
      clearTimers();
      onSessionExpired?.();
    }, sessionDuration);

    // Set interval to update remaining time
    intervalRef.current = setInterval(() => {
      if (sessionStartTimeRef.current) {
        const elapsed = Date.now() - sessionStartTimeRef.current;
        const remaining = Math.max(0, sessionDuration - elapsed);
        const remainingSeconds = Math.floor(remaining / 1000);
        setRemainingTime(remainingSeconds);

        // Check if we should show warning
        const shouldWarn = remaining <= warningTime && remaining > 0;
        setIsWarning(shouldWarn);

        // Trigger warning callback if enabled and threshold reached
        if (!warningTriggeredRef.current && shouldWarn) {
          warningTriggeredRef.current = true;
          onWarning?.();
        }

        // Clear interval when time is up
        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      }
    }, 1000);

    // Set initial remaining time
    setRemainingTime(Math.floor(sessionDuration / 1000));
  }, [sessionDuration, warningTime, onSessionExpired, onWarning, clearTimers]);

  // Unlock function
  const unlock = useCallback(() => {
    setIsUnlocked(true);
    startTimer();
  }, [startTimer]);

  // Lock function
  const lock = useCallback(() => {
    setIsUnlocked(false);
    setRemainingTime(0);
    setIsWarning(false);
    clearTimers();
    sessionStartTimeRef.current = null;
  }, [clearTimers]);

  // Extend session function
  const extendSession = useCallback(() => {
    if (isUnlocked) {
      startTimer(); // Restart the timer
    }
  }, [isUnlocked, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Handle visibility change (optional: pause timer when tab is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isUnlocked) {
        // Optionally pause the timer when tab is hidden
        // For now, we'll let it continue running
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUnlocked]);

  const value: SessionContextType = {
    isUnlocked,
    unlock,
    lock,
    remainingTime,
    extendSession,
    isWarning
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};