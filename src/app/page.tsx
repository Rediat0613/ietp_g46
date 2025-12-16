"use client";

import { Navbar } from "@/components/Navbar";
import { LiveSensorCard } from "@/components/LiveSensorCard";
import { SystemStatusCards } from "@/components/SystemStatusCards";
import { RecentAlerts } from "@/components/RecentAlerts";
import { SensorCards } from "@/components/SensorCards";
import { SensorCharts } from "@/components/SensorCharts";
import { AlertBanner } from "@/components/AlertBanner";
import { Wind, Flame, Thermometer, Droplets, Usb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebSerialContext } from "@/contexts/WebSerialContext";
import { useEffect, useState } from "react";
import { featureFlags } from '@/lib/featureFlags';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const {
    isConnected,
    currentData,
    history,
    connect,
    disconnect,
    isDemoMode,
    startDemoMode,
  } = useWebSerialContext();

  const [isInIframe, setIsInIframe] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleOpenInNewTab = () => {
    const url = window.location.href;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      {/* Connection Controls */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium">
              {isDemoMode ? "Demo Mode" : isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          
          <div className="flex gap-2">
            {!isConnected && !isDemoMode && (
              <>
                  {featureFlags.enableWebSerial && (
                    <Button onClick={connect} variant="default" size="sm">
                  <Usb className="h-4 w-4 mr-2" />
                  Connect Device
                    </Button>
                  )}
                  {featureFlags.enableDemoMode && (
                <Button onClick={startDemoMode} variant="outline" size="sm">
                  Demo Mode
                </Button>
                  )}
                {isInIframe && (
                  <Button onClick={handleOpenInNewTab} variant="secondary" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </>
            )}
            {(isConnected || isDemoMode) && (
              <Button onClick={disconnect} variant="destructive" size="sm">
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Iframe Warning */}
        {isInIframe && !isConnected && !isDemoMode && (
          <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                ⚠️ WebSerial is blocked in iframes. Use <strong>Demo Mode</strong> to test, or <strong>Open in New Tab</strong> to connect a real device.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Alert Banners */}
        {(isConnected || isDemoMode) && <AlertBanner data={currentData} />}
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time laboratory monitoring</p>
        </div>

        {(isConnected || isDemoMode) ? (
          <>
            {/* Original Functional Sensor Cards */}
            <div className="mb-8">
              <SensorCards data={currentData} />
            </div>

            {/* Real-time Charts */}
            {history.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Real-time Charts</h2>
                <SensorCharts history={history} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Guardian Lab Live Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <LiveSensorCard
                icon={Wind}
                label="Gas Sensor"
                value="350.0"
                unit="ppm"
                status="Normal"
                location="Lab Room A"
                time={formatTime(currentTime)}
              />
              <LiveSensorCard
                icon={Flame}
                label="Smoke Sensor"
                value="279.4"
                unit="particles/m³"
                status="Normal"
                location="Main Hall"
                time={formatTime(currentTime)}
              />
              <LiveSensorCard
                icon={Thermometer}
                label="Temperature"
                value="22.4"
                unit="°C"
                status="Normal"
                location="Main Hall"
                time={formatTime(currentTime)}
              />
              <LiveSensorCard
                icon={Droplets}
                label="Humidity"
                value="62.3"
                unit="%"
                status="Normal"
                location="Main Hall"
                time={formatTime(currentTime)}
              />
            </div>
          </>
        )}

        {/* System Status Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <SystemStatusCards />
        </div>

        {/* Recent Alerts Section */}
        <div>
          <RecentAlerts />
        </div>
      </main>
    </div>
  );
}