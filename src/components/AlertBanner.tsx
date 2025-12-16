"use client";

import { SensorData } from "@/hooks/useWebSerial";
import { AlertCircle, Flame } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";

interface AlertBannerProps {
  data: SensorData | null;
}

export function AlertBanner({ data }: AlertBannerProps) {
  const [showGasAlert, setShowGasAlert] = useState(false);
  const [showTempAlert, setShowTempAlert] = useState(false);
  const [gasAlertTimer, setGasAlertTimer] = useState<NodeJS.Timeout | null>(null);
  const [tempAlertTimer, setTempAlertTimer] = useState<NodeJS.Timeout | null>(null);

  const ALERT_DURATION = 5000; // Keep alerts visible for 5 seconds minimum

  useEffect(() => {
    const gasAlert = data && data.gas > 300;
    const tempAlert = data && data.temp > 30;

    // Gas Alert Logic
    if (gasAlert && !showGasAlert) {
      // Trigger gas alert
      setShowGasAlert(true);
      
      // Clear any existing timer
      if (gasAlertTimer) {
        clearTimeout(gasAlertTimer);
      }
    } else if (gasAlert && showGasAlert) {
      // Alert is active and condition still true - clear timer to keep showing
      if (gasAlertTimer) {
        clearTimeout(gasAlertTimer);
        setGasAlertTimer(null);
      }
    } else if (!gasAlert && showGasAlert && !gasAlertTimer) {
      // Condition cleared but alert still showing - start dismiss timer
      const timer = setTimeout(() => {
        setShowGasAlert(false);
        setGasAlertTimer(null);
      }, ALERT_DURATION);
      setGasAlertTimer(timer);
    }

    // Temperature Alert Logic
    if (tempAlert && !showTempAlert) {
      // Trigger temp alert
      setShowTempAlert(true);
      
      // Clear any existing timer
      if (tempAlertTimer) {
        clearTimeout(tempAlertTimer);
      }
    } else if (tempAlert && showTempAlert) {
      // Alert is active and condition still true - clear timer to keep showing
      if (tempAlertTimer) {
        clearTimeout(tempAlertTimer);
        setTempAlertTimer(null);
      }
    } else if (!tempAlert && showTempAlert && !tempAlertTimer) {
      // Condition cleared but alert still showing - start dismiss timer
      const timer = setTimeout(() => {
        setShowTempAlert(false);
        setTempAlertTimer(null);
      }, ALERT_DURATION);
      setTempAlertTimer(timer);
    }

    // Cleanup timers on unmount
    return () => {
      if (gasAlertTimer) clearTimeout(gasAlertTimer);
      if (tempAlertTimer) clearTimeout(tempAlertTimer);
    };
  }, [data]);

  if (!showGasAlert && !showTempAlert) {
    return null;
  }

  return (
    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
      {showGasAlert && (
        <Alert variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <AlertTitle>Gas Leak Warning!</AlertTitle>
          <AlertDescription>
            Dangerous gas level detected: <strong>{data?.gas}</strong> (threshold: 300).
            Buzzer has been activated. Evacuate the area immediately!
          </AlertDescription>
        </Alert>
      )}

      {showTempAlert && (
        <Alert variant="destructive" className="border-orange-600 bg-orange-50 dark:bg-orange-950/30">
          <Flame className="h-4 w-4 animate-pulse" />
          <AlertTitle>Overheat Warning!</AlertTitle>
          <AlertDescription>
            High temperature detected: <strong>{data?.temp.toFixed(1)}°C</strong> (threshold: 30°C).
            Cooling fan has been activated automatically.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}