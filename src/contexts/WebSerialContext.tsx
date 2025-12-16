"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useWebSerial } from '@/hooks/useWebSerial';
import type { SensorData, HistoryEvent } from '@/hooks/useWebSerial';

interface WebSerialContextType {
  isConnected: boolean;
  currentData: SensorData | null;
  history: SensorData[];
  historyEvents: HistoryEvent[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isDemoMode: boolean;
  startDemoMode: () => void;
  stopDemoMode: () => void;
}

const WebSerialContext = createContext<WebSerialContextType | undefined>(undefined);

export function WebSerialProvider({ children }: { children: ReactNode }) {
  const webSerial = useWebSerial();

  return (
    <WebSerialContext.Provider value={webSerial}>
      {children}
    </WebSerialContext.Provider>
  );
}

export function useWebSerialContext() {
  const context = useContext(WebSerialContext);
  if (context === undefined) {
    throw new Error('useWebSerialContext must be used within a WebSerialProvider');
  }
  return context;
}
