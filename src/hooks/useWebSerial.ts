"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { featureFlags } from '@/lib/featureFlags';

export interface SensorData {
  gas: number;
  temp: number;
  hum: number;
  fan: boolean;
  buzzer: boolean;
  timestamp: number;
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  type: "alert" | "reading" | "system";
  severity: "critical" | "warning" | "info";
  sensor: string;
  message: string;
  value?: string;
  location: string;
}

export function useWebSerial() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const bufferRef = useRef<string>('');
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fan timing logic: track when fan turned on
  const fanTurnOnTimeRef = useRef<number | null>(null);
  const FAN_MIN_ON_TIME = 60000; // 1 minute in milliseconds
  
  // Prevent rapid state changes
  const lastAlertTimeRef = useRef<{ [key: string]: number }>({});
  const ALERT_DEBOUNCE = 5000; // 5 seconds between same alert type

  const addHistoryEvent = useCallback((event: Omit<HistoryEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const newEvent: HistoryEvent = {
      ...event,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };
    
    setHistoryEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
  }, []);

  const shouldShowAlert = useCallback((alertType: string): boolean => {
    const now = Date.now();
    const lastTime = lastAlertTimeRef.current[alertType] || 0;
    
    if (now - lastTime >= ALERT_DEBOUNCE) {
      lastAlertTimeRef.current[alertType] = now;
      return true;
    }
    return false;
  }, []);

  const calculateFanStatus = useCallback((temp: number, currentFan: boolean): boolean => {
    const now = Date.now();
    
    // If temperature > 30, turn fan ON
    if (temp > 30) {
      if (!currentFan) {
        // Fan is turning on
        fanTurnOnTimeRef.current = now;
      }
      return true;
    }
    
    // Temperature <= 30, check if fan should stay on
    if (currentFan && fanTurnOnTimeRef.current) {
      const elapsedTime = now - fanTurnOnTimeRef.current;
      
      // Keep fan on for at least 1 minute
      if (elapsedTime < FAN_MIN_ON_TIME) {
        return true; // Keep fan on
      }
    }
    
    // Turn fan off
    if (currentFan) {
      fanTurnOnTimeRef.current = null; // Reset timer
    }
    return false;
  }, []);

  const parseSerialLine = useCallback((line: string): SensorData | null => {
    try {
      // Parse format: "Gas: 250 | Temp: 28.4 | Humidity: 61"
      const gasMatch = line.match(/Gas:\s*(\d+\.?\d*)/i);
      const tempMatch = line.match(/Temp:\s*(\d+\.?\d*)/i);
      const humMatch = line.match(/Humidity:\s*(\d+\.?\d*)/i);

      if (!gasMatch || !tempMatch || !humMatch) {
        return null;
      }

      const gas = parseFloat(gasMatch[1]);
      const temp = parseFloat(tempMatch[1]);
      const hum = parseFloat(humMatch[1]);

      // Generate fan status with timing logic
      const currentFan = currentData?.fan || false;
      const fan = calculateFanStatus(temp, currentFan);

      // Generate buzzer status: ON if gas > 300
      const buzzer = gas > 300;

      return {
        gas,
        temp,
        hum,
        fan,
        buzzer,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error parsing serial line:', error);
      return null;
    }
  }, [currentData, calculateFanStatus]);

  const generateDemoData = useCallback((): SensorData => {
    // Generate realistic sensor data with some variation
    const baseGas = 200 + Math.random() * 150; // 200-350 range
    const baseTemp = 25 + Math.random() * 10; // 25-35°C range
    const baseHum = 50 + Math.random() * 20; // 50-70% range

    const gas = Math.round(baseGas);
    const temp = Math.round(baseTemp * 10) / 10;
    const hum = Math.round(baseHum);

    // Calculate fan with timing logic
    const currentFan = currentData?.fan || false;
    const fan = calculateFanStatus(temp, currentFan);
    const buzzer = gas > 300;

    return {
      gas,
      temp,
      hum,
      fan,
      buzzer,
      timestamp: Date.now(),
    };
  }, [currentData, calculateFanStatus]);

  const processNewData = useCallback((data: SensorData) => {
    setCurrentData(data);
    setHistory(prev => {
      const newHistory = [...prev, data];
      const maxPoints = 240;
      return newHistory.slice(-maxPoints);
    });

    // Add history events for significant changes
    if (data.gas > 300 && shouldShowAlert('gas')) {
      addHistoryEvent({
        type: "alert",
        severity: "critical",
        sensor: "Gas Sensor",
        message: "High gas concentration detected",
        value: `${data.gas} ppm`,
        location: "Lab Room A"
      });
    }

    if (data.temp > 30 && shouldShowAlert('temp-high')) {
      addHistoryEvent({
        type: "alert",
        severity: "warning",
        sensor: "Temperature",
        message: "Temperature above normal range",
        value: `${data.temp.toFixed(1)}°C`,
        location: "Main Hall"
      });
    }

    if (data.hum > 70 && shouldShowAlert('hum-high')) {
      addHistoryEvent({
        type: "alert",
        severity: "warning",
        sensor: "Humidity",
        message: "High humidity detected",
        value: `${data.hum}%`,
        location: "Main Hall"
      });
    }

    if (data.hum < 40 && shouldShowAlert('hum-low')) {
      addHistoryEvent({
        type: "alert",
        severity: "warning",
        sensor: "Humidity",
        message: "Low humidity detected",
        value: `${data.hum}%`,
        location: "Storage Area"
      });
    }
  }, [shouldShowAlert, addHistoryEvent]);

  const startDemoMode = useCallback(() => {
    if (!featureFlags.enableDemoMode) {
      toast.error('Demo mode is disabled in this deployment');
      return;
    }
    console.log('Starting demo mode...');
    setIsDemoMode(true);
    setIsConnected(true);
    toast.success('Demo mode activated! Simulating sensor data...');

    // Generate initial data
    const initialData = generateDemoData();
    processNewData(initialData);

    addHistoryEvent({
      type: "system",
      severity: "info",
      sensor: "System",
      message: "Demo mode started",
      location: "All Areas"
    });

    // Update every 500ms
    demoIntervalRef.current = setInterval(() => {
      const data = generateDemoData();
      processNewData(data);
    }, 500);
  }, [generateDemoData, processNewData, addHistoryEvent]);

  const stopDemoMode = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setIsDemoMode(false);
    setIsConnected(false);
    setCurrentData(null);
    fanTurnOnTimeRef.current = null; // Reset fan timer
    toast.info('Demo mode stopped');
  }, []);

  const readSerialData = useCallback(async () => {
    if (!portRef.current || !readerRef.current) return;

    try {
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) {
          break;
        }

        // Convert Uint8Array to string
        const text = new TextDecoder().decode(value);
        bufferRef.current += text;

        // Process complete lines
        const lines = bufferRef.current.split('\n');
        bufferRef.current = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            const data = parseSerialLine(trimmedLine);
            if (data) {
              processNewData(data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading serial data:', error);
      setIsConnected(false);
      toast.error('Connection lost. Please reconnect your device.');
    }
  }, [parseSerialLine, processNewData]);

  const connect = useCallback(async () => {
    if (!featureFlags.enableWebSerial) {
      toast.error('WebSerial is disabled in this deployment');
      return;
    }
    try {
      console.log('Attempting to connect to serial device...');
      
      // Check if WebSerial API is available
      if (!('serial' in navigator)) {
        console.error('WebSerial API not supported');
        toast.error('WebSerial API is not supported. Please use Chrome or Edge browser.');
        return;
      }

      // Check if running in iframe
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        console.warn('Running in iframe - WebSerial may be blocked');
        toast.error(
          'WebSerial is blocked in iframes. Please open this app in a new tab using the button below, or use Demo Mode to test the dashboard.',
          { duration: 6000 }
        );
        return;
      }

      console.log('WebSerial API available, requesting port...');
      
      // Request a port - this should open the browser dialog
      const port = await (navigator as any).serial.requestPort();
      console.log('Port selected:', port);
      
      console.log('Opening port with baudRate 9600...');
      await port.open({ baudRate: 9600 });
      console.log('Port opened successfully');

      portRef.current = port;
      setIsConnected(true);
      toast.success('Device connected successfully!');

      addHistoryEvent({
        type: "system",
        severity: "info",
        sensor: "System",
        message: "Device connected successfully",
        location: "All Areas"
      });

      // Start reading
      const reader = port.readable.getReader();
      readerRef.current = reader;
      console.log('Starting to read serial data...');
      readSerialData();
    } catch (error: any) {
      console.error('Error connecting to serial device:', error);
      
      // Handle specific error types
      if (error.name === 'NotFoundError') {
        toast.error('No device selected. Please try again and select your Arduino.');
      } else if (error.name === 'SecurityError') {
        toast.error('Connection blocked. Try opening this app in a new tab, or use Demo Mode.');
      } else if (error.message?.includes('User cancelled')) {
        // User closed the dialog - don't show error
        console.log('User cancelled device selection');
      } else {
        toast.error(`Failed to connect: ${error.message || 'Unknown error'}`);
      }
    }
  }, [readSerialData, addHistoryEvent]);

  const disconnect = useCallback(async () => {
    try {
      // Stop demo mode if active
      if (isDemoMode) {
        stopDemoMode();
        return;
      }

      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setIsConnected(false);
      bufferRef.current = '';
      fanTurnOnTimeRef.current = null; // Reset fan timer
      toast.info('Device disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Error disconnecting device');
    }
  }, [isDemoMode, stopDemoMode]);

  // Cleanup on unmount - ONLY when the provider itself unmounts (app closes)
  // Remove disconnect from dependencies to prevent cleanup on every re-render
  useEffect(() => {
    return () => {
      // Cleanup demo mode
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
      
      // Cleanup serial connection
      const cleanup = async () => {
        try {
          if (readerRef.current) {
            await readerRef.current.cancel();
          }
          if (portRef.current) {
            await portRef.current.close();
          }
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      };
      cleanup();
    };
  }, []); // Empty dependency array - only run on mount/unmount of provider

  return {
    isConnected,
    currentData,
    history,
    historyEvents,
    connect,
    disconnect,
    isDemoMode,
    startDemoMode,
    stopDemoMode,
  };
}